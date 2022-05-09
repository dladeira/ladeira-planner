import { Chart as ChartJS } from 'chart.js/auto'
import { Doughnut } from 'react-chartjs-2'
import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'
import { getTask, getWeeklyTasks, getWeeklyHours } from '../../lib/util'
import CategoryStats from '../../components/overview/categoryStats'

import styles from '../../styles/overview.module.scss'

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
                        {Math.round(getWeeklyHours(user, context.week, context.year))}
                    </div>
                    <div className={styles.hoursText}>
                        Hours this week
                    </div>
                </div>
            </div>

            <CategoryStats />
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

export default Page