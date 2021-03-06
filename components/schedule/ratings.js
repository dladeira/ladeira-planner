import React, { useState } from 'react'
import { useEffect } from 'react/cjs/react.production.min'
import { useAppContext } from '../../lib/context'
import { getDay } from '../../lib/util'
import { useUser } from '../../lib/hooks'

import styles from './ratings.module.scss'

export default function Ratings({ weekDay }) {
    const [context] = useAppContext()
    const [user] = useUser({ userOnly: true })

    return (
        <div className={styles.ratings}>
            {user.ratings.map(rating =>
                <Rating key={`${context.year}-${context.week}-${weekDay}-${rating.id}`} rating={rating} day={getDay(user, weekDay, context.week, context.year)} selectedData={{ day: weekDay, week: context.week, year: context.year }} />
            )}
        </div>
    )
}

export function RatingHeader({ weekDay }) {
    const [context] = useAppContext()
    const [user] = useUser({ userOnly: true })

    return (
        <div className={styles.headerWrapper}>
            <div className={styles.headerContainer}>
                {user.ratings.map(rating => <div key={`header-${weekDay}-${rating.name[0]}`} className={styles.header}>{rating.name[0]}</div>)}
            </div>
        </div>

    )
}

function Rating({ rating, day, selectedData }) {
    const [ratingCount, setRatingCount] = useState(getDefaultRating())
    const [user] = useUser({ userOnly: true })

    function setRating(newRating) {
        if (newRating == ratingCount) // Reset rating
            return setRating(0)

        setRatingCount(newRating)

        var newDays = [...user.days]
        var dayIndex = newDays.indexOf(day)

        if (dayIndex >= 0) {
            if (!newDays[dayIndex].ratings) {
                newDays[dayIndex].ratings = {}
            }
        } else {
            newDays.push({ currentYear: selectedData.year, week: selectedData.week, day: selectedData.day, tasks: [], ratings: {} })
            dayIndex = newDays.length - 1
        }

        newDays[dayIndex].ratings[rating.id] = newRating

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })
    }

    function getDefaultRating() {
        if (day) {
            if (day.ratings) {
                if (day.ratings[rating.id]) {
                    return day.ratings[rating.id]
                }
            }
        }

        return 0
    }
    return (
        <div className={styles.rating}>
            <div className={styles.star} onClick={() => setRating(1)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 0 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(2)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 1 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(3)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 2 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(4)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 3 ? "fas" : "far")} fa-star"></i>` }} />
            <div className={styles.star} onClick={() => setRating(5)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 4 ? "fas" : "far")} fa-star"></i>` }} />
        </div >
    )
}