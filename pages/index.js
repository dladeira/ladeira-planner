import Link from 'next/link';
import { useUser } from '../lib/hooks'

import styles from '../styles/index.module.scss'

function Page() {
    const user = useUser()

    if (user !== undefined) {
        return (user ? (
            <div className={styles.container}>
                <div className={styles.title}>Welcome back</div>
                <div className={styles.subtitle}>Logged in as <span className={styles.email}>{user.email}</span></div>
                <Link href="/schedule"><a className={styles.enter} draggable={false}>Your schedule</a></Link>
            </div >
        ) : (
            <div className={styles.container}>
                <div className={styles.title}>LadeiraPlanner</div>
                <div className={styles.subtitle}>Keep your life organized</div>
                <Link href="/api/login"><a className={styles.enter} draggable={false}>Login</a></Link>
            </div >
        )
        )
    }
    return <div />
}

export default Page;