import Link from 'next/link'
import { useUser } from '../lib/hooks'
import Button from './reusable/button.js'

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
            {/* <div className={styles.linkContainer}>
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
            </div> */}
            {user ? (
                <Button color="red" size="sm" href="api/logout">Logout</Button>
            ) : (
                <Button color="blue" size="sm" href="api/login">Login</Button>
            )}
        </div >
    )
}

export default Component