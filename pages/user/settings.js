import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'

import styles from '../../styles/settings.module.scss'

function Page() {
    var user = useUser({ redirectTo: '/api/login' })
    var [tasks, setTasks] = useState()
    var [categories, setCategories] = useState()
    var [ratings, setRatings] = useState()

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
            setCategories(user.categories)
            setRatings(user.ratings)
        }
    }, [user])

    function getSortedTasks() {
        var taskCategories = { "NONE": []}

        for (var task of tasks) {
            if (task.category) {
                if (taskCategories[task.category]) {
                    taskCategories[task.category].push(task)
                } else {
                    taskCategories[task.category] = [task]
                }
            } else {
                taskCategories["NONE"].push(task)
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

    function submitNewCategory(e) {
        e.preventDefault()

        var newCategories = [...categories]
        newCategories.push({
            name: "New category",
            id: generateRandomString(64, user)
        })

        setCategories(newCategories)

        fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                email: user.email,
                categories: newCategories
            }),
            method: "POST"
        })
    }

    function submitNewRating(e) {
        e.preventDefault()

        var newRatings = [...ratings]
        newRatings.push({
            name: "New rating",
            id: generateRandomString(64, user)
        })

        setRatings(newRatings)

        fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                email: user.email,
                ratings: newRatings
            }),
            method: "POST"
        })
    }

    return (user && tasks ? (
        <div className={styles.container}>
            <div className={styles.setting}>
                <div className={styles.settingHeader}>Tasks</div>
                <div className={styles.settingContainer}>
                    {getSortedTasks().map(task => (
                        <Task key={task.id} task={task} user={user} tasks={tasks} setTasks={setTasks} categories={categories} />
                    ))}
                </div>
                <form onSubmit={submitNewTask} className={styles.newTask}>
                    <button type="submit" className={styles.newTaskSubmit}>NEW TASK</button>
                </form>
            </div>

            <div className={styles.setting}>
                <div className={styles.settingHeader}>Categories</div>
                <div className={styles.settingContainer}>
                    {categories.map(category => (
                        <Category key={category.id} category={category} user={user} categories={categories} setCategories={setCategories} />
                    ))}
                </div>
                <form onSubmit={submitNewCategory} className={styles.newTask}>
                    <button type="submit" className={styles.newTaskSubmit}>NEW CATEGORY</button>
                </form>
            </div>

            <div className={styles.setting}>
                <div className={styles.settingHeader}>Ratings</div>
                <div className={styles.settingContainer}>
                    {ratings.map(rating => (
                        <Rating key={rating.id} rating={rating} user={user} ratings={ratings} setRatings={setRatings} />
                    ))}
                </div>
                <form onSubmit={submitNewRating} className={styles.newTask}>
                    <button type="submit" className={styles.newTaskSubmit}>NEW RATING</button>
                </form>
            </div>
        </div>
    ) : <div />)
}

function Task({ task, user, tasks, setTasks, categories }) {
    const [name, setName] = useState(task.name)
    const [color, setColor] = useState(task.color)
    const [category, setCategory] = useState(task.category)
    const [editing, setEditing] = useState(false)

    async function onSavePress() {
        var newTasks = [...tasks]
        var taskIndex
        for (var i = 0; i < newTasks.length; i++) {
            if (newTasks[i].id == task.id) {
                taskIndex = i
                break;
            }
        }

        newTasks[taskIndex].name = name
        newTasks[taskIndex].color = color
        newTasks[taskIndex].category = category ? category : undefined

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: newTasks
            }),
            method: "POST"
        })

        setEditing(false)
        setTasks(newTasks)
    }

    async function onDeletePress() {
        var newTasks = [...tasks.filter(currentTask => task.id != currentTask.id)]
        var newDays = [...user.days]

        for (var dayIndex in newDays) {
            var day = newDays[dayIndex]
            for (var taskIndex in day.tasks) {
                var selectedTask = day.tasks[taskIndex]

                if (task.id == selectedTask.taskId) {
                    delete newDays[dayIndex].tasks[taskIndex]
                }
            }
        }

        await fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/tasks", {
            body: JSON.stringify({
                email: user.email,
                tasks: newTasks
            }),
            method: "POST"
        })

        setTasks(newTasks)
    }

    return (
        <>
            {(editing ? (
                    <form className={styles.taskEdit}>
                        <select className={styles.taskEditCategory} name="category" value={category} onChange={e => { setCategory(e.target.value) }}>
                            <option value="">NONE</option>
                            {categories.map(category => <option value={category.id}>{category.name}</option>)}
                        </select>
                        <input className={styles.taskEditName} type="text" name="title" value={name} onChange={e => setName(e.target.value)} />
                        <input className={styles.taskEditColor} type="color" name="color" value={color} onChange={e => setColor(e.target.value)} />
                        <button className={styles.taskEditSave} type="button" onClick={onSavePress}>SAVE</button>
                        <button className={styles.taskEditDelete} type="button" onClick={onDeletePress}>DELETE</button>
                    </form>
            ) : (
                <div className={styles.taskNormal} style={{borderBottom: "solid 2px " + task.color}}>
                    <div className={styles.taskNormalCategory}>{task.category ? categoryToString(task.category, user) : "NONE"}</div>
                    <div className={styles.taskNormalName}>{task.name}</div>
                    <div className={styles.taskNormalEdit} onClick={e => setEditing(true)}>EDIT</div>
                </div>
            ))}
        </>
    )
}

function Category({ category, user, categories, setCategories }) {
    const [name, setName] = useState(category.name)
    const [editing, setEditing] = useState(false)

    async function onSavePress() {
        var newCategories = [...categories]
        var categoryIndex
        for (var i = 0; i < newCategories.length; i++) {
            if (newCategories[i].id == category.id) {
                categoryIndex = i
                break;
            }
        }

        newCategories[i].name = name

        await fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                email: user.email,
                categories: newCategories
            }),
            method: "POST"
        })

        setEditing(false)
    }

    async function onDeletePress() {
        var newCategories = [...categories.filter(currentCategory => category.id != currentCategory.id)]
        var newTasks = [...user.tasks]

        for (var taskIndex in newTasks) {
            var task = newTasks[taskIndex]
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
                tasks: newTasks
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/categories", {
            body: JSON.stringify({
                email: user.email,
                categories: newCategories
            }),
            method: "POST"
        })

        setCategories(newCategories)
    }

    return (
        <>
            {(editing ? (
                    <form className={styles.taskEdit}>
                        <input className={styles.taskEditName} type="text" name="title" value={name} onChange={e => setName(e.target.value)} />
                        <button className={styles.taskEditSave} type="button" onClick={onSavePress}>SAVE</button>
                        <button className={styles.taskEditDelete} type="button" onClick={onDeletePress}>DELETE</button>
                    </form>
            ) : (
                <div className={styles.taskNormal}>
                    <div className={styles.taskNormalName}>{category.name}</div>
                    <div className={styles.taskNormalEdit} onClick={e => setEditing(true)}>EDIT</div>
                </div>
            ))}
        </>
    )
}

function Rating({ rating, user, ratings, setRatings }) {
    const [name, setName] = useState(rating.name)
    const [editing, setEditing] = useState(false)

    async function onSavePress() {

        var newRatings = [...ratings]
        var ratingIndex
        for (var i = 0; i < newRatings.length; i++) {
            if (newRatings[i].id == rating.id) {
                ratingIndex = i
                break;
            }
        }

        newRatings[ratingIndex].name = name

        await fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                email: user.email,
                ratings: newRatings
            }),
            method: "POST"
        })

        setEditing(false)
    }

    async function onDeletePress() {
        var newRatings = [...ratings.filter(currentRating => rating.id != currentRating.id)]
        var newDays = [...user.days]

        for (var dayIndex in newDays) {
            var day = newDays[dayIndex]
            if (day.ratings) {
                for (var ratingIndex in day.ratings) {
                    var selectedRating = day.ratings[ratingIndex]

                    if (rating.id == selectedRating.id) {
                        delete newDays[dayIndex].ratings[ratingIndex]
                    }
                }
            } else {
                day.ratings = []
            }
        }

        await fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })

        await fetch(window.origin + "/api/ratings", {
            body: JSON.stringify({
                email: user.email,
                ratings: newRatings
            }),
            method: "POST"
        })

        setRatings(newRatings)
    }

    return (
        <>
            {(editing ? (
                    <form className={styles.taskEdit}>
                        <input className={styles.taskEditName} type="text" name="title" value={name} onChange={e => setName(e.target.value)} />
                        <button className={styles.taskEditSave} type="button" onClick={onSavePress}>SAVE</button>
                        <button className={styles.taskEditDelete} type="button" onClick={onDeletePress}>DELETE</button>
                    </form>
            ) : (
                <div className={styles.taskNormal}>
                    <div className={styles.taskNormalName}>{rating.name}</div>
                    <div className={styles.taskNormalEdit} onClick={e => setEditing(true)}>EDIT</div>
                </div>
            ))}
        </>
    )
}

function generateRandomString(length, user) {
    while (true) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

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

function categoryToString(categoryId, user) {
    for (var category of user.categories) {
        if (category.id == categoryId) {
            return category.name
        }
    }
}

export default Page