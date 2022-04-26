import React, { useState, useEffect } from 'react'

import { useAppContext } from '../lib/context'

import styles from '../styles/weekDay.module.scss'

function WeekDay({ weekDay, weekDayIndex, user, today, disabled }) {
    const [dayIndex, setDayIndex] = useState()
    const [tasks, setTasks] = useState([])
    const [context, setContext] = useAppContext()

    if (disabled) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>
                    <div className={today ? styles.titleWeekDayToday : styles.titleWeekDay}>{weekDay}</div>
                </div>
                <div className={styles.weekDayTasksDisabled}>
                </div>
            </div>
        )
    }

    useEffect(() => {
        for (var i = 0; i < user.days.length; i++) {
            var day = user.days[i]
            if (day) {
                if (day.week == context.week && day.day == weekDayIndex && day.currentYear == context.year) {
                    setDayIndex(i)
                    setTasks(user.days[i].tasks)
                    return
                }
            }
        }

        setTasks([])
        setDayIndex(undefined)

    }, [setTasks, setDayIndex])

    function getSortedRecordedTasks() {
        var sorted = tasks.sort((a, b) => getTask(a.taskId, user).name.localeCompare(getTask(b.taskId, user).name))

        return sorted
    }

    return (
        <div className={styles.container + " " + styles.activeDay}>
            <div className={styles.title}>
                <div className={today ? styles.titleWeekDayToday : styles.titleWeekDay}>{weekDay}</div>
                <div className={styles.titleDate}>{getDateText(weekDayIndex, context.week, context.year)}</div>
            </div>

            <div className={styles.tasks}>

                <Lines count={100} thickOffset={4} />

                {getSortedRecordedTasks().map(task => {
                    if (task) {
                        return <Task key={task.taskId + "-" + weekDayIndex + "-" + context.week} defaultTask={task} dayIndexInUser={dayIndex} user={user} setTasks={setTasks} tasks={tasks} />
                    }
                })}

                <AddNew user={user} setDayIndex={setDayIndex} setTasks={setTasks} dayIndex={dayIndex} weekDayIndex={weekDayIndex} />
            </div>

            {weekDayIndex == 0 ? <RatingHeader user={user} weekDay={weekDayIndex} /> : <div />}
            <Ratings user={user} weekDay={weekDayIndex} />
        </div>
    )
}

function Lines({ count, thickOffset }) {
    var counter = 0

    return (
        <div className={styles.lines}>{Array.from(Array(count)).map(() => {
            if (counter++ % thickOffset == 0)
                return <div key={counter} className={styles.thickLine} />
            else
                return <div key={counter} className={styles.line} />
        })}</div>
    )
}

function RatingHeader({ user, weekDay }) {
    return (
        <div className={styles.headerWrapper}>
            <div className={styles.headerContainer}>
                {user.ratings.map(rating => <div key={weekDay + "-" + rating.name[0]} className={styles.header}>{rating.name[0]}</div>)}
            </div>
        </div>

    )
}

function Ratings({ user, weekDay }) {
    const [context, setContext] = useAppContext()

    return (
        <div className={styles.ratings}>
            {user.ratings.map(rating =>
                <Rating key={weekDay + "-" + rating.id} rating={rating} user={user} day={getDay(user, weekDay, context.week, context.year)} selectedData={{ day: weekDay, week: context.week, year: context.year }} />
            )}
        </div>
    )
}

function Rating({ rating, user, day, selectedData }) {
    const [ratingCount, setRatingCount] = useState(getDefaultRating())

    function setRating(newRating) {
        if (newRating == ratingCount) // Reset rating
            return setRating(0)

        setRatingCount(newRating)

        var newDays = [...user.days]
        var dayIndex = newDays.indexOf(day)

        if (dayIndex >= 0) {
            if (!newDays[dayIndex].ratings) {
                newDays[dayIndex].ratings = {}
            }
        } else {
            newDays.push({ currentYear: selectedData.year, week: selectedData.week, day: selectedData.day, tasks: [], ratings: {} })
            dayIndex = newDays.length - 1
        }

        newDays[dayIndex].ratings[rating.id] = newRating

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })
    }

    function getDefaultRating() {
        if (day) {
            if (day.ratings) {
                if (day.ratings[rating.id]) {
                    return day.ratings[rating.id]
                }
            }
        }

        return 0
    }
    return (
        <div className={styles.rating}>
            <div className={styles.star} onClick={() => setRating(1)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 0 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(2)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 1 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(3)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 2 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(4)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 3 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(5)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 4 ? "fas" : "far")} fa-star"></i>` }} />
        </div >
    )
}

function AddNew({ user, setDayIndex, setTasks, dayIndex, weekDayIndex }) {
    const [context, setContext] = useAppContext()
    const [addTask] = useState("default")

    function addTaskToDay(task) {
        var newDays = user.days
        var newDayIndex = dayIndex

        if (dayIndex != undefined) {
            newDays[dayIndex].tasks.push({
                taskId: task,
                time: 1
            })
        } else {
            newDays.push({
                week: context.week,
                day: weekDayIndex,
                tasks: [{
                    taskId: task,
                    time: 1
                }],
                currentYear: context.year
            })

            newDayIndex = newDays.length - 1
            setDayIndex(newDays.length - 1)
        }

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: [...newDays]
            }),
            method: "POST"
        })

        setTasks([...newDays[newDayIndex].tasks])
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

    return (
        <div className={styles.addContainer}>
            <select className={styles.addSelect} name="taskId" value={addTask} onChange={onSelect}>
                <option default value="">Add task</option>
                {getSortedTasks().filter(task => dayIndex == undefined || user.days[dayIndex].tasks.filter(i => i.taskId == task.id).length == 0).map(task => {
                    return <option key={task.id} value={task.id}>{task.name}</option>
                })}
            </select>
        </div>
    )
}


function Task({ defaultTask, dayIndexInUser, setTasks, user }) {
    var tracking = false
    var pageY = -1
    var diff = 0
    var hourToPixelRatio = 100
    var height = defaultTask.time * hourToPixelRatio
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

function roundToFourth(number) {
    return (Math.round(number * 4) / 4).toFixed(2);
}

function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

function getDay(user, day, week, year) {
    for (var selectedDay of user.days) {
        if (selectedDay.week == week && selectedDay.day == day && selectedDay.currentYear == year) {
            return selectedDay
        }
    }
}

function getDateText(day, week, year) {
    var days = week > 0 ? (week - 1) * 7 + day : day;
    var date = new Date(((year - 1970) * 31536000000) + (days * 24 * 60 * 60 * 1000))
    return String(date.getDate()).padStart(2, '0') + "." + String(date.getMonth()).padStart(2, '0')
}

export default WeekDay