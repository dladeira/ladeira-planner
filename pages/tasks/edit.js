import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'

import styles from '../../styles/tasks.module.scss'

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var [tasks, setTasks] = useState()

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    function submitNewTask(e) {
        e.preventDefault()

        var newTasks = [...tasks]
        newTasks.push({
            name: "New task",
            color: "#8ac52a",
            id: generateRandomString(64, user)
        })

        setTasks(newTasks)

        fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: newTasks
            }),
            method: "POST"
        })
    }

    return (user && tasks ? (
        <div>
            <div className={styles.edits}>
                {tasks.map(task => (
                    <Task key={task.id} task={task} user={user} tasks={tasks} setTasks={setTasks} />
                ))}
            </div>
            <form onSubmit={submitNewTask} className={styles.newEdit}>
                <button type="submit" className={styles.newEditSubmit}>ADD NEW TASK</button>
            </form>
        </div>
    ) : <div />)
}

function Task({ task, user, tasks, setTasks }) {
    const [name, setName] = useState(task.name)
    const [color, setColor] = useState(task.color)
    const [changed, setChanged] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (initial)
            return setInitial(false)
        setChanged(true)
    }, [name, color])

    async function onFormSubmit(e) {
        e.preventDefault()

        var newTasks = [...tasks]
        var taskIndex
        for (var i = 0; i < newTasks; i++) {
            console.log(tasks[i].id)
            if (newTasks[i].id == task.id) {
                taskIndex = i
                break;
            }
        }

        newTasks[i].name = name
        newTasks[i].color = color

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: newTasks
            }),
            method: "POST"
        })

        setChanged(false)
    }

    async function onDeletePress() {
        var newTasks = [...tasks.filter(currentTask => task.id != currentTask.id)]

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: newTasks
            }),
            method: "POST"
        })

        console.log(newTasks)
        setTasks(newTasks)
    }

    return (
        <form className={styles.editContainer + (changed ? " " + styles.editChanged : "")} onSubmit={onFormSubmit}>
            <input type="text" name="title" className={styles.editTitle} value={name} onChange={e => setName(e.target.value)} />
            <input type="color" name="title" className={styles.editColor} value={color} onChange={e => setColor(e.target.value)} />
            <button type="submit" className={styles.editSave}>SAVE</button>
            <button type="button" className={styles.editDelete} onClick={onDeletePress}>DELETE</button>
        </form>
    )
}

function generateRandomString(length, user) {
    while (true) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;

        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                characters.length));
        }

        // Check for duplicates
        for (var i = 0; i < user.tasks; i++) {
            if (user.tasks[i].id == result)
                continue
        }

        return result;
    }

}

export default Page