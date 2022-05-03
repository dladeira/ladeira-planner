import React, { useEffect, useState } from 'react'
import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'
import { getTask, roundToFourth } from '../../lib/util'


import styles from './task.module.scss'

function Component({ defaultTask, dayIndex, user }) {
    const [, setUser] = useUser()
    var tracking = false
    var pageY = -1
    var diff = 0
    var hourToPixelRatio = 100
    var height = defaultTask.time * hourToPixelRatio
    var elementId = defaultTask.taskId + "-" + user.days[dayIndex].day + "-" + user.days[dayIndex].week

    function setTasks(newTasks) {
        var newUser = { ...user }
        newUser.days[dayIndex].tasks = newTasks
        setUser(newUser)
    }

    function increaseTaskTime(amount) {
        var newTasks = user.days[dayIndex].tasks

        var taskIndex;
        for (var taskI in user.days[dayIndex].tasks) {
            if (user.days[dayIndex].tasks[taskI].taskId == defaultTask.taskId) {
                taskIndex = taskI
            }
        }

        newTasks[taskIndex].time = parseFloat(parseFloat(newTasks[taskIndex].time) + parseFloat(roundToFourth(amount)))
        if (newTasks[taskIndex].time <= 0) {
            newTasks.splice(taskIndex, 1)
        }

        setTasks([...newTasks])

        var newDays = user.days
        newDays[dayIndex].tasks = newTasks
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

        return () => {
            document.removeEventListener("mousemove", moveHandler, true)
            document.removeEventListener("mouseup", mouseUpHandler, true)
        }
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
            increaseTaskTime(diff / hourToPixelRatio)
            diff = 0
        }
    }

    function clickHandler() {
        tracking = true
        pageY = -1
    }

    function updateHeight() {
        document.getElementById(elementId).style.height = ((parseFloat(defaultTask.time) + parseFloat(roundToFourth(diff / hourToPixelRatio))) * hourToPixelRatio) + "px"
        document.getElementById(elementId + "_time").innerHTML = roundToFourth((parseFloat(defaultTask.time) + (diff / hourToPixelRatio))) > 0 ? roundToFourth((parseFloat(defaultTask.time) + (diff / hourToPixelRatio))) + "h" : "REMOVE"
    }

    return (height > hourToPixelRatio * 0.5 ?
        (
            <div id={elementId} className={styles.task} style={{ height: height, backgroundColor: getTask(defaultTask.taskId, user).color }}>
                <div id={elementId + "_time"} className={styles.taskTime}>{defaultTask.time}h</div>
                <div className={styles.taskName}>{getTask(defaultTask.taskId, user).name}</div>
                <div draggable={false} onMouseDown={clickHandler} className={styles.taskBottom}></div>
            </div>
        ) : (
            <div id={elementId} className={styles.taskSmall} style={{ height: height, backgroundColor: getTask(defaultTask.taskId, user).color }}>
                <div id={elementId + "_time"} className={styles.taskTime}>{defaultTask.time}h</div>
                <div className={styles.taskName}>{getTask(defaultTask.taskId, user).name}</div>
                <div draggable={false} onMouseDown={clickHandler} className={styles.taskBottom}></div>
            </div>
        )
    )
}

export function AddTask({ setDayIndex, dayIndex, weekDay }) {
    const [user, setUser] = useUser()
    const [context] = useAppContext()

    function addTaskToDay(task) {
        var newDayIndex = dayIndex

        if (dayIndex != undefined) {
            user.days[dayIndex].tasks.push({
                taskId: task,
                time: 1
            })
        } else {
            user.days.push({
                week: context.week,
                day: weekDay,
                tasks: [{
                    taskId: task,
                    time: 1
                }],
                currentYear: context.year
            })

            newDayIndex = user.days.length - 1
            setDayIndex(user.days.length - 1)
        }

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                days: user.days
            }),
            method: "POST"
        })

        setUser({...user})
    }

    function getSortedTasks() {
        var sorted = user.tasks.sort((a, b) => a.name.localeCompare(b.name))

        return sorted
    }

    function onSelect(e) {
        if (e.target.value !== "") {
            addTaskToDay(e.target.value)
        }
    }

    return (user ? (
        <div className={styles.addContainer}>
            <select className={styles.addSelect} name="taskId" value={""} onChange={onSelect}>
                <option default value="">Add task</option>
                {getSortedTasks().filter(task => dayIndex === undefined || user.days[dayIndex].tasks.filter(i => i.taskId == task.id).length == 0).map(task => {
                    return <option key={task.id} value={task.id}>{task.name}</option>
                })}
            </select>
        </div>
    ) : <div />)
}

export default Component