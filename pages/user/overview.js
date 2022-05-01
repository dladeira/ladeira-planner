import { Chart as ChartJS } from 'chart.js/auto'
import { Doughnut } from 'react-chartjs-2'

import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'

import styles from '../../styles/overview.module.scss'

const date = new Date()
const chartOptions = {
    cutout: "65%",
}

function Page() {
    const user = useUser({ redirectTo: '/api/login' })
    const [context, setContext] = useAppContext()

    return (user ? (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles.chart}>
                    <Doughnut data={getChartData(user)} width={10} height={10} options={chartOptions} />
                </div>

                <div className={styles.hoursContainer}>
                    <div className={styles.hours}>
                        {Math.round(getHoursInWeek(user, context.week, date.getFullYear()))}
                    </div>
                    <div className={styles.hoursText}>
                        Hours this week
                    </div>
                </div>
            </div>

            <div className={styles.categories}>
                {user.categories.map(category =>
                    <CategoryMenu key={category.id} user={user} category={category} />
                )}
            </div>
        </div>
    ) : <div />)

    function getChartData(user) {
        const tasks = getTasksInWeek(user, context.week, context.year)
        var labels = []
        var data = []
        var backgroundColor = []

        if (tasks.length > 0) {
            for (var task of tasks) {
                var exists = false
                var dataIndex = -1
                var name = getTask(task.taskId, user).name

                for (var labelIndex in labels) {
                    if (labels[labelIndex] == name) {
                        exists = true
                        dataIndex = labelIndex
                    }
                }

                if (!exists) {
                    labels.push(name)
                    backgroundColor.push(getTask(task.taskId, user).color)
                    data.push(task.time)
                } else {
                    data[dataIndex] += task.time
                }
            }
        } else {
            labels.push("NONE")
            backgroundColor.push("gray")
            data.push(1)
        }

        var data = {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: backgroundColor
                }
            ]
        }

        return data
    }
}

function CategoryMenu({ user, category }) {
    const [context, setContext] = useAppContext()
    
    return (
        <div className={styles.category}>
            <div className={styles.categoryHeader}>{category.name}</div>

            <div className={styles.tasksList}>
                {user.tasks.filter(task => task.category == category.id).map(task => {
                    return getCategoryTask(task)
                })}
            </div>
        </div>
    )

    function getCategoryTask(task) {
        var thisWeek = getHoursInWeekForTask(user, context.week, date.getFullYear(), task.id)
        var lastWeek
        if (context.week - 1 > 0)
            lastWeek = getHoursInWeekForTask(user, context.week - 1, date.getFullYear(), task.id)
        else
            lastWeek = getHoursInWeekForTask(user, getWeeksInYear(date.getFullYear() - 1), date.getFullYear() - 1, task.id)


        return (<div key={task.id} className={styles.task}>
            <div className={styles.taskKey}>{task.name}</div>
            <div className={styles.taskValue}>
                <div className={styles.taskHours}>{getHoursInWeekForTask(user, context.week, date.getFullYear(), task.id)}</div>
                (<span style={{ color: getPercentDifference(lastWeek, thisWeek) > 0 ? "green" : "red" }}>{getPercentDifference(lastWeek, thisWeek)}%</span>)
            </div>
        </div>)
    }
}

function getHoursInWeekForTask(user, currentWeek, currentYear, taskId) {
    var totalHours = 0

    for (var task of getTasksInWeek(user, currentWeek, currentYear)) {
        if (task.taskId == taskId)
            totalHours += task.time
    }

    return totalHours
}

function getHoursInWeek(user, currentWeek, currentYear) {
    var totalHours = 0

    for (var task of getTasksInWeek(user, currentWeek, currentYear)) {
        totalHours += task.time
    }

    return totalHours
}

function getTasksInWeek(user, currentWeek, currentYear, category) {
    var tasks = []
    for (var day of user.days) {
        if (day.week == currentWeek && day.currentYear == currentYear) {
            for (var task of day.tasks) {
                if (!category || getTask(task.taskId, user).category == category) {
                    tasks.push(task)
                }
            }
        }
    }

    return tasks
}

function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

function getWeeksInYear(y) {
    var d,
        isLeap

    d = new Date(y, 0, 1)
    isLeap = new Date(y, 1, 29).getMonth() === 1

    //check for a Jan 1 that's a Thursday or a leap year that has a 
    //Wednesday jan 1. Otherwise it's 52
    return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52
}

function getPercentDifference(num1, num2) {
    if (num1 <= 0 && num2 <= 0) {
        return 0
    }

    if (num1 <= 0) {
        return num2 * 100
    }

    var increase = num2 - num1
    return Math.round(increase / (num1) * 100)
}

export default Page