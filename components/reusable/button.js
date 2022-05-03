import Link from 'next/link'

import styles from './button.module.scss'

function Component({ color, href, children, size }) {
    return (
        <Link href={href}>
            <a className={`${styles.button} ${styles["color-" + color]} ${styles["size-" + size]}`} draggable="false">
                {children}
            </a>
        </Link>
    )
}

export default Component