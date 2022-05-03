import Link from 'next/link'
import { useMediaQuery } from 'react-responsive'
import { useUser } from '../lib/hooks'

import styles from '../styles/index.module.scss'

function Page() {
    const [user] = useUser()
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    if (user !== undefined) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>Keep {isMobile ? <br /> : ""} your life<br />organized</div>
                <div className={styles.subtitle}>Make life decisions, stay organized, track your time, and calculate efficency</div>
                {user ? (
                    <Link href="/user/overview"><a className={styles.enter} draggable={false}>Welcome back</a></Link>
                ) : (
                    <Link href="/api/login"><a className={styles.enter} draggable={false}>Get started</a></Link>
                )}
                <div className={styles.image} />
            </div >
        )
    }
    return <div />
}

export default Page;