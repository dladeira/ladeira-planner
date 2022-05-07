import { useUser } from "../../lib/hooks"
import { useAppContext } from "../../lib/context"
import { getWeeksInYear, getWeeklyHours, getPercentDifference } from '../../lib/util'

import styles from '../../styles/components/categoryStats.module.scss'

function Component() {
    const [user] = useUser({ userOnly: true })

    return (
        <div className={styles.categories}>
            {user.categories.map(category =>
                <Category key={category.id} user={user} category={category} />
            )}
        </div>
    )
}

function Category({ user, category }) {
    const [context] = useAppContext()

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
        var thisWeek = getWeeklyHours(user, context.week, context.year, task.id)
        var lastWeek
        if (context.week - 1 > 0)
            lastWeek = getWeeklyHours(user, context.week - 1, context.year, task.id)
        else
            lastWeek = getWeeklyHours(user, getWeeksInYear(context.year - 1), context.year - 1, task.id)


        return (<div key={task.id} className={styles.task}>
            <div className={styles.taskKey}>{task.name}</div>
            <div className={styles.taskValue}>
                <div className={styles.taskHours}>{getWeeklyHours(user, context.week, context.year, task.id)}</div>
                (<span style={{ color: getPercentDifference(lastWeek, thisWeek) > 0 ? "green" : "red" }}>{getPercentDifference(lastWeek, thisWeek)}%</span>)
            </div>
        </div>)
    }
}


export default Component