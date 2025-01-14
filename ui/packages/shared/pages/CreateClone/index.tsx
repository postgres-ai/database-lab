import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useTimer } from 'use-timer'
import { Paper, FormControlLabel, Checkbox } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'

import { StubSpinner } from '@postgres.ai/shared/components/StubSpinnerFlex'
import { TextField } from '@postgres.ai/shared/components/TextField'
import { Select } from '@postgres.ai/shared/components/Select'
import { Button } from '@postgres.ai/shared/components/Button'
import { Spinner } from '@postgres.ai/shared/components/Spinner'
import { ErrorStub } from '@postgres.ai/shared/components/ErrorStub'
import { round } from '@postgres.ai/shared/utils/numbers'
import { formatBytesIEC } from '@postgres.ai/shared/utils/units'
import { SectionTitle } from '@postgres.ai/shared/components/SectionTitle'
import { SyntaxHighlight } from '@postgres.ai/shared/components/SyntaxHighlight'
import {
  MIN_ENTROPY,
  getEntropy,
  validatePassword,
} from '@postgres.ai/shared/helpers/getEntropy'

import { Snapshot } from 'types/api/entities/snapshot'
import { useCreatedStores, MainStoreApi } from './useCreatedStores'
import { useForm, FormValues } from './useForm'
import { getCliCloneStatus, getCliCreateCloneCommand } from './utils'
import { compareSnapshotsDesc } from '@postgres.ai/shared/utils/snapshot'

import styles from './styles.module.scss'

type Host = {
  instanceId: string
  routes: {
    clone: (cloneId: string) => string
  }
  api: MainStoreApi
  elements: {
    breadcrumbs: React.ReactNode
  }
}

type Props = Host

export const CreateClone = observer((props: Props) => {
  const history = useHistory()
  const stores = useCreatedStores(props.api)
  const timer = useTimer()
  const [branchesList, setBranchesList] = useState<string[]>([])
  const [snapshots, setSnapshots] = useState([] as Snapshot[])

  // Form.
  const onSubmit = async (values: FormValues) => {
    if (!values.dbPassword || getEntropy(values.dbPassword) < MIN_ENTROPY) {
      formik.setFieldError(
        'dbPassword',
        validatePassword(values.dbPassword, MIN_ENTROPY),
      )
      return
    }

    timer.start()

    const isSuccess = await stores.main.createClone(values)

    formik.setFieldError('dbPassword', '')

    if (!isSuccess || stores.main.cloneError) {
      timer.pause()
      timer.reset()
    }
  }

  const fetchBranchSnapshotsData = async (branchName: string) => {
    const snapshotsRes =
      (await stores.main.getBranchSnapshots(branchName)) ?? []
    setSnapshots(snapshotsRes)
    formik.setFieldValue('snapshotId', snapshotsRes[0]?.id)
  }

  const handleSelectBranch = async (
    e: React.ChangeEvent<{ value: string }>,
  ) => {
    const selectedBranch = e.target.value
    formik.setFieldValue('branch', selectedBranch)

    if (props.api.getBranchSnapshots) {
      await fetchBranchSnapshotsData(selectedBranch)
    }
  }

  const formik = useForm(onSubmit)

  const fetchData = async () => {
    try {
      await stores.main.load(props.instanceId)

      const branches = (await stores.main.getBranches()) ?? []
      const initiallySelectedBranch = branches[0]?.name
      setBranchesList(branches.map((branch) => branch.name))
      formik.setFieldValue('branch', initiallySelectedBranch)

      if (props.api.getBranchSnapshots) {
        await fetchBranchSnapshotsData(initiallySelectedBranch)
      } else {
        const allSnapshots = stores.main?.snapshots?.data ?? []
        setSnapshots(allSnapshots)
        const [firstSnapshot] = allSnapshots ?? []
        formik.setFieldValue('snapshotId', firstSnapshot?.id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Initial loading data.
  useEffect(() => {
    fetchData()
  }, [])

  // Redirect when clone is created and stable.
  useEffect(() => {
    if (!stores.main.clone || !stores.main.isCloneStable) return

    history.push(props.routes.clone(stores.main.clone.id))
  }, [stores.main.clone, stores.main.isCloneStable])

  const headRendered = (
    <>
      {/* //TODO: make global reset styles. */}
      <style>{'p { margin: 0; }'}</style>

      {props.elements.breadcrumbs}
    </>
  )

  // Initial loading spinner.
  if (!stores.main.instance)
    return (
      <>
        {headRendered}

        <StubSpinner />
      </>
    )

  // Instance/branches getting error.
  if (
    stores.main.instanceError ||
    stores.main.getBranchesError ||
    stores.main.getBranchSnapshotsError ||
    stores.main?.snapshots?.error
  )
    return (
      <>
        {headRendered}

        <ErrorStub
          message={
            stores.main.instanceError ||
            stores.main.getBranchesError?.message ||
            stores.main.getBranchSnapshotsError?.message ||
            (stores.main?.snapshots?.error as string)
          }
        />
      </>
    )

  const isCloneUnstable = Boolean(
    stores.main.clone && !stores.main.isCloneStable,
  )
  const isCreatingClone = formik.isSubmitting || isCloneUnstable

  return (
    <>
      {headRendered}
      <div className={styles.container}>
        <div className={styles.form}>
          <SectionTitle tag="h1" level={1} text="Create clone" />
          <div className={styles.section}>
            {branchesList && branchesList.length > 0 && (
              <Select
                fullWidth
                label="Branch"
                value={formik.values.branch}
                disabled={!branchesList || isCreatingClone}
                onChange={handleSelectBranch}
                error={Boolean(formik.errors.branch)}
                items={
                  branchesList?.map((snapshot) => {
                    return {
                      value: snapshot,
                      children: snapshot,
                    }
                  }) ?? []
                }
              />
            )}

            <TextField
              fullWidth
              label="Clone ID"
              value={formik.values.cloneId}
              onChange={(e) => formik.setFieldValue('cloneId', e.target.value)}
              error={Boolean(formik.errors.cloneId)}
              disabled={isCreatingClone}
            />

            <Select
              fullWidth
              label="Data state time *"
              value={formik.values.snapshotId}
              disabled={!snapshots || isCreatingClone}
              onChange={(e) =>
                formik.setFieldValue('snapshotId', e.target.value)
              }
              error={Boolean(formik.errors.snapshotId)}
              items={
                snapshots
                  .slice()
                  .sort(compareSnapshotsDesc)
                  .map((snapshot, i) => {
                    const isLatest = i === 0
                    return {
                      value: snapshot.id,
                      children: (
                        <>
                          {snapshot.dataStateAt}
                          {isLatest && (
                            <span className={styles.snapshotTag}>Latest</span>
                          )}
                        </>
                      ),
                    }
                  }) ?? []
              }
            />

            <p className={styles.remark}>
              By default latest snapshot of database is used. You can
              select&nbsp; different snapshots if earlier database state is
              needed.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.title}>Database credentials *</h2>

            <p className={styles.text}>
              Set custom credentials for the new clone. Save the password in
              reliable place, it can’t be read later.
            </p>

            <TextField
              fullWidth
              label="Database username *"
              value={formik.values.dbUser}
              onChange={(e) => formik.setFieldValue('dbUser', e.target.value)}
              error={Boolean(formik.errors.dbUser)}
              disabled={isCreatingClone}
            />

            <TextField
              fullWidth
              label="Database password *"
              type="password"
              value={formik.values.dbPassword}
              onChange={(e) => {
                formik.setFieldValue('dbPassword', e.target.value)

                if (formik.errors.dbPassword) {
                  formik.setFieldError('dbPassword', '')
                }
              }}
              error={Boolean(formik.errors.dbPassword)}
              disabled={isCreatingClone}
            />
            <p
              className={cn(
                formik.errors.dbPassword && styles.error,
                styles.remark,
              )}
            >
              {formik.errors.dbPassword}
            </p>
          </div>

          <div className={styles.form}>
            <FormControlLabel
              label="Enable deletion protection"
              control={
                <Checkbox
                  checked={formik.values.isProtected}
                  onChange={(e) =>
                    formik.setFieldValue('isProtected', e.target.checked)
                  }
                  name="protected"
                  disabled={isCreatingClone}
                />
              }
            />

            <p className={styles.remark}>
              When enabled no one can destroy this clone and automated deletion
              is also disabled.
              <br />
              Please be careful: abandoned clones with this checkbox enabled may
              cause out-of-disk-space events. Check disk space on daily basis
              and destroy this clone once the work is done.
            </p>
          </div>

          <div className={cn(styles.marginBottom, styles.section)}>
            <Paper className={styles.summary}>
              <InfoIcon className={styles.summaryIcon} />

              <div className={styles.params}>
                <p className={styles.param}>
                  <span>Data size:</span>
                  <strong>
                    {stores.main.instance.state?.dataSize
                      ? formatBytesIEC(stores.main.instance.state.dataSize)
                      : '-'}
                  </strong>
                </p>

                <p className={styles.param}>
                  <span>Expected cloning time:</span>
                  <strong>
                    {round(
                      stores.main.instance.state?.cloning
                        .expectedCloningTime as number,
                      2,
                    )}{' '}
                    s
                  </strong>
                </p>
              </div>
            </Paper>
            {stores.main.cloneError && (
              <div className={cn(styles.marginBottom, styles.section)}>
                <ErrorStub message={stores.main.cloneError} />
              </div>
            )}
            <div className={styles.controls}>
              <Button
                onClick={formik.submitForm}
                variant="primary"
                size="medium"
                isDisabled={isCreatingClone}
              >
                Create clone
                {isCreatingClone && (
                  <Spinner size="sm" className={styles.spinner} />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.snippetContainer}>
            <SectionTitle
              className={styles.title}
              tag="h1"
              level={1}
              text="The same using CLI"
            />
            <p className={styles.text}>
              Alternatively, you can create a new clone using CLI. Fill the
              form, copy the command below and paste it into your terminal.
            </p>
            <SyntaxHighlight
              wrapLines
              content={getCliCreateCloneCommand(formik.values)}
            />

            <SectionTitle
              className={styles.title}
              tag="h2"
              level={2}
              text="Check clone status"
            />
            <p className={styles.text}>
              To check the status of your newly created clone, use the command
              below.
            </p>
            <SyntaxHighlight
              content={getCliCloneStatus(formik.values.cloneId)}
            />
          </div>
        </div>
      </div>
    </>
  )
})
