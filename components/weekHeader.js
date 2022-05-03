import { useAppContext } from '../lib/context'

import { getWeeksInYear } from '../lib/util'

import styles from '../styles/weekHeader.module.scss'

function Component() {
    const [context, setContext] = useAppContext()

    function toggleWeek(increment) {
        if (increment) {
            if (context.week + 1 >= getWeeksInYear(context.year)) {
                context.week = 1
                context.year = context.year + 1
                setContext({ ...context })
            } else {
                context.week = context.week + 1
                setContext({ ...context })
            }
        } else {
            if (context.week - 1 <= 0) {
                context.week = getWeeksInYear(context.year - 1)
                context.year = context.year - 1
                setContext({ ...context })
            } else {
                context.week = context.week - 1
                setContext({ ...context })
            }
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.text}>
                <div>Week {context.week} ({context.year})</div>
            </div>

            <div className={styles.arrows}>
                <div className={styles.arrow} onClick={e => { toggleWeek(false) }}>{"<"}</div>
                <div className={styles.arrow} onClick={e => { toggleWeek(true) }}>{">"}</div>
            </div>

        </div>
    )
}

export default Component