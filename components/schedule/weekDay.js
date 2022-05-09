import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../lib/context'
import { useUser } from '../../lib/hooks'
import { useMediaQuery } from 'react-responsive'
import { getTask, getDay, getDateText } from '../../lib/util'

import Task, { AddTask } from './task'
import Ratings, { RatingHeader } from './ratings'

import styles from './weekDay.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function WeekDay({ weekDay, today }) {
    const [user, setUser] = useUser()
    const [context] = useAppContext()
    const [dayIndex, setDayIndex] = useState()
    const [dayData, setDayData] = useState()

    useEffect(() => {
        if (user) {
            var day = getDay(user, weekDay, context.week, context.year)
            if (day) {
                setDayData(day)
                setDayIndex(user.days.indexOf(day))
            } else {
                setDayData(undefined)
                setDayIndex(undefined)
            }
        }

    }, [user, context])

    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    function getSortedRecordedTasks() {
        if (dayData) {
            return dayData.tasks.sort((a, b) => getTask(a.taskId, user).name.localeCompare(getTask(b.taskId, user).name))
        }
        return []
    }


    return (user ? (
        <div className={styles.container + " " + styles.activeDay}>
            <div className={styles.title}>
                <div className={today ? styles.titleWeekDayToday : styles.titleWeekDay}>{weekDays[weekDay]}</div>
                <div className={styles.titleDate}>{getDateText(weekDay, context.week, context.year)}</div>
            </div>

            <div className={styles.tasks}>

                <Lines count={100} thickOffset={4} />

                {getSortedRecordedTasks().map(task => {
                    if (task) {
                        return <Task key={task.taskId + "-" + weekDay + "-" + context.week} defaultTask={task} dayIndex={dayIndex} setUser={setUser} user={user} tasks={dayData.tasks} />
                    }
                })}
                <div className={styles.addContainer}>
                    <AddTask setDayIndex={setDayIndex} dayIndex={dayIndex} weekDay={weekDay} />
                </div>
            </div>

            {isMobile || weekDay == 0 ? <RatingHeader user={user} weekDay={weekDay} /> : <div />}
            <Ratings user={user} weekDay={weekDay} />
        </div>
    ) : <div />)
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

export default WeekDay