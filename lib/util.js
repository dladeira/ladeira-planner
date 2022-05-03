// Dates

export function getWeekDay(date) {
    var dayNumber = date.getDay() - 1
    return dayNumber < 0 ? 6 : dayNumber
}

export function isInYear(year, week, dayIndex) {
    var firstWeekDay = getWeekDay(new Date(year, 0, 1));
    var lastWeekDay = getWeekDay(new Date(year, 11, 31))

    if ((week == 1 && dayIndex < firstWeekDay) || (week == getWeeksInYear(year) && dayIndex > lastWeekDay))
        return false
    return true
}

export function getWeeksInYear(y) {
    var d,
        isLeap

    d = new Date(y, 0, 1)
    isLeap = new Date(y, 1, 29).getMonth() === 1

    //check for a Jan 1 that's a Thursday or a leap year that has a 
    //Wednesday jan 1. Otherwise it's 52
    return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52
}

// Math

export function roundToFourth(number) {
    return (Math.round(number * 4) / 4).toFixed(2);
}

export function getPercentDifference(num1, num2) {
    if (num1 <= 0 && num2 <= 0) {
        return 0
    }

    if (num1 <= 0) {
        return num2 * 100
    }

    var increase = num2 - num1
    return Math.round(increase / (num1) * 100)
}

// Tasks

export function getWeeklyTasks(user, currentWeek, currentYear, category) {
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

export function getTask(id, user) {
    for (var i = 0; i < user.tasks.length; i++) {
        if (user.tasks[i].id == id)
            return user.tasks[i]
    }
}

export function getWeeklyHours(user, currentWeek, currentYear, taskId) {
    var totalHours = 0

    for (var task of getWeeklyTasks(user, currentWeek, currentYear)) {
        if (!taskId || task.taskId == taskId)
            totalHours += task.time
    }

    return totalHours
}

// Day

export function getDay(user, day, week, year) {
    for (var selectedDay of user.days) {
        if (selectedDay.week == week && selectedDay.day == day && selectedDay.currentYear == year) {
            return selectedDay
        }
    }
}