import Link from 'next/link'
import { useUser } from '../lib/hooks'

import styles from '../styles/navbar.module.scss'

function Component() {
    const user = useUser()

    return (
        <div className={styles.container} >

            {user ? (
                <div className={styles.linkContainer}>
                    <Link href={"/schedule"}>
                        <a className={styles.linkSchedule} draggable="false">
                            Schedule
                        </a>
                    </Link>
                    <Link href={"/tasks"}>
                        <a className={styles.linkTasks} draggable="false">
                            Tasks
                        </a>
                    </Link>
                </div>
            ) : <div className={styles.linkContainer} />
            }
            <div className={styles.brandContainer}>
                <Link href={"/"}>
                    <a className={styles.brand} draggable="false">
                        Planner
                    </a>
                </Link>
            </div>
            <div className={styles.authContainer}>
                <Link href={user ? "/api/logout" : "/api/login"}>
                    <a className={styles.authLogin} draggable="false">
                        {user ? "LOGOUT" : "LOGIN"}
                    </a>
                </Link>
            </div>
        </div >
    )
}

export default Component