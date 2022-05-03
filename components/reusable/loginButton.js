import Link from 'next/link'
import { useUser } from '../../lib/hooks'

import styles from './loginButton.module.scss'

function Component() {
    const [user] = useUser()

    return (user ? (
        <Link href="/api/logout">
            <a className={`${styles.button} ${styles.logout} `} draggable="false">
                Logout
            </a>
        </Link>
    ) : (
        <Link href="/api/login">
            <a className={`${styles.button} ${styles.login} `} draggable="false">
                Login
            </a>
        </Link>
    )
    )
}

export default Component