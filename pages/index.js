import Link from 'next/link'
import { useUser } from '../lib/hooks'

import styles from '../styles/index.module.scss'

function Page() {
    const user = useUser()

    if (user !== undefined) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>Keep your life organized</div>
                <div className={styles.subtitle}>Make life decisions, stay organized, track your time, and calculate efficency</div>
                {user ? (
                    <Link href="/user/overview"><a className={styles.enter} draggable={false}>Welcome back</a></Link>
                ) : (
                    <Link href="/api/login"><a className={styles.enter} draggable={false}>Get started</a></Link>
                )}
                <div className={styles.imageWrapper}>
                </div>
            </div >
        )
    }
    return <div />
}

export default Page;