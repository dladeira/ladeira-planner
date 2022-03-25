import { useState, useEffect } from 'react'

import styles from '../styles/weekDay.module.scss'

function WeekDay({ weekDay, weekDayIndex, user, currentWeek, today }) {
    var [taskInputTime, setTaskInputTime] = useState(1)
    var [dayIndex, setDayIndex] = useState()
    var [tasks, setTasks] = useState([])

    useEffect(() => {
        console.log("updaing things cause week changed")
        for (var i = 0; i < user.days.length; i++) {
            var day = user.days[i]
            if (day) {
                if (day.week == currentWeek && day.day == weekDayIndex) {
                    setDayIndex(i)
                    setTasks(user.days[i].tasks)
                    console.log("setting tasks to cool")
                    return
                }
            }
        }

        console.log('setting tasks to nothing')
        setTasks([])
        setDayIndex(undefined)
        console.log(tasks)
    }, [currentWeek])


    function addTaskToDay(e) {
        e.preventDefault()

        var newDays = user.days
        var newDayIndex = dayIndex

        if (dayIndex != undefined) {
            newDays[dayIndex].tasks.push({
                taskId: e.target.taskId.value,
                time: 1
            })
        } else {
            newDays.push({
                week: currentWeek,
                day: weekDayIndex,
                tasks: [{
                    taskId: e.target.taskId.value,
                    time: 1
                }]
            })

            newDayIndex = newDays.length - 1
            setDayIndex(newDays.length - 1)
        }

        user.days = [...newDays]

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: user.days
            }),
            method: "POST"
        })

        setTasks([...newDays[newDayIndex].tasks])
    }

    return (

        <div className={styles.weekDay}>
            <div className={today ? styles.weekDayTitleToday : styles.weekDayTitle}>{weekDay}</div>
            <div className={styles.weekDayTasks}>
                {tasks.map(task => {
                    if (task)
                        return <Task defaultTask={task} dayIndexInUser={dayIndex} user={user} setTasks={setTasks} />
                })}
            </div>

            <form className={styles.weekDayAddNew} onSubmit={addTaskToDay}>

                <select className={styles.addNewTask} name="taskId">
                    {user.tasks.map(task => {
                        if (dayIndex == undefined || user.days[dayIndex].tasks.filter(i => i.taskId == task.id).length == 0)
                            return <option value={task.id}>{task.name}</option>
                    })}
                </select>
                <button className={styles.addNewSubmit} type="submit">SUBMIT</button>
            </form>
        </div>
    )
}

function Task({ defaultTask, dayIndexInUser, setTasks, user }) {
    const [task, setTask] = useState(defaultTask)
    var tracking = false
    var pageY = -1
    var diff = 0;
    var height = defaultTask.time * 40

    function increaseTaskTime(amount) {
        var newDays = user.days

        var taskIndex;
        for (var taskI in user.days[dayIndexInUser].tasks) {
            if (user.days[dayIndexInUser].tasks[taskI].taskId == task.taskId) {
                taskIndex = taskI
            }
        }
        newDays[dayIndexInUser].tasks[taskIndex].time = parseFloat(parseFloat(newDays[dayIndexInUser].tasks[taskIndex].time) + parseFloat(roundToFourth(amount)))
        if (newDays[dayIndexInUser].tasks[taskIndex].time <= 0) {
            newDays[dayIndexInUser].tasks.splice(taskIndex, 1)
            setTask(undefined)
            console.log(newDays[dayIndexInUser].tasks)
            setTasks(newDays[dayIndexInUser].tasks)
        } else {
            setTask({ ...newDays[dayIndexInUser].tasks[taskIndex] })
        }


        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })
    }

    useEffect(() => {
        document.addEventListener("mousemove", moveHandler, true)
        document.addEventListener("mouseup", mouseUpHandler, true)
    })

    function moveHandler(e) {
        if (task) {
            if (tracking && pageY == -1) {
                pageY = e.pageY
                diff = 0
            } else if (tracking) {
                updateHeight()
                diff = parseFloat(diff) + (e.pageY - pageY)
                pageY = e.pageY
            }
        }
    }

    function mouseUpHandler() {
        if (task) {
            document.removeEventListener("mousemove", moveHandler, true)
            document.removeEventListener("mouseup", mouseUpHandler, true)

            tracking = false
            pageY = -1
            increaseTaskTime(diff / 40)
            diff = 0
        }
    }

    function clickHandler() {
        if (task) {
            tracking = true
            pageY = -1
        }
    }

    function updateHeight() {
        document.getElementById(task.taskId).style.height = ((parseFloat(defaultTask.time) + parseFloat(roundToFourth(diff / 40))) * 40) + "px"
        document.getElementById(task.taskId + "-time").innerHTML = roundToFourth((parseFloat(defaultTask.time) + (diff / 40))) > 0 ? roundToFourth((parseFloat(defaultTask.time) + (diff / 40))) + "h" : "REMOVE"
    }

    return (task ?
        <div id={task.taskId} className={styles.task} style={{ height: height, backgroundColor: getTask(task.taskId, user).color }}>
            <div id={task.taskId + "-time"} className={styles.taskTime}>{task.time}h</div>
            <div className={styles.taskName}>{getTask(task.taskId, user).name}</div>
            <div draggable={false} onMouseDown={clickHandler} className={styles.taskBottom}></div>
        </div> : <div />
    )
}

function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

function roundToFourth(number) {
    return (Math.round(number * 4) / 4).toFixed(2);
}

export default WeekDay