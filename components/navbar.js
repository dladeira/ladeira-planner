import Link from 'next/link'
import { useUser } from '../lib/hooks'

import styles from '../styles/navbar.module.scss'

function Component() {
    const user = useUser()

    return (
        <div className={styles.container} >
            <div className={styles.brandContainer}>
                <Link href={"/"}>
                    <a className={styles.brand} draggable="false">
                        Planner
                    </a>
                </Link>
            </div>
            <div className={styles.linkContainer}>
                <Link href={"/"}>
                    <a className={styles.link} draggable="false">
                        Features
                    </a>
                </Link>
                <Link href={"/"}>
                    <a className={styles.link} draggable="false">
                        Tasks
                    </a>
                </Link>
                <Link href={"/"}>
                    <a className={styles.link} draggable="false">
                        About us
                    </a>
                </Link>
            </div>
            <div className={user ? styles.authContainerLogout : styles.authContainer}>
                <Link href={user ? "/api/logout" : "/api/login"}>
                    <a className={user ? styles.authLogout : styles.authLogin} draggable="false">
                        {user ? "Logout" : "Login"}
                    </a>
                </Link>
            </div>
        </div >
    )
}

export default Component