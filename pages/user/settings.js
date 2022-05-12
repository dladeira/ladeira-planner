import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'

import { generateId } from '../../lib/util'

import styles from '../../styles/settings.module.scss'

function Page() {
    const [user, setUser] = useUser({ userOnly: true })

    function getSortedTasks() {
        var taskCategories = { "None": [] }

        for (var task of user.tasks) {
            if (task.category) {
                if (taskCategories[task.category]) {
                    taskCategories[task.category].push(task)
                } else {
                    taskCategories[task.category] = [task]
                }
            } else {
                taskCategories["None"].push(task)
            }
        }
        for (var category in taskCategories) {
            taskCategories[category] = taskCategories[category].sort((a, b) => a.name.localeCompare(b.name))
        }

        var allTasks = []

        for (var category in taskCategories) {
            for (var task of taskCategories[category]) {
                allTasks.push(task)
            }
        }

        return allTasks
    }

    async function submitNewTask(e) {
        e.preventDefault()

        user.tasks.push({
            name: "---",
            color: "#8ac52a",
            id: generateId(user)
        })

        setUser({ ...user })

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                tasks: user.tasks
            }),
            method: "POST"
        })
    }

    async function submitNewCategory(e) {
        e.preventDefault()

        user.categories.push({
            name: "---",
            id: generateId(user)
        })

        setUser({ ...user })

        await fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                categories: user.categories
            }),
            method: "POST"
        })
    }

    async function submitNewRating(e) {
        e.preventDefault()

        user.ratings.push({
            name: "---",
            id: generateId(user)
        })

        setUser({ ...user })

        await fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                email: user.email,
                ratings: user.ratings
            }),
            method: "POST"
        })
    }

    return (user ? (
        <div className={styles.container}>
            <div className={styles.categoryTitle}>DATA VALUES</div>
            <div className={styles.category}>
                <div className={styles.list}>
                    <div className={styles.listHeader}>Tasks</div>
                    <div className={styles.listContainer}>
                        {getSortedTasks().map(task => (
                            <Task key={task.id} task={task} />
                        ))}
                    </div>
                    <form onSubmit={submitNewTask} className={styles.newTask}>
                        <button type="submit" className={styles.newTaskSubmit}>NEW TASK</button>
                    </form>
                </div>

                <div className={styles.list}>
                    <div className={styles.listHeader}>Categories</div>
                    <div className={styles.listContainer}>
                        {user.categories.map(category => (
                            <Category key={category.id} category={category} />
                        ))}
                    </div>
                    <form onSubmit={submitNewCategory} className={styles.newTask}>
                        <button type="submit" className={styles.newTaskSubmit}>NEW CATEGORY</button>
                    </form>
                </div>

                <div className={styles.list}>
                    <div className={styles.listHeader}>Ratings</div>
                    <div className={styles.listContainer}>
                        {user.ratings.map(rating => (
                            <Rating key={rating.id} rating={rating} />
                        ))}
                    </div>
                    <form onSubmit={submitNewRating} className={styles.newTask}>
                        <button type="submit" className={styles.newTaskSubmit}>NEW RATING</button>
                    </form>
                </div>
            </div>
        </div>
    ) : <div />)
}

function Task({ task }) {
    const [user, setUser] = useUser()
    const [name, setName] = useState(task.name)
    const [color, setColor] = useState(task.color)
    const [category, setCategory] = useState(task.category)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (!initial)
            save()
        else
            setInitial(false)
    }, [name, color, category, initial, save])

    function getIndex() {
        for (var i = 0; i < user.tasks.length; i++) {
            if (user.tasks[i].id == task.id) {
                return i
            }
        }
    }

    async function save() {
        var taskIndex = getIndex()

        user.tasks[taskIndex].name = name
        user.tasks[taskIndex].color = color
        user.tasks[taskIndex].category = category ? category : undefined


        setUser({ ...user })
        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                tasks: user.tasks
            }),
            method: "POST"
        })
    }

    async function onDeletePress() {
        user.tasks = user.tasks.filter(currentTask => task.id != currentTask.id)

        for (var dayIndex in user.days) {
            user.days[dayIndex].tasks = user.days[dayIndex].tasks.filter(dayTask => dayTask.taskId != task.id)
        }

        console.log("and now we dissapear")

        await fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                days: user.days
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                tasks: user.tasks
            }),
            method: "POST"
        })

        setUser({ ...user })
    }

    return (user ? (
        <div className={styles.task}>
            <div className={styles.taskDelete} type="button" onClick={onDeletePress}>+</div>
            <select className={styles.taskCategory} name="category" value={category} onChange={e => { setCategory(e.target.value) }}>
                <option value="">None</option>
                {user.categories.map(category => <option key={task.id + "-" + category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input className={styles.taskName} type="text" name="title" value={name} onChange={e => { setName(e.target.value) }} />
            <div className={styles.taskColorContainer}>
                <input className={styles.taskColor} type="color" name="color" value={color} onChange={e => { setColor(e.target.value) }} />
            </div>
        </div>
    ) : <div />)
}

function Category({ category }) {
    const [user, setUser] = useUser()
    const [name, setName] = useState(category.name)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (!initial)
            save()
        else
            setInitial(false)
    }, [name, initial, save])

    async function save() {
        var categoryIndex
        for (var i = 0; i < user.categories.length; i++) {
            if (user.categories[i].id == category.id) {
                categoryIndex = i
                break;
            }
        }

        user.categories[categoryIndex].name = name

        setUser({ ...user })
        await fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                email: user.email,
                categories: user.categories
            }),
            method: "POST"
        })
    }

    async function onDeletePress() {
        user.categories = user.categories.filter(currentCategory => category.id != currentCategory.id)

        for (var taskIndex in user.tasks) {
            var task = user.tasks[taskIndex]
            for (var taskIndex in task.tasks) {
                var selectedTask = task.tasks[taskIndex]

                if (category.id == selectedTask.category) {
                    selectedTask.category = undefined
                }
            }
        }

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: user.tasks
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                email: user.email,
                categories: user.categories
            }),
            method: "POST"
        })

        setUser({ ...user })
    }

    return (user ? (
        <div className={styles.task}>
            <div className={styles.taskDelete} type="button" onClick={onDeletePress}>+</div>
            <input className={styles.taskName} type="text" name="title" value={name} onChange={e => { setName(e.target.value) }} />
        </div>
    ) : <div />)
}

function Rating({ rating }) {
    const [user, setUser] = useUser()
    const [name, setName] = useState(rating.name)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (!initial)
            save()
        else
            setInitial(false)
    }, [name, initial, save])

    async function save() {
        var ratingIndex
        for (var i = 0; i < user.ratings.length; i++) {
            if (user.ratings[i].id == rating.id) {
                ratingIndex = i
                break;
            }
        }

        user.ratings[ratingIndex].name = name

        setUser({ ...user })
        await fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                ratings: user.ratings
            }),
            method: "POST"
        })
    }

    async function onDeletePress() {
        user.ratings = user.ratings.filter(currentRating => rating.id != currentRating.id)

        for (var dayIndex in user.days) {
            var day = user.days[dayIndex]
            if (day.ratings) {
                for (var ratingIndex in day.ratings) {
                    var selectedRating = day.ratings[ratingIndex]

                    if (rating.id == selectedRating.id) {
                        delete user.days[dayIndex].ratings[ratingIndex]
                    }
                }
            } else {
                day.ratings = []
            }
        }

        await fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                days: user.days
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                ratings: user.ratings
            }),
            method: "POST"
        })

        setUser({ ...user })
    }

    return (
        <div className={styles.task}>
            <div className={styles.taskDelete} type="button" onClick={onDeletePress}>+</div>
            <input className={styles.taskName} type="text" name="title" value={name} onChange={e => { setName(e.target.value) }} />
        </div>
    )
}

function categoryToString(categoryId, user) {
    for (var category of user.categories) {
        if (category.id == categoryId) {
            return category.name
        }
    }
}

export default Page