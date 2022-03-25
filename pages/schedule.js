import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

import WeekDay from '../components/weekDay'

import styles from '../styles/schedule.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    const [tasks, setTasks] = useState()
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div>
            <div className={styles.weekNumberContainer}>
                <div className={styles.weekNumberArrowLeft} onClick={e => { setCurrentWeek(currentWeek - 1) }}><div className={styles.weekNumberArrowText}>{"<"}</div></div>
                <div className={styles.weekNumberText}>WEEK {currentWeek}</div>
                <div className={styles.weekNumberArrowRight} onClick={e => { setCurrentWeek(currentWeek + 1) }}><div className={styles.weekNumberArrowText}>{">"}</div></div>
            </div>

            <div className={styles.weekDays}>
                {weekDays.map(weekDay =>
                    <WeekDay weekDay={weekDay} weekDayIndex={weekDays.indexOf(weekDay)} user={user} today={getCurrentWeek() == currentWeek && weekDays.indexOf(weekDay) == new Date().getDay()} currentWeek={currentWeek} />
                )}
            </div>
        </div>
    ) : <div />)
}

function getCurrentWeek() {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
    var date = new Date()

    var dowOffset = 0; //default dowOffset to zero
    var newYear = new Date(date.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((date.getTime() - newYear.getTime() -
        (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        if (weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1, 0, 1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
              the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    }
    else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
};

export default Page