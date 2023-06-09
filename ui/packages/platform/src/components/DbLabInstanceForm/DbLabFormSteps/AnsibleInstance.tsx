import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { makeStyles, Button } from '@material-ui/core'

import { Spinner } from '@postgres.ai/shared/components/Spinner'
import { ErrorStub } from '@postgres.ai/shared/components/ErrorStub'
import { SyntaxHighlight } from '@postgres.ai/shared/components/SyntaxHighlight'

import { getOrgKeys } from 'api/cloud/getOrgKeys'
import { getCloudImages } from 'api/cloud/getCloudImages'

import {
  getGcpAccountContents,
  getPlaybookCommandWithoutDocker,
} from 'components/DbLabInstanceForm/utils'
import {
  cloneRepositoryCommand,
  getAnsibleInstallationCommand,
} from 'components/DbLabInstanceInstallForm/utils'
import { InstanceFormCreation } from 'components/DbLabInstanceForm/DbLabFormSteps/InstanceFormCreation'

import { initialState } from '../reducer'

export const formStyles = makeStyles({
  marginTop: {
    marginTop: '20px',
  },
  marginBottom: {
    marginBottom: '20px',
    display: 'block',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontWeight: 600,
    fontSize: '15px',
    margin: '10px 0',
  },
  code: {
    backgroundColor: '#eee',
    borderRadius: '3px',
    padding: '0 3px',
    marginLeft: '0.25em',
  },
  ul: {
    paddingInlineStart: '30px',
  },
  important: {
    fontWeight: 600,
    margin: 0,
  },
})

export const InstanceDocumentation = ({
  fistStep,
  firsStepDescription,
  documentation,
  secondStep,
  snippetContent,
  classes,
}: {
  fistStep: string
  firsStepDescription?: React.ReactNode
  documentation: string
  secondStep: React.ReactNode
  snippetContent: string
  classes: ReturnType<typeof formStyles>
}) => (
  <>
    <p className={classes.title}>1. {fistStep}</p>
    {firsStepDescription && <p>{firsStepDescription}</p>}
    <p className={classes.marginBottom}>
      Documentation:{' '}
      <a href={documentation} target="_blank" rel="noreferrer">
        {documentation}
      </a>
    </p>
    <p className={classes.title}>2. Export {secondStep}</p>
    <SyntaxHighlight content={snippetContent} />
  </>
)

export const AnsibleInstance = ({
  state,
  orgId,
  goBack,
  goBackToForm,
  formStep,
  setFormStep,
}: {
  state: typeof initialState
  orgId: number
  goBack: () => void
  goBackToForm: () => void
  formStep: string
  setFormStep: (step: string) => void
}) => {
  const classes = formStyles()
  const [orgKey, setOrgKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cloudImages, setCloudImages] = useState([])
  const [orgKeyError, setOrgKeyError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getOrgKeys(orgId).then((data) => {
      if (data.error !== null || !Array.isArray(data.response)) {
        setIsLoading(false)
        setOrgKeyError(true)
      } else {
        setOrgKeyError(false)
        setOrgKey(data.response[0].value)
      }
    })
    getCloudImages({
      os_name: 'Ubuntu',
      os_version: '22.04%20LTS',
      arch: state.instanceType.arch,
      cloud_provider: state.provider,
      region: state.provider === 'aws' ? state.location.native_code : 'all',
    }).then((data) => {
      setIsLoading(false)
      setOrgKeyError(false)
      setCloudImages(data.response)
    })
  }, [
    orgId,
    state.instanceType.arch,
    state.location.native_code,
    state.provider,
  ])

  const AnsibleInstallation = () => (
    <>
      <p className={classes.title}>
        3. Install Ansible on your working machine (which could easily be a
        laptop)
      </p>
      <p>example of installing the latest version:</p>
      <SyntaxHighlight content={getAnsibleInstallationCommand()} />
      <span className={classes.marginBottom}>
        for more instructions on installing ansible, see{' '}
        <a
          target="_blank"
          href="https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html"
          rel="noreferrer"
        >
          here
        </a>
        .
      </span>
      <p className={classes.title}>4. Clone the dle-se-ansible repository</p>
      <SyntaxHighlight content={cloneRepositoryCommand()} />
      <p className={classes.title}>5. Install requirements</p>
      <SyntaxHighlight content={'ansible-galaxy install -r requirements.yml'} />
    </>
  )

  return (
    <InstanceFormCreation formStep={formStep} setFormStep={setFormStep}>
      {isLoading ? (
        <span className={classes.spinner}>
          <Spinner />
        </span>
      ) : (
        <>
          {orgKeyError ? (
            <ErrorStub
              title="Error 404"
              message="Unexpected error occurred. Please try again later"
            />
          ) : state.provider === 'digitalocean' ? (
            <InstanceDocumentation
              fistStep="Create Personal Access Token"
              documentation="https://docs.digitalocean.com/reference/api/create-personal-access-token"
              secondStep={
                <>
                  <code className={classes.code}>DO_API_TOKEN</code>
                </>
              }
              snippetContent="export DO_API_TOKEN=XXXXXX"
              classes={classes}
            />
          ) : state.provider === 'hetzner' ? (
            <InstanceDocumentation
              fistStep="Create API Token"
              documentation="https://docs.hetzner.com/cloud/api/getting-started/generating-api-token"
              secondStep={
                <code className={classes.code}>HCLOUD_API_TOKEN</code>
              }
              snippetContent="export HCLOUD_API_TOKEN=XXXXXX"
              classes={classes}
            />
          ) : state.provider === 'aws' ? (
            <InstanceDocumentation
              fistStep="Create access key"
              documentation="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
              secondStep={
                <>
                  <code className={classes.code}>AWS_ACCESS_KEY_ID </code> and
                  <code className={classes.code}>AWS_SECRET_ACCESS_KEY</code>
                </>
              }
              snippetContent={`export AWS_ACCESS_KEY_ID=XXXXXX\nexport AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXX`}
              classes={classes}
            />
          ) : state.provider === 'gcp' ? (
            <InstanceDocumentation
              fistStep="Create a service account"
              documentation="https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount"
              secondStep={
                <code className={classes.code}>
                  GCP_SERVICE_ACCOUNT_CONTENTS
                </code>
              }
              snippetContent={getGcpAccountContents()}
              classes={classes}
            />
          ) : null}
          <AnsibleInstallation />
          <p className={classes.title}>
            6. Run ansible playbook to create server and install DLE SE
          </p>
          <SyntaxHighlight
            content={getPlaybookCommandWithoutDocker(
              state,
              cloudImages[0],
              orgKey,
            )}
          />
          <p className={classes.title}>
            7. After the code snippet runs successfully, follow the directions
            displayed in the resulting output to start using DLE AUI/API/CLI.
          </p>
          <Box
            sx={{
              display: 'flex',
              gap: '10px',
              margin: '20px 0',
            }}
          >
            <Button variant="contained" color="primary" onClick={goBack}>
              See list of instances
            </Button>
            <Button variant="outlined" color="secondary" onClick={goBackToForm}>
              Back to form
            </Button>
          </Box>
        </>
      )}
    </InstanceFormCreation>
  )
}
