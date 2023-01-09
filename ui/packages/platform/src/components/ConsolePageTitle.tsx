/*--------------------------------------------------------------------------
 * Copyright (c) 2019-2021, Postgres.ai, Nikolay Samokhvalov nik@postgres.ai
 * All Rights Reserved. Proprietary and confidential.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 *--------------------------------------------------------------------------
 */

import { makeStyles } from '@material-ui/core'
import Tooltip from '@material-ui/core/Tooltip'

import { colors } from '@postgres.ai/shared/styles/colors'
import { icons } from '@postgres.ai/shared/styles/icons'

interface ConsolePageTitleProps {
  title: string
  information?: string | JSX.Element
  label?: string
  actions?: JSX.Element[] | string[]
  top?: boolean
}

const useStyles = makeStyles(
  {
    pageTitle: {
      flex: '0 0 auto',
      '& > h1': {
        display: 'inline-block',
        fontSize: '16px',
        lineHeight: '19px',
        marginRight: '10px',
      },
      'border-top': '1px solid ' + colors.consoleStroke,
      'border-bottom': '1px solid ' + colors.consoleStroke,
      'padding-top': '8px',
      'padding-bottom': '8px',
      display: 'block',
      overflow: 'auto',
      'margin-bottom': '20px',
      'max-width': '100%',
    },
    pageTitleTop: {
      flex: '0 0 auto',
      '& > h1': {
        display: 'inline-block',
        fontSize: '16px',
        lineHeight: '19px',
        marginRight: '10px',
      },
      'border-bottom': '1px solid ' + colors.consoleStroke,
      'padding-top': '0px',
      'margin-top': '-10px',
      'padding-bottom': '8px',
      display: 'block',
      overflow: 'auto',
      'margin-bottom': '20px',
    },
    pageTitleActions: {
      lineHeight: '37px',
      display: 'inline-block',
      float: 'right',
    },
    pageTitleActionContainer: {
      marginLeft: '10px',
    },
    tooltip: {
      fontSize: '10px!important',
    },
    label: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrastText,
      display: 'inline-block',
      borderRadius: 3,
      fontSize: 10,
      lineHeight: '12px',
      padding: 2,
      paddingLeft: 3,
      paddingRight: 3,
      verticalAlign: 'text-top',
    },
  },
  { index: 1 },
)

const ConsolePageTitle = ({
  title,
  information,
  label,
  actions,
  top,
}: ConsolePageTitleProps) => {
  const classes = useStyles()

  if (!title) {
    return null
  }

  return (
    <div className={top ? classes.pageTitleTop : classes.pageTitle}>
      <h1>{title}</h1>
      {information ? (
        <Tooltip
          title={information}
          classes={{ tooltip: classes.tooltip }}
          enterTouchDelay={0}
        >
          {icons.infoIcon}
        </Tooltip>
      ) : null}
      {label ? <span className={classes.label}>{label}</span> : null}
      {actions && actions?.length > 0 ? (
        <span className={classes.pageTitleActions}>
          {actions.map((a, index) => {
            return (
              <span key={index} className={classes.pageTitleActionContainer}>
                {a}
              </span>
            )
          })}
        </span>
      ) : null}
    </div>
  )
}

export default ConsolePageTitle
