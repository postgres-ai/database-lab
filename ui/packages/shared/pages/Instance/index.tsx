/*--------------------------------------------------------------------------
 * Copyright (c) 2019-2021, Postgres.ai, Nikolay Samokhvalov nik@postgres.ai
 * All Rights Reserved. Proprietary and confidential.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 *--------------------------------------------------------------------------
 */

import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core'
import { observer } from 'mobx-react-lite'

import { Button } from '@postgres.ai/shared/components/Button2'
import { StubSpinner } from '@postgres.ai/shared/components/StubSpinner'
import { SectionTitle } from '@postgres.ai/shared/components/SectionTitle'
import { ErrorStub } from '@postgres.ai/shared/components/ErrorStub'
import { isRetrievalUnknown } from '@postgres.ai/shared/pages/Configuration/index'

import { TABS_INDEX, Tabs } from './Tabs'
import { Logs } from '../Logs'
import { Clones } from './Clones'
import { Info } from './Info'
import { Configuration } from './Configuration'
import { Branches } from '../Branches'
import { Snapshots } from './Snapshots'
import { SnapshotsModal } from './Snapshots/components/SnapshotsModal'
import { ClonesModal } from './Clones/ClonesModal'
import { Host, HostProvider, StoresProvider } from './context'

import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import Box from '@mui/material/Box'

import { useCreatedStores } from './useCreatedStores'

import './styles.scss'

type Props = Host

const useStyles = makeStyles(
  (theme) => ({
    title: {
      marginTop: '8px',
    },
    reloadButton: {
      flex: '0 0 auto',
      alignSelf: 'flex-start',
    },
    errorStub: {
      marginTop: '16px',
    },
    content: {
      display: 'flex',
      marginTop: '16px',
      position: 'relative',
      flex: '1 1 100%',
      height: '100%',

      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
      },
    },
  }),
  { index: 1 },
)

export const Instance = observer((props: Props) => {
  const classes = useStyles()

  const { instanceId, api } = props

  const stores = useCreatedStores(props)
  const { instance, instanceError, instanceRetrieval, load } = stores.main

  useEffect(() => {
    load(instanceId)
  }, [instanceId])

  const isConfigurationActive =
    !isRetrievalUnknown(instanceRetrieval?.mode) &&
    instanceRetrieval?.mode !== 'physical'

  useEffect(() => {
    if (
      instance &&
      instance?.state.retrieving?.status === 'pending' &&
      isConfigurationActive
    ) {
      setActiveTab(TABS_INDEX.CONFIGURATION)
    }
    if (instance && !instance?.state?.pools) {
      if (!props.callbacks) return

      props.callbacks.showDeprecatedApiBanner()
      return props.callbacks?.hideDeprecatedApiBanner
    }
  }, [instance])

  const [activeTab, setActiveTab] = React.useState(0)

  const switchTab = (_: React.ChangeEvent<{}> | null, tabID: number) => {
    const contentElement = document.getElementById('content-container')
    setActiveTab(tabID)
    contentElement?.scroll(0, 0)
  }

  return (
    <HostProvider value={props}>
      <StoresProvider value={stores}>
        <>
          {props.elements.breadcrumbs}
          <SectionTitle
            text={props.title}
            level={1}
            tag="h1"
            className={classes.title}
            rightContent={
              <Button
                onClick={() => stores.main.load(props.instanceId)}
                isDisabled={!instance && !instanceError}
                className={classes.reloadButton}
              >
                Reload info
              </Button>
            }
          >
            <Tabs
              value={activeTab}
              handleChange={switchTab}
              hasLogs={api.initWS != undefined}
              hideInstanceTabs={props?.hideInstanceTabs}
              isConfigActive={!isRetrievalUnknown(instanceRetrieval?.mode)}
            />
          </SectionTitle>

          {instanceError && (
            <ErrorStub {...instanceError} className={classes.errorStub} />
          )}

          <TabPanel value={activeTab} index={TABS_INDEX.OVERVIEW}>
            <div className={classes.content}>
              {!instanceError &&
                (instance ? (
                  <>
                    <Clones />
                    <Info />
                  </>
                ) : (
                  <StubSpinner />
                ))}
            </div>

            <ClonesModal />

            <SnapshotsModal />
          </TabPanel>

          <TabPanel value={activeTab} index={TABS_INDEX.CLONES}>
            {activeTab === TABS_INDEX.CLONES && (
              <div className={classes.content}>
                {!instanceError &&
                  (instance ? <Clones onlyRenderList /> : <StubSpinner />)}
              </div>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={TABS_INDEX.LOGS}>
            {activeTab === TABS_INDEX.LOGS && <Logs api={api} />}
          </TabPanel>
        </>

        <TabPanel value={activeTab} index={TABS_INDEX.CONFIGURATION}>
          {activeTab === TABS_INDEX.CONFIGURATION && (
            <Configuration
              switchActiveTab={switchTab}
              isConfigurationActive={isConfigurationActive}
              reload={() => stores.main.load(props.instanceId)}
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={TABS_INDEX.SNAPSHOTS}>
          {activeTab === TABS_INDEX.SNAPSHOTS && <Snapshots />}
        </TabPanel>
        <TabPanel value={activeTab} index={TABS_INDEX.BRANCHES}>
          {activeTab === TABS_INDEX.BRANCHES && <Branches />}
        </TabPanel>
      </StoresProvider>
    </HostProvider>
  )
})

function TabPanel(props: PropTypes.InferProps<any>) {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      style={{ height: '100%', position: 'relative' }}
      {...other}
    >
      <Box p={3} sx={{ height: '100%' }}>
        {children}
      </Box>
    </Typography>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}
