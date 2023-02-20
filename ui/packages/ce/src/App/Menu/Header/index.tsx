import cn from 'classnames'
import { Link } from 'react-router-dom'

import { linksConfig } from '@postgres.ai/shared/config/links'
import { Button } from '@postgres.ai/shared/components/MenuButton'

import { ROUTES } from 'config/routes'

import logoIconUrl from './icons/logo.svg'
import { ReactComponent as StarsIcon } from './icons/stars.svg'

import styles from './styles.module.scss'
import { DLEEdition } from "helpers/edition";

type Props = {
  isCollapsed: boolean
}

export const Header = (props: Props) => {
  return (
    <header className={cn(styles.root, props.isCollapsed && styles.collapsed)}>
      <Link
        to={ROUTES.path}
        className={cn(styles.header, props.isCollapsed && styles.collapsed)}
      >
        <img className={styles.logo} src={logoIconUrl} alt="Database Lab logo" />

        {!props.isCollapsed && (
          <h1 className={styles.title}>
            Database Lab
            <br />
            <span className={styles.name}>{DLEEdition()}</span>
          </h1>
        )}
      </Link>

      {!props.isCollapsed && (
        <Button
          type="gateway-link"
          href={linksConfig.cloudSignIn}
          className={styles.upgradeBtn}
        >
          <StarsIcon className={styles.upgradeBtnIcon} />
          Go Enterprise
        </Button>
      )}
    </header>
  )
}
