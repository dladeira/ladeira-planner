import Link from 'next/link'
import { useUser } from '../lib/hooks'

import styles from '../styles/navbar.module.scss'

function Component() {
    const user = useUser()

    return (
        <div className={styles.container}>
            <NavLink href={"/"}>
                <div className={styles.brand}>
                    Planner
                </div>
            </NavLink>
            {user ? <div className={styles.user}>{user.email}</div> : ""}
            <NavLink href={user ? "/api/logout" : "/api/login"}>
                <div className={styles.authentication}>
                    {user ? "LOGOUT" : "LOGIN"}
                </div>
            </NavLink>
        </div>
    )
}

function NavLink({ children, href }) {
    return (
        <Link href={href}>
            <a className={styles.navLink}>{children}</a>
        </Link>
    )
}

export default Component