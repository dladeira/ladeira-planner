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
    const [selectedYear, setSelectedYear] = useState(date.getFullYear())

    function toggleWeek(increment) {
        if (increment) {
            if (selectedWeek + 1 >= getWeeksInYear(selectedYear)) {
                setSelectedWeek(1)
                setSelectedYear(selectedYear + 1)
            } else {
                setSelectedWeek(selectedWeek + 1)
            }
        } else {
            if (selectedWeek - 1 <= 0) {
                setSelectedWeek(getWeeksInYear(selectedYear - 1))
                setSelectedYear(selectedYear - 1)
            } else {
                setSelectedWeek(selectedWeek - 1)
            }
        }
    }

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div className={styles.container}>
            <div className={styles.weekNumberContainer}>
                <div className={styles.weekNumberArrowLeft} onClick={e => { toggleWeek(false) }}><div className={styles.weekNumberArrowText}>{"<"}</div></div>
                <div className={styles.weekNumberText}>WEEK {selectedWeek} ({selectedYear})</div>
                <div className={styles.weekNumberArrowRight} onClick={e => { toggleWeek(true) }}><div className={styles.weekNumberArrowText}>{">"}</div></div>
            </div>

            <div className={styles.weekDays}>
                {weekDays.map(weekDay => {
                    if (isInYear(selectedYear, selectedWeek, weekDays.indexOf(weekDay)))
                        return <WeekDay weekDay={weekDay} weekDayIndex={weekDays.indexOf(weekDay)} user={user} today={date.getCurrentWeek() == selectedWeek && weekDays.indexOf(weekDay) == getWeekDay(date) && selectedYear == date.getFullYear()} currentWeek={selectedWeek} currentYear={selectedYear} />
                    else
                        return <WeekDay weekDay={weekDay} disabled={true} />
                }
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

    console.log(firstWeekDay)

    if ((week == 1 && dayIndex < firstWeekDay) || (week == getWeeksInYear(year) && dayIndex > lastWeekDay))
        return false
    return true

}

export default Page