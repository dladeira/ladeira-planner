import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'
import Link from 'next/link'

import styles from '../../styles/tasks.module.scss'

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var [tasks, setTasks] = useState()

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    return (user && tasks ? (
        <div>
            <div className={styles.tasks}>
                {tasks.map(task => (
                    <Task key={task.id} task={task} user={user} />
                ))}
            </div>
            <Link href="/tasks/edit">
                <a className={styles.editLink}>Edit Tasks</a>
            </Link>
        </div>

    ) : <div />)
}

function Task({ task, user }) {
    return (
        <div className={styles.taskContainer} style={{ backgroundColor: task.color }}>
            <div className={styles.taskTitle}>{task.name}</div>
            <div className={styles.taskHours}>Total Hours: {getTotalHoursForTask(task.id, user)}</div>
        </div>
    )
}

function getTotalHoursForTask(taskId, user) {
    var hours = 0

    for (var day of user.days) {
        for (var task of day.tasks) {
            if (task.taskId == taskId)
                hours += task.time
        }
    }

    return hours
}

export default Page