import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var [tasks, setTasks] = useState()

    function submitNewTask(e) {
        e.preventDefault()

        user.tasks.push({
            name: e.target.name.value,
            color: e.target.color.value
        })

        console.log("setting new task")
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
                <div style={{color: task.color}}>
                    {task.name}
                </div>
            ))}

            <form onSubmit={submitNewTask}>
                <input name="name" type="text" placeholder="new task name" />
                <input name="color" type="color" />
                <button type="submit">ADD NEW TASK</button>
            </form>
        </div>
    ) : <div />)
}

export default Page