/*--------------------------------------------------------------------------
 * Copyright (c) 2019-2021, Postgres.ai, Nikolay Samokhvalov nik@postgres.ai
 * All Rights Reserved. Proprietary and confidential.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 *--------------------------------------------------------------------------
 */

import {
  Button,
  InputAdornment,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from '@material-ui/core'
import { Box } from '@mui/material'
import cn from 'classnames'

import { ClassesType } from '@postgres.ai/platform/src/components/types'
import { Select } from '@postgres.ai/shared/components/Select'
import { Spinner } from '@postgres.ai/shared/components/Spinner'
import { StubSpinner } from '@postgres.ai/shared/components/StubSpinnerFlex'

import { CloudInstance } from 'api/cloud/getCloudInstances'
import { CloudProvider } from 'api/cloud/getCloudProviders'
import { CloudRegion } from 'api/cloud/getCloudRegions'
import { CloudVolumes } from 'api/cloud/getCloudVolumes'
import { TabPanel } from 'pages/JoeSessionCommand/TabPanel'

import { ConsoleBreadcrumbsWrapper } from 'components/ConsoleBreadcrumbs/ConsoleBreadcrumbsWrapper'
import { AnsibleInstance } from 'components/DbLabInstanceForm/DbLabFormSteps/AnsibleInstance'
import { DbLabInstanceFormSidebar } from 'components/DbLabInstanceForm/DbLabInstanceFormSidebar'
import { StorageSlider } from 'components/DbLabInstanceForm/DbLabInstanceFormSlider'
import { DbLabInstanceFormProps } from 'components/DbLabInstanceForm/DbLabInstanceFormWrapper'
import { initialState, reducer } from 'components/DbLabInstanceForm/reducer'
import { WarningWrapper } from 'components/Warning/WarningWrapper'
import { DockerInstance } from './DbLabFormSteps/DockerInstance'
import { SimpleInstance } from './DbLabFormSteps/SimpleInstance'

import {
  availableTags,
  filteredRegions,
  uniqueRegionsByProvider,
} from 'components/DbLabInstanceForm/utils'

import urls from 'utils/urls'
import { validateDLEName } from 'utils/utils'

import { useCloudProvider } from 'hooks/useCloudProvider'
import ConsolePageTitle from './../ConsolePageTitle'

interface DbLabInstanceFormWithStylesProps extends DbLabInstanceFormProps {
  classes: ClassesType
  auth?: {
    userId: number
  }
}

const DbLabInstanceForm = (props: DbLabInstanceFormWithStylesProps) => {
  const { classes, orgPermissions } = props
  const {
    state,
    dispatch,
    handleChangeVolume,
    handleGenerateToken,
    handleReturnToForm,
    handleSetFormStep,
  } = useCloudProvider({
    initialState,
    reducer,
  })
  const permitted = !orgPermissions || orgPermissions.dblabInstanceCreate

  const pageTitle = <ConsolePageTitle title="Create DBLab" />
  const breadcrumbs = (
    <ConsoleBreadcrumbsWrapper
      {...props}
      breadcrumbs={[
        { name: 'Database Lab Instances', url: 'instances' },
        { name: 'Create DBLab' },
      ]}
    />
  )

  const handleReturnToList = () => {
    props.history.push(urls.linkDbLabInstances(props))
  }

  const requirePublicKeys =
    !state.publicKeys && (state.provider === 'aws' || state.provider === 'gcp')

  const calculateVolumePrice = (databaseSize: number, snapshots: number) => {
    let storage = databaseSize * snapshots
    if (storage > 2000) storage = 2000

    return (storage * state.volumePricePerHour) / 1000
  }

  if (state.isLoading) return <StubSpinner />

  return (
    <div className={classes.root}>
      {breadcrumbs}

      {pageTitle}

      {!permitted && (
        <WarningWrapper>
          You do not have permission to add Database Lab instances.
        </WarningWrapper>
      )}

      <div
        className={cn(
          classes.container,
          state.isReloading && classes.backgroundOverlay,
        )}
      >
        {state.formStep === initialState.formStep && permitted ? (
          <>
            {state.isReloading && (
              <Spinner className={classes.absoluteSpinner} />
            )}
            <div className={classes.form}>
              <p className={classes.sectionTitle}>
                1. Select your cloud provider
              </p>
              <div className={classes.providerFlex}>
                {state.serviceProviders.map(
                  (provider: CloudProvider, index: number) => (
                    <div
                      className={cn(
                        classes.provider,
                        state.provider === provider.api_name &&
                          classes.activeBorder,
                      )}
                      key={index}
                      onClick={() =>
                        dispatch({
                          type: 'change_provider',
                          provider: provider.api_name,
                          isReloading: true,
                        })
                      }
                    >
                      <img
                        src={`/images/service-providers/${provider.api_name}.png`}
                        width={85}
                        height="auto"
                        alt={provider.label}
                      />
                    </div>
                  ),
                )}
              </div>
              <p className={classes.sectionTitle}>
                2. Select your cloud region
              </p>
              <div className={classes.sectionContainer}>
                <Tabs
                  value={state.region}
                  onChange={(_: React.ChangeEvent<{}> | null, value: string) =>
                    dispatch({
                      type: 'change_region',
                      region: value,
                      location: state.cloudRegions.find(
                        (region: CloudRegion) =>
                          region.world_part === value &&
                          region.cloud_provider === state.provider,
                      ),
                    })
                  }
                >
                  {uniqueRegionsByProvider(state.cloudRegions).map(
                    (region: string, index: number) => (
                      <Tab
                        key={index}
                        label={region}
                        value={region}
                        className={classes.tab}
                      />
                    ),
                  )}
                </Tabs>
              </div>
              <TabPanel value={state.region} index={state.region}>
                {filteredRegions(state.cloudRegions, state.region).map(
                  (region: CloudRegion, index: number) => (
                    <div
                      key={index}
                      className={cn(
                        classes.serviceLocation,
                        state.location?.api_name === region?.api_name &&
                          classes.activeBorder,
                      )}
                      onClick={() =>
                        dispatch({
                          type: 'change_location',
                          location: region,
                        })
                      }
                    >
                      <p className={classes.serviceTitle}>{region.api_name}</p>
                      <p className={classes.serviceTitle}>🏴 {region.label}</p>
                    </div>
                  ),
                )}
              </TabPanel>
              {state.instanceType ? (
                <>
                  <p className={classes.sectionTitle}>
                    3. Choose instance type
                  </p>
                  <p className={classes.instanceParagraph}>
                    A larger instance can accommodate more dev/test activities.
                    For example, a team of 5 engineers requiring 5-10 clones
                    during peak times should consider a minimum instance size of
                    8 vCPUs and 32 GiB.
                  </p>
                  <TabPanel
                    value={state.cloudInstances}
                    index={state.cloudInstances}
                  >
                    {state.cloudInstances.map(
                      (instance: CloudInstance, index: number) => (
                        <div
                          key={index}
                          className={cn(
                            classes.instanceSize,
                            state.instanceType === instance &&
                              classes.activeBorder,
                          )}
                          onClick={() =>
                            dispatch({
                              type: 'change_instance_type',
                              instanceType: instance,
                            })
                          }
                        >
                          <p>
                            {instance.api_name} (
                            {state.instanceType.cloud_provider}:{' '}
                            {instance.native_name})
                          </p>
                          <div>
                            <span>🔳 {instance.native_vcpus} CPU</span>
                            <span>🧠 {instance.native_ram_gib} GiB RAM</span>
                          </div>
                        </div>
                      ),
                    )}
                  </TabPanel>
                  <p className={classes.sectionTitle}>4. Database volume</p>
                  <Box className={classes.sliderContainer}>
                    <Box className={classes.sliderInputContainer}>
                      <Box className={classes.sliderVolume}>
                        <TextField
                          value={state.volumeType}
                          onChange={handleChangeVolume}
                          select
                          label="Volume type"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="outlined"
                          className={classes.filterSelect}
                        >
                          {(state.volumes as CloudVolumes[]).map((p, id) => {
                            const volumeName = `${p.api_name} (${p.cloud_provider}: ${p.native_name})`
                            return (
                              <MenuItem value={volumeName} key={id}>
                                {volumeName}
                              </MenuItem>
                            )
                          })}
                        </TextField>
                      </Box>
                      <Box className={classes.databaseSize}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          type="number"
                          label="Database size"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            inputProps: {
                              min: 0,
                            },
                            endAdornment: (
                              <InputAdornment position="end">
                                GiB
                              </InputAdornment>
                            ),
                          }}
                          value={Number(state.databaseSize)?.toFixed(2)}
                          className={classes.filterSelect}
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLTextAreaElement | HTMLInputElement
                            >,
                          ) => {
                            dispatch({
                              type: 'change_volume_price',
                              storage: Math.min(
                                Number(event.target.value) * state.snapshots,
                                2000,
                              ),
                              databaseSize: event.target.value,
                              volumePrice: calculateVolumePrice(
                                Number(event.target.value),
                                state.snapshots,
                              ),
                            })
                          }}
                        />
                        ×
                        <TextField
                          variant="outlined"
                          fullWidth
                          type="number"
                          InputProps={{
                            inputProps: {
                              min: 0,
                            },
                            endAdornment: (
                              <InputAdornment position="end">
                                {Number(state.snapshots) === 1
                                  ? 'snapshot'
                                  : 'snapshots'}
                              </InputAdornment>
                            ),
                          }}
                          value={state.snapshots}
                          className={classes.filterSelect}
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLTextAreaElement | HTMLInputElement
                            >,
                          ) => {
                            dispatch({
                              type: 'change_snapshots',
                              snapshots: Number(event.target.value),
                              storage: Math.min(
                                Number(event.target.value) * state.databaseSize,
                                2000,
                              ),
                              volumePrice: calculateVolumePrice(
                                state.databaseSize,
                                Number(event.target.value),
                              ),
                            })
                          }}
                        />
                      </Box>
                    </Box>
                    <StorageSlider
                      sliderOptions={{
                        min: 0,
                        max: 2000,
                        step: 10,
                      }}
                      customMarks={[
                        {
                          value: 30,
                          label: '30 GiB',
                          scaledValue: 30,
                        },
                        {
                          value: 500,
                          label: '500 GiB',
                          scaledValue: 500,
                        },
                        {
                          value: 1000,
                          label: '1000 GiB',
                          scaledValue: 1000,
                        },
                        {
                          value: 1500,
                          label: '1500 GiB',
                          scaledValue: 1500,
                        },
                        {
                          value: 2000,
                          label: '2000 GiB',
                          scaledValue: 2000,
                        },
                      ]}
                      value={state.storage}
                      onChange={(_: React.ChangeEvent<{}>, value: unknown) => {
                        dispatch({
                          type: 'change_volume_price',
                          storage: value,
                          databaseSize: Number(value) / state.snapshots,
                          volumePrice:
                            (Number(value) * state.volumePricePerHour) / 1000,
                        })
                      }}
                    />
                  </Box>
                  <p className={classes.sectionTitle}>5. Provide DBLab name</p>
                  <TextField
                    required
                    label="DBLab Name"
                    variant="outlined"
                    fullWidth
                    value={state.name}
                    className={classes.marginTop}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText={
                      validateDLEName(state.name)
                        ? 'Name must be lowercase and contain only letters and numbers.'
                        : ''
                    }
                    error={validateDLEName(state.name)}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLTextAreaElement | HTMLInputElement
                      >,
                    ) =>
                      dispatch({
                        type: 'change_name',
                        name: event.target.value,
                      })
                    }
                  />
                  <p className={classes.sectionTitle}>
                    6. Define DBLab verification token (keep it secret!)
                  </p>
                  <div className={classes.generateContainer}>
                    <TextField
                      required
                      label="DBLab Verification Token"
                      variant="outlined"
                      fullWidth
                      value={state.verificationToken}
                      className={classes.marginTop}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(
                        event: React.ChangeEvent<
                          HTMLTextAreaElement | HTMLInputElement
                        >,
                      ) =>
                        dispatch({
                          type: 'change_verification_token',
                          verificationToken: event.target.value,
                        })
                      }
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!permitted}
                      onClick={handleGenerateToken}
                    >
                      Generate random
                    </Button>
                  </div>
                  <p className={classes.sectionTitle}>
                    7. Choose DBLab version
                  </p>
                  <Select
                    label="Select tag"
                    items={
                      availableTags.map((tag) => {
                        const defaultTag = availableTags[0]

                        return {
                          value: tag,
                          children:
                            defaultTag === tag ? `${tag} (default)` : tag,
                        }
                      }) ?? []
                    }
                    value={state.tag}
                    onChange={(
                      e: React.ChangeEvent<
                        HTMLTextAreaElement | HTMLInputElement
                      >,
                    ) =>
                      dispatch({
                        type: 'set_tag',
                        tag: e.target.value,
                      })
                    }
                  />
                  <p className={classes.sectionTitle}>
                    8. Provide SSH public keys (one per line)
                  </p>
                  <p className={classes.instanceParagraph}>
                    These SSH public keys will be added to the DBLab server's
                    &nbsp;
                    <code className={classes.code}>~/.ssh/authorized_keys</code>
                    &nbsp; file. Providing at least one public key is
                    recommended to ensure access to the server after deployment.
                  </p>
                  <TextField
                    label="SSH public keys"
                    variant="outlined"
                    fullWidth
                    multiline
                    required={requirePublicKeys}
                    helperText={
                      state.publicKeys && state.publicKeys.length < 30
                        ? 'Public key is too short'
                        : ''
                    }
                    error={state.publicKeys && state.publicKeys.length < 30}
                    value={state.publicKeys}
                    className={classes.marginTop}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLTextAreaElement | HTMLInputElement
                      >,
                    ) =>
                      dispatch({
                        type: 'change_public_keys',
                        publicKeys: event.target.value,
                      })
                    }
                  />
                </>
              ) : (
                <div />
              )}
            </div>
            <DbLabInstanceFormSidebar
              state={state}
              disabled={
                validateDLEName(state.name) ||
                requirePublicKeys ||
                (state.publicKeys && state.publicKeys.length < 30)
              }
              handleCreate={() =>
                !validateDLEName(state.name) && handleSetFormStep('simple')
              }
            />
          </>
        ) : state.formStep === 'ansible' && permitted ? (
          <AnsibleInstance
            state={state}
            orgId={props.orgId}
            formStep={state.formStep}
            setFormStep={handleSetFormStep}
            goBack={handleReturnToList}
            goBackToForm={handleReturnToForm}
          />
        ) : state.formStep === 'docker' && permitted ? (
          <DockerInstance
            state={state}
            orgId={props.orgId}
            formStep={state.formStep}
            setFormStep={handleSetFormStep}
            goBack={handleReturnToList}
            goBackToForm={handleReturnToForm}
          />
        ) : state.formStep === 'simple' && permitted ? (
          <SimpleInstance
            state={state}
            userID={props.auth?.userId}
            orgId={props.orgId}
            formStep={state.formStep}
            setFormStep={handleSetFormStep}
            goBackToForm={() => {
              window.history.pushState({}, '', `${window.location.pathname}`)
              handleReturnToForm()
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

export default DbLabInstanceForm
