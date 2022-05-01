import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'
import { useState, useEffect } from 'react'

import styles from '../../styles/timer.module.scss'

function Page() {
    useUser({ redirectTo: '/api/login' })

    return (
        <div className={styles.container}>
            <Stopwatch />

            <Timer />
        </div>
    )


}

function Stopwatch() {
    const user = useUser({ redirectTo: '/api/login' })
    const [context, setContext] = useAppContext()
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        drawRadius("stopwatchCanvas", 250, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
    })

    useEffect(() => {
        const id = setInterval(() => {
            if (running) {
                setTime(time + 1)
            }
        }, 1)
        return () => clearInterval(id)
    })

    function drawRadius(canvasId, radius, percent) {
        var canvas = document.getElementById(canvasId)
        var ctx = canvas.getContext("2d")

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        function drawWedge(ctx, x, y, radius, percent, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 50;

            ctx.translate(x, y);        // translate to rotating pivot
            ctx.rotate(Math.PI * 0.5);  // rotate, here 90° deg
            ctx.translate(-x, -y);      // translate back

            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.arc(x, y, radius, Math.PI / 2, Math.PI * (0.5 + (percent / 100 * 2)));
            ctx.stroke();

            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        }

        drawWedge(ctx, canvas.width / 2, canvas.height / 2, radius, 100, "#C4C4C4")
        drawWedge(ctx, canvas.width / 2, canvas.height / 2, radius, percent, "#008bff")
    }

    function formatTime(seconds) {
        const zeroPad = (num, places) => String(num).padStart(places, '0')

        var hours = Math.floor(seconds / 3600);
        seconds = seconds - hours * 3600;

        var minutes = Math.floor(seconds / 60);
        var seconds = seconds - minutes * 60;

        return hours > 0 ? zeroPad(hours, 2) + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2) : zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2)
    }

    function roundToQuarter(seconds) {
        var minutes = Math.floor(seconds / 60)

        return Math.round((minutes / 60) * 4) / 4 * 60
    }

    function getWeekDay(date) {
        var dayNumber = date.getDay() - 1
        return dayNumber < 0 ? 6 : dayNumber
    }

    function saveActivity(e) {
        if (e.target.value != "") {
            setTime(0);
            setInitial(true)

            var dayIndex
            for (var i in user.days) {
                if (user.days[i].week == context.week && user.days[i].currentYear == context.year && getWeekDay(new Date()) == user.days[i].day) {
                    dayIndex = i
                }
            }

            var taskIndex
            for (var i in user.days[dayIndex].tasks) {
                if (user.days[dayIndex].tasks[i].taskId == e.target.value) {
                    taskIndex = i
                }
            }

            var newDays = [...user.days]
            if (taskIndex) {
                newDays[dayIndex].tasks[taskIndex].time += roundToQuarter(time) / 60
            } else {
                newDays[dayIndex].tasks.push({ taskId: e.target.value, time: roundToQuarter(time) / 60 })
            }

            console.log(newDays[dayIndex].tasks)

            fetch(window.origin + "/api/days", {
                method: "POST",
                body: JSON.stringify({
                    days: newDays
                })
            })
        }
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas height="600" width="600" className={styles.canvas} id="stopwatchCanvas"></canvas>
            <div className={styles.innerContainer}>
                <div className={styles.formattedTime + " " + (running ? styles.green : styles.red)}>{formatTime(time)}</div>
                {running ? (
                    <div className={styles.control}>
                        <div className={styles.pauseButton} onClick={e => { setRunning(false), setInitial(false) }}>Pause</div>
                    </div>
                ) : (
                    <div className={styles.control}>
                        <div className={styles.resumeButton} onClick={e => setRunning(true)}>{initial ? "Start" : "Resume"}</div>
                        {!initial ? (<div className={styles.resetButton} onSelect={e => { }}>Reset</div>) : <div />}
                        {!initial ? (
                            <select className={styles.saveButton} onClick={saveActivity}>
                                <option value="">Save Activity ({roundToQuarter(time)}m)</option>
                                {user.tasks.map(task =>
                                    <option value={task.id}>{task.name}</option>
                                )}
                            </select>
                        ) : <div />}
                    </div>
                )}
            </div>
        </div >
    )
}

function Timer() {
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const [initial, setInitial] = useState(true)

    useEffect(() => {
        drawRadius("timerCanvas", 250, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
    })

    useEffect(() => {
        const id = setInterval(() => {
            if (running) {
                setTime(time + 1)
            }
        }, 1)
        return () => clearInterval(id)
    })

    function drawRadius(canvasId, radius, percent) {
        var canvas = document.getElementById(canvasId)
        var ctx = canvas.getContext("2d")

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        function drawWedge(ctx, x, y, radius, percent, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 50;

            ctx.translate(x, y);        // translate to rotating pivot
            ctx.rotate(Math.PI * 0.5);  // rotate, here 90° deg
            ctx.translate(-x, -y);      // translate back

            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.arc(x, y, radius, Math.PI / 2, Math.PI * (0.5 + (percent / 100 * 2)));
            ctx.stroke();

            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        }

        drawWedge(ctx, canvas.width / 2, canvas.height / 2, radius, 100, "#C4C4C4")
        drawWedge(ctx, canvas.width / 2, canvas.height / 2, radius, percent, "#008bff")
    }

    function formatTime(seconds) {
        const zeroPad = (num, places) => String(num).padStart(places, '0')

        var hours = Math.floor(seconds / 3600);
        seconds = seconds - hours * 3600;

        var minutes = Math.floor(seconds / 60);
        var seconds = seconds - minutes * 60;

        return hours > 0 ? zeroPad(hours, 2) + ":" + zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2) : zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2)
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas height="600" width="600" className={styles.canvas} id="timerCanvas"></canvas>
            <div className={styles.innerContainer}>
                <div className={styles.formattedTime + " " + (running ? styles.green : styles.red)}>{formatTime(time)}</div>
                {running ? (
                    <div className={styles.control}>

                        <div className={styles.pauseButton} onClick={e => { setRunning(false), setInitial(false) }}>Pause</div>
                    </div>
                ) : (
                    <div className={styles.control}>
                        <div className={styles.resumeButton} onClick={e => setRunning(true)}>{initial ? "Start" : "Resume"}</div>
                        {!initial ? (<div className={styles.resetButton} onClick={e => { setTime(0); setInitial(true) }}>Reset</div>) : <div />}
                    </div>
                )}
            </div>
        </div >
    )
}

export default Page