import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

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
    var currentWeek = new Date().getWeek()

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

    function addTaskToDay(dayNum, dayIndex, e) {
        e.preventDefault()

        var newDays = user.days

        var taskName
        for (var i = 0; i < user.tasks.length; i++) {
            if (user.tasks[i].id == e.target.taskId.value)
                taskName = user.tasks[i].name
        }

        console.log(dayIndex)

        if (dayIndex != undefined) {
            console.log("pushing")
            newDays[dayIndex].tasks.push({
                name: taskName,
                time: e.target.time.value
            })
        } else {
            console.log("not pushing")
            var newTasks = []
            newTasks.push({
                name: taskName,
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

    var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
            {weekDays.map(weekDay => {
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

                return (
                    <div>
                        {weekDay} - {userDay.tasks.map(task => {
                            return <span>| {task.name} - {task.time}|</span>
                        })}

                        <br />
                        <br />

                        ADD NEW TASK:
                        <form onSubmit={e => addTaskToDay(index, dayIndexInUser, e)}>
                            <select name="taskId">
                                {user.tasks.map(task => {
                                    return <option value={task.id}>{task.name}</option>
                                })}
                            </select>
                            <input type="number" name="time" />
                            <button type="submit">SUBMIT</button>
                        </form>

                        <br />
                    </div>
                )
            })}

            <form onSubmit={submitNewTask}>
                <input name="name" type="text" placeholder="new task name" />
                <input name="color" type="color" />
                <button type="submit">ADD NEW TASK</button>
            </form>
        </div>
    ) : <div />)
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