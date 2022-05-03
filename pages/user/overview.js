import { Chart as ChartJS } from 'chart.js/auto'
import { Doughnut } from 'react-chartjs-2'
import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'
import { getWeeksInYear, getTask, getWeeklyTasks, getWeeklyHours, getPercentDifference } from '../../lib/util'

import styles from '../../styles/overview.module.scss'

const date = new Date()
const chartOptions = {
    cutout: "65%",
}

function Page() {
    const [user] = useUser({ userOnly: true })
    const [context] = useAppContext()

    return (user ? (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles.chart}>
                    <Doughnut data={getChartData(user)} width={10} height={10} options={chartOptions} />
                </div>

                <div className={styles.hoursContainer}>
                    <div className={styles.hours}>
                        {Math.round(getWeeklyHours(user, context.week, date.getFullYear()))}
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
        const tasks = getWeeklyTasks(user, context.week, context.year)
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
        var thisWeek = getWeeklyHours(user, context.week, date.getFullYear(), task.id)
        var lastWeek
        if (context.week - 1 > 0)
            lastWeek = getWeeklyHours(user, context.week - 1, date.getFullYear(), task.id)
        else
            lastWeek = getWeeklyHours(user, getWeeksInYear(date.getFullYear() - 1), date.getFullYear() - 1, task.id)


        return (<div key={task.id} className={styles.task}>
            <div className={styles.taskKey}>{task.name}</div>
            <div className={styles.taskValue}>
                <div className={styles.taskHours}>{getWeeklyHours(user, context.week, date.getFullYear(), task.id)}</div>
                (<span style={{ color: getPercentDifference(lastWeek, thisWeek) > 0 ? "green" : "red" }}>{getPercentDifference(lastWeek, thisWeek)}%</span>)
            </div>
        </div>)
    }
}

export default Page