import { useUser } from '../../lib/hooks'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import WeekDay from '../../components/weekDay'
import { useAppContext } from '../../lib/context'

import styles from '../../styles/schedule.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var date = new Date()
    const [context, setContext] = useAppContext()
    const [weekDay, setWeekDay] = useState(getWeekDay(date))
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    function toggleDay(positive) {
        if (positive) {
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
                        {isInYear(context.year, context.week, weekDay) ? <WeekDay key={"weekDay-" + context.year + "-" + context.week + "-" + weekDay} weekDay={weekDay} user={user} today={date.getCurrentWeek() == context.week && weekDay == getWeekDay(date) && context.year == date.getFullYear()} /> : <WeekDay key={"weekDay-" + weekDays.indexOf(weekDay)} weekDay={weekDay} disabled={true} />}
                    </div>
                ) : weekDays.map(weekDay => {
                    if (isInYear(context.year, context.week, weekDays.indexOf(weekDay)))
                        return <WeekDay key={"weekDay-" + context.year + "-" + context.week + "-" + weekDays.indexOf(weekDay)} weekDay={weekDays.indexOf(weekDay)} user={user} today={date.getCurrentWeek() == context.week && weekDays.indexOf(weekDay) == getWeekDay(date) && context.year == date.getFullYear()} />
                    else
                        return <WeekDay key={"weekDay-" + weekDays.indexOf(weekDay)} weekDay={weekDays.indexOf(weekDay)} disabled={true} />
                }
                )}
            </div>
        </div>
    ) : <div />)
}



function getWeekDay(date) {
    var dayNumber = date.getDay() - 1
    return dayNumber < 0 ? 6 : dayNumber
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

function isInYear(year, week, dayIndex) {
    var firstWeekDay = getWeekDay(new Date(year, 0, 1));
    var lastWeekDay = getWeekDay(new Date(year, 11, 31))

    if ((week == 1 && dayIndex < firstWeekDay) || (week == getWeeksInYear(year) && dayIndex > lastWeekDay))
        return false
    return true
}

export default Page