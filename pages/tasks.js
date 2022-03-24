import { useUser } from '../lib/hooks'
import { useState, useEffect } from 'react'

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