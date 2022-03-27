import { useState, useEffect } from 'react'

import styles from '../styles/weekDay.module.scss'

function WeekDay({ weekDay, weekDayIndex, user, currentWeek, today }) {
    var [dayIndex, setDayIndex] = useState()
    var [tasks, setTasks] = useState([])

    useEffect(() => {
        for (var i = 0; i < user.days.length; i++) {
            var day = user.days[i]
            if (day) {
                if (day.week == currentWeek && day.day == weekDayIndex) {
                    setDayIndex(i)
                    setTasks(user.days[i].tasks)
                    return
                }
            }
        }

        setTasks([])
        setDayIndex(undefined)
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

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })

        setTasks([...newDays[newDayIndex].tasks])
    }

    function canAddNewTask() {
        return user.tasks.filter(task => dayIndex == undefined || user.days[dayIndex].tasks.filter(i => i.taskId == task.id).length == 0).length > 0
    }

    function getSortedTasks() {
        var sorted = tasks.sort((a, b) => getTask(a.taskId, user).name.localeCompare(getTask(b.taskId, user).name))

        return sorted
    }

    console.log(getSortedTasks())

    return (

        <div className={styles.weekDay}>
            <div className={today ? styles.weekDayTitleToday : styles.weekDayTitle}>{weekDay}</div>
            <div className={styles.weekDayTasks}>
                {getSortedTasks().map(task => {
                    if (task) {
                        return <div>
                            <Task key={task.taskId + "-" + weekDayIndex + "-" + currentWeek} defaultTask={task} dayIndexInUser={dayIndex} user={user} setTasks={setTasks} tasks={tasks} />
                            </div>
                    }
                })}
            </div>

            <form className={styles.weekDayAddNew} onSubmit={addTaskToDay}>

                <select className={styles.addNewTask} name="taskId">
                    {user.tasks.filter(task => dayIndex == undefined || user.days[dayIndex].tasks.filter(i => i.taskId == task.id).length == 0).map(task => {
                        return <option value={task.id}>{task.name}</option>
                    })}
                </select>
                <button className={canAddNewTask() ? styles.addNewSubmit : styles.addNewSubmitDisabled} type="submit" disabled={!canAddNewTask()}>SUBMIT</button>
            </form>
        </div>
    )
}

function Task({ defaultTask, dayIndexInUser, setTasks, user }) {
    var tracking = false
    var pageY = -1
    var diff = 0
    var height = defaultTask.time * 40
    var elementId = defaultTask.taskId + "-" + user.days[dayIndexInUser].day + "-" + user.days[dayIndexInUser].week

    function increaseTaskTime(amount) {
        var newTasks = user.days[dayIndexInUser].tasks

        var taskIndex;
        for (var taskI in user.days[dayIndexInUser].tasks) {
            if (user.days[dayIndexInUser].tasks[taskI].taskId == defaultTask.taskId) {
                taskIndex = taskI
            }
        }

        newTasks[taskIndex].time = parseFloat(parseFloat(newTasks[taskIndex].time) + parseFloat(roundToFourth(amount)))
        if (newTasks[taskIndex].time <= 0) {
            newTasks.splice(taskIndex, 1)
        }


        setTasks([...newTasks])

        var newDays = user.days
        newDays[dayIndexInUser].tasks = newTasks
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
        if (tracking && pageY == -1) {
            pageY = e.pageY
            diff = 0
        } else if (tracking) {
            updateHeight()
            diff = parseFloat(diff) + (e.pageY - pageY)
            pageY = e.pageY
        }
    }

    function mouseUpHandler() {
        if (tracking) {
            document.removeEventListener("mousemove", moveHandler, true)
            document.removeEventListener("mouseup", mouseUpHandler, true)

            tracking = false
            pageY = -1
            increaseTaskTime(diff / 40)
            diff = 0
        }
    }

    function clickHandler() {
        tracking = true
        pageY = -1
    }

    function updateHeight() {
        document.getElementById(elementId).style.height = ((parseFloat(defaultTask.time) + parseFloat(roundToFourth(diff / 40))) * 40) + "px"
        document.getElementById(elementId + "_time").innerHTML = roundToFourth((parseFloat(defaultTask.time) + (diff / 40))) > 0 ? roundToFourth((parseFloat(defaultTask.time) + (diff / 40))) + "h" : "REMOVE"
    }

    return (
        <div id={elementId} className={styles.task} style={{ height: height, backgroundColor: getTask(defaultTask.taskId, user).color }}>
            <div id={elementId + "_time"} className={styles.taskTime}>{defaultTask.time}h</div>
            <div className={styles.taskName}>{getTask(defaultTask.taskId, user).name}</div>
            <div draggable={false} onMouseDown={clickHandler} className={styles.taskBottom}></div>
        </div>
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