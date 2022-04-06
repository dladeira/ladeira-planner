import { useState, useEffect } from 'react'
import { useUser } from '../../lib/hooks'
import { Chart as ChartJS } from 'chart.js/auto'
import { Doughnut, Dougnut } from 'react-chartjs-2'

import styles from '../../styles/journal.module.scss'

var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Page() {
    const user = useUser({ redirectTo: '/api/login' })
    var date = new Date()
    const [tasks, setTasks] = useState()
    const [selectedDay, setSelectedDay] = useState(getWeekDay(date))
    const [selectedWeek, setSelectedWeek] = useState(date.getCurrentWeek())
    const [selectedYear, setSelectedYear] = useState(date.getFullYear())

    function toggleDay(increment) {
        if (increment) {
            if (selectedDay + 1 > 6 || !isInYear(selectedYear, selectedWeek, selectedDay + 1)) {
                if (selectedWeek + 1 >= getWeeksInYear(selectedYear)) {
                    setSelectedDay(getWeekDay(new Date(selectedYear + 1, 0, 1)))
                    setSelectedWeek(1)
                    setSelectedYear(selectedYear + 1)
                } else {
                    setSelectedWeek(selectedWeek + 1)
                    setSelectedDay(0)
                }
            } else {
                setSelectedDay(selectedDay + 1)
            }
        } else {
            if (selectedDay - 1 < 0 || !isInYear(selectedYear, selectedWeek, selectedDay - 1)) {
                if (selectedWeek - 1 <= 0) {
                    setSelectedDay(getWeekDay(new Date(selectedYear - 1, 11, 31)))

                    setSelectedWeek(getWeeksInYear(selectedYear - 1))
                    setSelectedYear(selectedYear - 1)
                } else {
                    setSelectedWeek(selectedWeek - 1)
                    setSelectedDay(6)
                }
            } else {
                setSelectedDay(selectedDay - 1)
            }
        }
    }

    function toggleWeek(increment) {
        if (increment) {
            if (selectedWeek + 1 >= getWeeksInYear(selectedYear)) {
                setSelectedDay(getWeekDay(new Date(selectedYear + 1, 0, 1)))
                setSelectedWeek(1)
                setSelectedYear(selectedYear + 1)
            } else {
                setSelectedWeek(selectedWeek + 1)
            }
        } else {
            if (selectedWeek - 1 <= 0) {
                setSelectedDay(getWeekDay(new Date(selectedYear - 1, 11, 31)))

                setSelectedWeek(getWeeksInYear(selectedYear - 1))
                setSelectedYear(selectedYear - 1)
            } else {
                setSelectedWeek(selectedWeek - 1)
            }
        }
    }

    useEffect(() => {
        if (user) {
            setTasks(user.tasks)
        }
    }, [user])

    const options = {
        cutout: 150
    }

    return (user && tasks ? (
        <div className={styles.container}>
            <div className={styles.weekNumberContainer}>
                <div className={styles.weekNumberArrowLeft} onClick={e => { toggleWeek(false) }}><div className={styles.weekNumberArrowText}>{"<"}</div></div>
                <div className={styles.weekNumberArrowLeft} onClick={e => { toggleDay(false) }}><div className={styles.weekNumberArrowText}>{"<"}</div></div>
                <div className={styles.weekNumberText}>WEEK {selectedWeek} ({selectedYear})</div>
                <div className={styles.weekNumberArrowRight} onClick={e => { toggleDay(true) }}><div className={styles.weekNumberArrowText}>{">"}</div></div>
                <div className={styles.weekNumberArrowRight} onClick={e => { toggleWeek(true) }}><div className={styles.weekNumberArrowText}>{">"}</div></div>
            </div>

            <div className={styles.weekDays}>
                <div className={selectedDay == 0 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(0) }}>Monday</div>
                <div className={selectedDay == 1 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(1) }}>Tuesday</div>
                <div className={selectedDay == 2 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(2) }}>Wednesday</div>
                <div className={selectedDay == 3 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(3) }}>Thursday</div>
                <div className={selectedDay == 4 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(4) }}>Friday</div>
                <div className={selectedDay == 5 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(5) }}>Saturday</div>
                <div className={selectedDay == 6 ? styles.weekDayCurrent : styles.weekDay} onClick={e => { setSelectedDay(6) }}>Sunday</div>
            </div>

            <div className={styles.content}>
                <div className={styles.chart}>
                    <Doughnut data={getChartData(user, selectedDay, selectedWeek, selectedYear)} width={10} height={10} options={options} />
                </div>

                <div className={styles.inputContainer}>
                    <div className={styles.inputHeader}>Note</div>
                    <NoteInput user={user} day={getDay(user, selectedDay, selectedWeek, selectedYear)} selectedData={{ day: selectedDay, week: selectedWeek, year: selectedYear }} />
                    <div className={styles.inputHeader}>Ratings</div>
                    <div className={styles.ratings}>
                        {user.ratings.map(rating => <Rating key={`${selectedDay}-${selectedWeek}-${selectedYear}-${rating.id}`} selectedData={{ day: selectedDay, week: selectedWeek, year: selectedYear }} rating={rating} user={user} day={getDay(user, selectedDay, selectedWeek, selectedYear)} />)}
                    </div>
                </div>
            </div>
        </div>
    ) : <div />)
}

function NoteInput({ user, day, selectedData }) {
    var text = getDefaultNote()
    var edited = false

    var timeSinceEdit = 0

    useEffect(() => {
        const id = setInterval(() => {
            timeSinceEdit += 100

            if (timeSinceEdit > 1000 && edited) {
                saveNote()
            }
        }, 100)

        return () => clearInterval(id)
    }, [])

    function saveNote() {
        setEdited(false)
        edited = false

        var newDays = [...user.days]
        var dayIndex = newDays.indexOf(day)

        if (dayIndex >= 0) {
            newDays[dayIndex].note = text
        } else {
            newDays.push({ currentYear: selectedData.year, week: selectedData.week, day: selectedData.day, note: text, tasks: [] })
        }

        fetch(window.origin + "/api/days", {
            body: JSON.stringify({
                email: user.email,
                days: newDays
            }),
            method: "POST"
        })
    }

    function getDefaultNote() {
        if (day && day.note) {
            return day.note
        }

        return ""
    }

    function setEdited(edited) {
        document.getElementById("saveStatus").innerHTML = edited ? "Saving..." : "Saved"
    }

    function onChange(e) {
        timeSinceEdit = 0

        setEdited(true)
        edited = true

        text = e.target.value
    }

    return (
        <div>
            <textarea type="text" onChange={onChange} defaultValue={text} />
            <div id={"saveStatus"}>Saved</div>
        </div>
    )
}

function Rating({ rating, user, day, selectedData }) {
    const [ratingCount, setRatingCount] = useState(getDefaultRating())

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
            newDays.push({ currentYear: selectedData.year, week: selectedData.week, day: selectedData.day, note: text, tasks: [] })
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
        <div className={styles.ratingContainer}>
            <div className={styles.ratingText}>{rating.name}</div>
            <div className={styles.starContainer}>
                <div className={styles.rating} onClick={() => setRating(1)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 0 ? "fas" : "far")} fa-star"></i>` }} />
                <div className={styles.rating} onClick={() => setRating(2)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 1 ? "fas" : "far")} fa-star"></i>` }} />
                <div className={styles.rating} onClick={() => setRating(3)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 2 ? "fas" : "far")} fa-star"></i>` }} />
                <div className={styles.rating} onClick={() => setRating(4)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 3 ? "fas" : "far")} fa-star"></i>` }} />
                <div className={styles.rating} onClick={() => setRating(5)} dangerouslySetInnerHTML={{ __html: `<i class="${(ratingCount > 4 ? "fas" : "far")} fa-star"></i>` }} />
            </div>
        </div >
    )
}

function getChartData(user, day, week, year) {
    var day = getDay(user, day, week, year)
    var labels = []
    var data = []
    var backgroundColor = []

    if (day && day.tasks) {
        for (var task of day.tasks) {
            console.log(day)
            labels.push(getTask(task.taskId, user).name)
            backgroundColor.push(getTask(task.taskId, user).color)
            data.push(task.time)
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

function getDay(user, day, week, year) {
    for (var selectedDay of user.days) {
        if (selectedDay.week == week && selectedDay.day == day && selectedDay.currentYear == year) {
            return selectedDay
        }
    }
}

function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

Date.prototype.getCurrentWeek = () => {
    var date = new Date()

    // ISO week date weeks start on Monday, so correct the day number
    var nDay = (date.getDay() + 6) % 7

    // ISO 8601 states that week 1 is the week with the first Thursday of that year
    // Set the target date to the Thursday in the target week
    date.setDate(date.getDate() - nDay + 3)

    // Store the millisecond value of the target date
    var n1stThursday = date.valueOf()

    // Set the target to the first Thursday of the year
    // First, set the target to January 1st
    date.setMonth(0, 1)

    // Not a Thursday? Correct the date to the next Thursday
    if (date.getDay() !== 4) {
        date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7)
    }

    // The week number is the number of weeks between the first Thursday of the year
    // and the Thursday in the target week (604800000 = 7 * 24 * 3600 * 1000)
    return 1 + Math.ceil((n1stThursday - date) / 604800000)
}

function getWeekDay(date) {
    var dayNumber = date.getDay() - 1
    return dayNumber < 0 ? 6 : dayNumber
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

function isInYear(year, week, dayIndex) {
    var firstWeekDay = getWeekDay(new Date(year, 0, 1));
    var lastWeekDay = getWeekDay(new Date(year, 11, 31))

    if ((week == 1 && dayIndex < firstWeekDay) || (week == getWeeksInYear(year) && dayIndex > lastWeekDay))
        return false
    return true

}
export default Page