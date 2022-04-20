import { useAppContext } from '../lib/context'

import styles from '../styles/weekHeader.module.scss'

function Component() {
    const [context, setContext] = useAppContext()

    function toggleWeek(increment) {
        if (increment) {
            if (context.week + 1 >= getWeeksInYear(context.year)) {
                setContext({ week: 1, year: context.year + 1 })
            } else {
                setContext({ week: context.week + 1, year: context.year })
            }
        } else {
            if (context.week - 1 <= 0) {
                setContext({ week: getWeeksInYear(context.year - 1), year: context.year - 1 })
            } else {
                setContext({ week: context.week - 1, year: context.year })
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

function getWeeksInYear(y) {
    var d,
        isLeap;

    d = new Date(y, 0, 1);
    isLeap = new Date(y, 1, 29).getMonth() === 1;

    //check for a Jan 1 that's a Thursday or a leap year that has a 
    //Wednesday jan 1. Otherwise it's 52
    return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52
}

export default Component