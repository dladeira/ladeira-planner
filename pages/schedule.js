import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

import styles from '../styles/schedule.module.scss'

Date.prototype.getWeek = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof (dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() -
        (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
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

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var [tasks, setTasks] = useState()

    function submitNewTask(e) {
        e.preventDefault()

        var newTasks = user.tasks
        newTasks.push({
            name: e.target.name.value,
            color: e.target.color.value,
            id: generateRandomString(64)
        })

        user.tasks = [...newTasks]
        setTasks(user.tasks)

        fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: user.tasks
            }),
            method: "POST"
        })
    }

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div>
            {tasks.map(task => (
                <div style={{ color: task.color }}>
                    {task.name}
                </div>
            ))}
            <div>WEEK {currentWeek}</div>

            <div className={styles.weekDays}>
                {weekDays.map(weekDay =>
                    <WeekDay weekDay={weekDay} user={user} currentWeek={currentWeek} />
                )}
            </div>

            <form onSubmit={submitNewTask}>
                <input name="name" type="text" placeholder="new task name" />
                <input name="color" type="color" />
                <button type="submit">ADD NEW TASK</button>
            </form>
        </div>
    ) : <div />)
}

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
var currentWeek = new Date().getWeek()

function WeekDay({ weekDay, user, currentWeek }) {
    var [time, setTime] = useState(1)
    var index = weekDays.indexOf(weekDay)
    var dayIndexInUser

    var userDay
    for (var i = 0; i < user.days.length; i++) {
        var day = user.days[i]
        if (day) {
            if (day.week == currentWeek && day.day == index) {
                dayIndexInUser = i
                userDay = user.days[i]
                break
            }
        }
    }

    if (!userDay) {
        userDay = { week: currentWeek, day: index, tasks: [] }
    }

    function addTaskToDay(dayNum, dayIndex, e) {
        e.preventDefault()

        var newDays = user.days

        if (dayIndex != undefined) {
            newDays[dayIndex].tasks.push({
                taskId: e.target.taskId.value,
                time: e.target.time.value
            })
        } else {
            var newTasks = []
            newTasks.push({
                taskId: e.target.taskId.value,
                time: e.target.time.value
            })

            newDays.push({
                week: currentWeek,
                day: dayNum,
                tasks: newTasks
            })
        }

        user.days = [...newDays]

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: user.days
            }),
            method: "POST"
        })
    }

    return (
        <div className={styles.weekDay}>
            <div className={styles.weekDayTitle}>{weekDay}</div>

            <div className={styles.weekDayTasks}>
                {userDay.tasks.map(task =>
                    <div className={styles.task} style={{ height: task.time * 40, backgroundColor: getTask(task.taskId, user).color }}>
                        <div className={styles.taskTime}>{task.time}h</div>
                        <div className={styles.taskName}>{getTask(task.taskId, user).name}</div>
                    </div>
                )}
            </div>

            <form className={styles.weekDayAddNew} onSubmit={e => addTaskToDay(index, dayIndexInUser, e)}>
                <input className={styles.addNewTime} type="text" step="any" value={time} onChange={e => setTime(isNaN(e.target.value) ? time : e.target.value)} name="time" />
                <select className={styles.addNewTask} name="taskId">
                    {user.tasks.map(task => {
                        return <option value={task.id}>{task.name}</option>
                    })}
                </select>
                <button className={styles.addNewSubmit} type="submit">SUBMIT</button>
            </form>
        </div>
    )
}

function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export default Page