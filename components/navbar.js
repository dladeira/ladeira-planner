import Link from 'next/link'
import { useUser } from '../lib/hooks'
import LoginButton from './reusable/loginButton.js'

import styles from '../styles/navbar.module.scss'

function Component() {
    const [user] = useUser()

    return (
        <div className={styles.container} >
            <div className={styles.brandContainer}>
                <Link href={"/"}>
                    <a className={styles.brand} draggable="false">
                        Planner
                    </a>
                </Link>
            </div>
            <LoginButton />
        </div >
    )
}

export default Component