import React, { useEffect } from 'react'
import { Alert, AlertTitle } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core'
import { Spinner } from '@postgres.ai/shared/components/Spinner'

import { Api } from '@postgres.ai/shared/pages/Instance/stores/Main'
import { establishConnection } from '@postgres.ai/shared/pages/Logs/wsLogs'
import { useWsScroll } from '@postgres.ai/shared/pages/Logs/hooks/useWsScroll'

const useStyles = makeStyles(
  () => ({
    spinnerContainer: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
  { index: 1 },
)

export const Logs = ({ api }: { api: Api }) => {
  const classes = useStyles()
  const [isLoading, setIsLoading] = React.useState(true)
  useWsScroll(isLoading)

  useEffect(() => {
    if (api.initWS != undefined) {
      establishConnection(api)
    }
  }, [api])

  useEffect(() => {
    const config = { attributes: false, childList: true, subtree: true }
    const targetNode = document.getElementById('logs-container') as HTMLElement

    if (isLoading && targetNode?.querySelectorAll('p').length === 1) {
      setIsLoading(false)
    }

    const callback = (mutationList: MutationRecord[]) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setIsLoading(false)
        }
      }
    }

    const observer = new MutationObserver(callback)
    targetNode && observer.observe(targetNode, config)
  }, [isLoading])

  return (
    <>
      <Alert severity="info">
        <AlertTitle>Sensitive data are masked.</AlertTitle>
        You can see the raw log data connecting to the machine and running the{' '}
        <strong>'docker logs'</strong> command.
      </Alert>
      <div id="logs-container">
        {isLoading && (
          <div className={classes.spinnerContainer}>
            <Spinner />
          </div>
        )}
      </div>
    </>
  )
}
