import { useUser } from '../../lib/hooks'
import { useState, useEffect } from 'react'

import styles from '../../styles/tasks.module.scss'

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
        var sorted = tasks.sort((a, b) => a.name.localeCompare(b.name))

        return sorted
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
        <div>
            <div className={styles.editHeader}>Tasks</div>
            <div className={styles.edits}>
                {getSortedTasks().map(task => (
                    <Task key={task.id} task={task} user={user} tasks={tasks} setTasks={setTasks} categories={categories} />
                ))}
            </div>
            <form onSubmit={submitNewTask} className={styles.newEdit}>
                <button type="submit" className={styles.newEditSubmit}>ADD NEW TASK</button>
            </form>


            <div className={styles.editHeader}>Categories</div>
            <div className={styles.edits}>
                {categories.map(category => (
                    <Category key={category.id} category={category} user={user} categories={categories} setCategories={setCategories} />
                ))}
            </div>
            <form onSubmit={submitNewCategory} className={styles.newEdit}>
                <button type="submit" className={styles.newEditSubmit}>ADD NEW CATEGORY</button>
            </form>

            <div className={styles.editHeader}>Ratings</div>
            <div className={styles.edits}>
                {ratings.map(rating => (
                    <Rating key={rating.id} rating={rating} user={user} ratings={ratings} setRatings={setRatings} />
                ))}
            </div>
            <form onSubmit={submitNewRating} className={styles.newEdit}>
                <button type="submit" className={styles.newEditSubmit}>ADD NEW RATING</button>
            </form>
        </div>
    ) : <div />)
}

function Task({ task, user, tasks, setTasks, categories }) {
    const [name, setName] = useState(task.name)
    const [color, setColor] = useState(task.color)
    const [changed, setChanged] = useState(false)
    const [initial, setInitial] = useState(true)
    const [category, setCategory] = useState(task.category)

    useEffect(() => {
        if (initial)
            return setInitial(false)
        setChanged(true)
    }, [name, color, category])

    async function onFormSubmit(e) {
        e.preventDefault()

        var newTasks = [...tasks]
        var taskIndex
        for (var i = 0; i < newTasks.length; i++) {
            if (newTasks[i].id == task.id) {
                taskIndex = i
                break;
            }
        }

        newTasks[i].name = name
        newTasks[i].color = color
        newTasks[i].category = e.target.category.value ? e.target.category.value : undefined

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
        <form className={styles.editContainer + (changed ? " " + styles.editChanged : "")} onSubmit={onFormSubmit}>
            <input type="text" name="title" className={styles.editTitle} value={name} onChange={e => setName(e.target.value)} />
            <input type="color" name="color" className={styles.editColor} value={color} onChange={e => setColor(e.target.value)} />
            <select className={styles.editCategory} name="category" value={category} onChange={e => { setCategory(e.target.value) }}>
                <option value="">Uncategorized</option>
                {categories.map(category => <option value={category.id}>{category.name}</option>)}
            </select>
            <button type="submit" className={styles.editSave}>SAVE</button>
            <button type="button" className={styles.editDelete} onClick={onDeletePress}>DELETE</button>
        </form>
    )
}

function Category({ category, user, categories, setCategories }) {
    const [name, setName] = useState(category.name)
    const [changed, setChanged] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (initial)
            return setInitial(false)
        setChanged(true)
    }, [name])

    async function onFormSubmit(e) {
        e.preventDefault()

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

        setChanged(false)
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
        <form className={styles.editContainer + (changed ? " " + styles.editChanged : "")} onSubmit={onFormSubmit}>
            <input type="text" name="title" className={styles.editTitle} value={name} onChange={e => setName(e.target.value)} />
            <button type="submit" className={styles.editSave}>SAVE</button>
            <button type="button" className={styles.editDelete} onClick={onDeletePress}>DELETE</button>
        </form>
    )
}

function Rating({ rating, user, ratings, setRatings }) {
    const [name, setName] = useState(rating.name)
    const [changed, setChanged] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        if (initial)
            return setInitial(false)
        setChanged(true)
    }, [name])

    async function onFormSubmit(e) {
        e.preventDefault()

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

        setChanged(false)
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
        <form className={styles.editContainer + (changed ? " " + styles.editChanged : "")} onSubmit={onFormSubmit}>
            <input type="text" name="title" className={styles.editTitle} value={name} onChange={e => setName(e.target.value)} />
            <button type="submit" className={styles.editSave}>SAVE</button>
            <button type="button" className={styles.editDelete} onClick={onDeletePress}>DELETE</button>
        </form>
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

export default Page