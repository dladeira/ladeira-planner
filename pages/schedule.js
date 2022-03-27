import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

import WeekDay from '../components/weekDay'

import styles from '../styles/schedule.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var date = new Date()
    const [tasks, setTasks] = useState()
    const [selectedWeek, setSelectedWeek] = useState(date.getCurrentWeek())

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div className={styles.container}>
            <div className={styles.weekNumberContainer}>
                <div className={styles.weekNumberArrowLeft} onClick={e => { setSelectedWeek(selectedWeek - 1) }}><div className={styles.weekNumberArrowText}>{"<"}</div></div>
                <div className={styles.weekNumberText}>WEEK {selectedWeek}</div>
                <div className={styles.weekNumberArrowRight} onClick={e => { setSelectedWeek(selectedWeek + 1) }}><div className={styles.weekNumberArrowText}>{">"}</div></div>
            </div>

            <div className={styles.weekDays}>
                {weekDays.map(weekDay =>
                    <WeekDay weekDay={weekDay} weekDayIndex={weekDays.indexOf(weekDay)} user={user} today={date.getCurrentWeek() == selectedWeek && weekDays.indexOf(weekDay) == date.getWeekDay()} currentWeek={selectedWeek} />
                )}
            </div>
        </div>
    ) : <div />)
}

Date.prototype.getCurrentWeek = () => {
    var date = new Date();

    // ISO week date weeks start on Monday, so correct the day number
    var nDay = (date.getDay() + 6) % 7;

    // ISO 8601 states that week 1 is the week with the first Thursday of that year
    // Set the target date to the Thursday in the target week
    date.setDate(date.getDate() - nDay + 3);

    // Store the millisecond value of the target date
    var n1stThursday = date.valueOf();

    // Set the target to the first Thursday of the year
    // First, set the target to January 1st
    date.setMonth(0, 1);

    // Not a Thursday? Correct the date to the next Thursday
    if (date.getDay() !== 4) {
        date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
    }

    // The week number is the number of weeks between the first Thursday of the year
    // and the Thursday in the target week (604800000 = 7 * 24 * 3600 * 1000)
    return 1 + Math.ceil((n1stThursday - date) / 604800000);
}

Date.prototype.getWeekDay = () => {
    return new Date().getDay() - 1 < 0 ? 6 : new Date().getDay()
}

export default Page