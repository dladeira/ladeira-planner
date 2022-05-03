import { useUser } from '../../lib/hooks'
import { useAppContext } from '../../lib/context'
import { useState, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'

import styles from '../../styles/timer.module.scss'

function Page() {
    const [user] = useUser({ userOnly: true })
    const [days, setDays] = useState()

    useEffect(() => {
        if (user) {
            setDays(user.days)
        }
    }, [user])

    return (days ? (
        <div className={styles.container}>
            <div className={styles.itemContainer}>
                <div className={styles.title}>Stopwatch</div>
                <Stopwatch days={days} setDays={setDays} />
            </div>

            <div className={styles.itemContainer}>
                <div className={styles.title}>Timer</div>
                <Timer days={days} setDays={setDays} />
            </div>
        </div>) : (<div />)
    )


}

function Stopwatch({ days, setDays }) {
    const [user] = useUser({ userOnly: true })
    const [context, setContext] = useAppContext()
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const [initial, setInitial] = useState(true)
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    useEffect(() => {
        if (isMobile) {
            drawRadius("stopwatchCanvas", 150, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
        } else {
            drawRadius("stopwatchCanvas", 250, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
        }
    })

    useEffect(() => {
        const id = setInterval(() => {
            if (running) {
                setTime(time + 1)
            }
        }, 1000)
        return () => clearInterval(id)
    })

    function drawRadius(canvasId, radius, percent) {
        var canvas = document.getElementById(canvasId)
        var ctx = canvas.getContext("2d")

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        function drawWedge(ctx, x, y, radius, percent, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = isMobile ? 30 : 50;

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
            if (roundToQuarter(time) / 60) {
                var dayIndex
                for (var i in days) {
                    if (days[i].week == context.week && days[i].currentYear == context.year && getWeekDay(new Date()) == days[i].day) {
                        dayIndex = i
                    }
                }

                var taskIndex
                for (var i in days[dayIndex].tasks) {
                    if (days[dayIndex].tasks[i].taskId == e.target.value) {
                        taskIndex = i
                    }
                }

                var newDays = [...days]
                if (taskIndex) {
                    newDays[dayIndex].tasks[taskIndex].time += roundToQuarter(time) / 60
                } else {
                    newDays[dayIndex].tasks.push({ taskId: e.target.value, time: roundToQuarter(time) / 60 })
                }

                fetch(window.origin + "/api/days", {
                    method: "POST",
                    body: JSON.stringify({
                        days: newDays
                    })
                })

                setDays([...newDays])
            }

            setTime(0);
            setInitial(true)

        }
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas height={isMobile ? 350 : 600} width={isMobile ? 350 : 600} className={styles.canvas} id="stopwatchCanvas"></canvas>
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
                        {!initial ? (
                            <select className={styles.saveButton} onClick={saveActivity}>
                                <option value="">Save Activity ({roundToQuarter(time)}m)</option>
                                {user.tasks.map(task =>
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                )}
                            </select>
                        ) : <div />}
                    </div>
                )}
            </div>
        </div >
    )
}

function Timer({ days, setDays }) {
    const [user] = useUser({ userOnly: true })
    const [context, setContext] = useAppContext()
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' })

    const [seconds, setSeconds] = useState(0)
    const [minutes, setMinutes] = useState(30)
    const [hours, setHours] = useState(1)
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const [initial, setInitial] = useState(true)
    const [finished, setFinished] = useState(false)
    const [startTime, setStartTime] = useState(0)

    useEffect(() => {
        if (isMobile) {
            drawRadius("timerCanvas", 150, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
        } else {
            drawRadius("timerCanvas", 250, (time / 60 / 60 - Math.floor(time / 60 / 60)) * 100)
        }
    })

    useEffect(() => {
        const id = setInterval(() => {
            if (running) {
                setTime(time - 1)

                if (time <= 0 && !finished) {
                    setFinished(true)
                    resetTimer()
                }
            }
        }, 1000)
        return () => clearInterval(id)
    })

    function drawRadius(canvasId, radius, percent) {
        var canvas = document.getElementById(canvasId)
        var ctx = canvas.getContext("2d")

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        function drawWedge(ctx, x, y, radius, percent, color) {
            ctx.strokeStyle = color;
            ctx.lineWidth = isMobile ? 30 : 50;

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

    function setValue(value, index) {
        switch (index) {
            case 0:
                if (!isNaN(value) && value.length <= 2) setHours(value)
                break;
            case 1:
                if (!isNaN(value) && value.length <= 2) setMinutes(value)
                break;
            case 2:
                if (!isNaN(value) && value.length <= 2) setSeconds(value)
                break;
        }
    }

    function startTimer() {
        var calcHours = hours <= 0 ? 0 : parseInt(hours) * 3600
        var calcMinutes = minutes <= 0 ? 0 : parseInt(minutes) * 60
        var calcSeconds = seconds <= 0 ? 0 : parseInt(seconds)

        setTime(calcHours + calcMinutes + calcSeconds)
        setStartTime(calcHours + calcMinutes + calcSeconds)
        setRunning(true)
        setInitial(false)
        setFinished(false)
    }

    function resetTimer() {
        setTime(0)
        setSeconds(0)
        setMinutes(30)
        setHours(1)
        setRunning(false)
        setInitial(true)
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
            if (roundToQuarter(startTime) / 60) {
                var dayIndex
                for (var i in days) {
                    if (days[i].week == context.week && days[i].currentYear == context.year && getWeekDay(new Date()) == days[i].day) {
                        dayIndex = i
                    }
                }

                var taskIndex
                for (var i in days[dayIndex].tasks) {
                    if (days[dayIndex].tasks[i].taskId == e.target.value) {
                        taskIndex = i
                    }
                }

                var newDays = [...days]
                if (taskIndex) {
                    newDays[dayIndex].tasks[taskIndex].time += roundToQuarter(startTime) / 60
                } else {
                    newDays[dayIndex].tasks.push({ taskId: e.target.value, time: roundToQuarter(startTime) / 60 })
                }

                fetch(window.origin + "/api/days", {
                    method: "POST",
                    body: JSON.stringify({
                        days: newDays
                    })
                })

                setDays([...newDays])
            }

            setTime(0);
            setInitial(true)
            setFinished(false)
        }
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas height={isMobile ? 350 : 600} width={isMobile ? 350 : 600} className={styles.canvas} id="timerCanvas"></canvas>
            <div className={styles.innerContainer}>
                {initial ? (
                    <div className={styles.inputContainer}>
                        <input className={styles.input} type="text" value={hours} onChange={e => setValue(e.target.value, 0)} />:
                        <input className={styles.input} type="text" value={minutes} onChange={e => setValue(e.target.value, 1)} />:
                        <input className={styles.input} type="text" value={seconds} onChange={e => setValue(e.target.value, 2)} />
                    </div>
                ) : (
                    <div className={styles.formattedTime + " " + (running ? styles.green : styles.red)}>{formatTime(time)}</div>
                )}

                {running ? (
                    <div className={styles.control}>

                        <div className={styles.pauseButton} onClick={e => { setRunning(false), setInitial(false) }}>Pause</div>
                    </div>
                ) : (
                    <div className={styles.control}>
                        <div className={styles.resumeButton} onClick={initial ? startTimer : e => setRunning(true)}>{initial ? finished ? "Restart" : "Start" : "Resume"}</div>
                        {!initial ? (<div className={styles.resetButton} onClick={e => { setTime(0); setInitial(true) }}>Reset</div>) : <div />}
                        {finished ? (
                            <select className={styles.saveButton} onClick={saveActivity}>
                                <option value="">Record Activity ({roundToQuarter(startTime)}m)</option>
                                {user.tasks.map(task =>
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                )}
                            </select>
                        ) : <div />}
                    </div>
                )}
            </div>
        </div >
    )
}

export default Page