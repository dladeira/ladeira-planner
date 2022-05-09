import { useUser } from "../../lib/hooks"
import { useAppContext } from "../../lib/context"
import { getWeeksInYear, getWeeklyHours, getPercentDifference } from '../../lib/util'

import styles from '../../styles/components/categoryStats.module.scss'

function Component() {
    const [user] = useUser({ userOnly: true })

    return (
        <div className={styles.container}>
            {user.categories.map(category =>
                <Category key={category.id} category={category} />
            )}
        </div>
    )
}

function Category({ category }) {
    const [context] = useAppContext()
    const [user] = useUser({ userOnly: true })

    return (
        <div className={styles.category}>
            <div className={styles.header}>{category.name}</div>

            <div className={styles.tasks}>
                {user.tasks.filter(task => task.category == category.id).map(task => {
                    return getCategoryTask(task)
                })}
            </div>
        </div>
    )

    function getCategoryTask(task) {
        var thisWeek = getWeeklyHours(user, context.week, context.year, task.id)
        var lastWeek = getHoursLastWeek(task)
        var percentage = getPercentDifference(lastWeek, thisWeek)

        return (
            <div key={task.id} className={styles.task}>
                <div className={styles.taskKey}>{task.name}</div>

                <div className={styles.taskValue}>

                    <div className={styles.taskValueHours}>
                        {getWeeklyHours(user, context.week, context.year, task.id)}
                    </div>

                    <div className={styles.taskValuePercentage}>
                        (<span style={{ color: percentage > 0 ? "green" : "red" }}>
                            {percentage}%
                        </span>)
                    </div>
                </div>
            </div >
        )
    }

    function getHoursLastWeek(task) {
        // Check if week is last year
        return context.week - 1 > 0 ?
            getWeeklyHours(user, context.week - 1, context.year, task.id)
            :
            getWeeklyHours(user, getWeeksInYear(context.year - 1), context.year - 1, task.id)
    }
}


export default Component