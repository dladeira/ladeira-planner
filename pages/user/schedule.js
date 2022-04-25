import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'

import WeekDay from '../../components/weekDay'
import { useAppContext } from '../../lib/context'

import styles from '../../styles/schedule.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var date = new Date()
    const [tasks, setTasks] = useState()
    const [context, setContext] = useAppContext()

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div className={styles.container}>
            <div className={styles.weekDays}>
                {weekDays.map(weekDay => {
                    if (isInYear(context.year, context.week, weekDays.indexOf(weekDay)))
                        return <WeekDay key={"weekDay-" + context.year + "-" + context.week + "-" + weekDays.indexOf(weekDay)} weekDay={weekDay} weekDayIndex={weekDays.indexOf(weekDay)} user={user} today={date.getCurrentWeek() == context.week && weekDays.indexOf(weekDay) == getWeekDay(date) && context.year == date.getFullYear()} />
                    else
                        return <WeekDay key={"weekDay-" + weekDays.indexOf(weekDay)} weekDay={weekDay} disabled={true} />
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