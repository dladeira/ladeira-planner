import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useAppContext } from '../../lib/context'
import { useUser } from '../../lib/hooks'
import { getWeeksInYear, isInYear, getWeekDay } from '../../lib/util'

import WeekDay from '../../components/schedule/weekDay'


import styles from '../../styles/schedule.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    var user = useUser({ userOnly: true })
    var today = new Date()
    const [context, setContext] = useAppContext()
    const [weekDay, setWeekDay] = useState(getWeekDay(today))
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    function toggleDay(increment) {
        if (increment) {
            if (weekDay >= 6) {
                setWeekDay(0)
                toggleWeek(true)
            } else {
                if (!isInYear(context.year, context.week, weekDay + 1)) {
                    toggleWeek(true)
                }
                setWeekDay(++weekDay)
            }
        } else {
            if (weekDay <= 0) {
                setWeekDay(6)
                toggleWeek(false)
            } else {
                if (!isInYear(context.year, context.week, weekDay - 1)) {
                    toggleWeek(false)
                }
                setWeekDay(--weekDay)
            }
        }
    }

    function toggleWeek(increment) {
        console.log(context.year)
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

    return (user ? (
        <div className={styles.container}>
            <div className={styles.weekDays}>
                {isMobile ? (
                    <div className={styles.wrapper}>
                        <div className={styles.titleContainer}><div className={styles.arrow} onClick={e => toggleDay(false)}>{"<"}</div><div className={styles.arrow} onClick={e => toggleDay(true)}>{">"}</div></div>
                        <WeekDay key={"weekDay-" + context.year + "-" + context.week + "-" + weekDay} weekDay={weekDay} user={user} today={today.getCurrentWeek() == context.week && weekDay == getWeekDay(today) && context.year == today.getFullYear()} />
                    </div>
                ) : weekDays.map(weekDay =>
                    <WeekDay key={"weekDay-" + "-" + weekDays.indexOf(weekDay)}weekDay={weekDays.indexOf(weekDay)} today={today.getCurrentWeek() == context.week && weekDays.indexOf(weekDay) == getWeekDay(today) && context.year == today.getFullYear()} />
                )}
            </div>
        </div>
    ) : <div />)
}

export default Page