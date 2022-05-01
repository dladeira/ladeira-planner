import Link from 'next/link'
import { useRouter } from 'next/router'

import styles from '../styles/userbar.module.scss'

function Component() {
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
                <BarLink text="Overview" location="/user/overview" />
                <BarLink text="Schedule" location="/user/schedule" />
                <BarLink text="Timer" location="/user/timer" />
                <BarLink text="Settings" location="/user/settings" />
            </div>
            <Link href={"/api/logout"}>
                <a className={styles.authLogout} draggable="false">
                    Logout
                </a>
            </Link>
        </div >
    )
}

function BarLink({ text, location }) {
    const router = useRouter()

    return (
        <Link href={location}>
            <a className={router.pathname == location ? styles.linkSelected : styles.link} draggable="false">
                {text}
            </a>
        </Link>
    )
}

export default Component