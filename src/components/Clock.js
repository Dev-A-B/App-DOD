// =====================================================================
// Clock.js — per-user stopwatch. Functionality preserved from the
// original: click to start, click again to stop+reset. Same visual
// size whether the header is expanded or compressed (scroll-driven
// compression), per user's explicit request.
// =====================================================================

function StopwatchWidget({ userKey, label }) {
    const style = USER_STYLE[userKey];
    const [running, setRunning] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const startRef = React.useRef(null);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    function handleClick() {
        if (!running) {
            startRef.current = Date.now();
            intervalRef.current = setInterval(() => {
                setElapsed(Date.now() - startRef.current);
            }, 50);
            setRunning(true);
        } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            setElapsed(0);
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 w-full bg-surface border ${style.border} ${running ? style.shadow : ""} transition-shadow duration-300 active:scale-95`}
        >
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${style.color} opacity-80`}>{label}</span>
            <span className={`font-mono text-lg leading-tight ${running ? style.color : "text-text-secondary"} tabular-nums`}>
                {formatDuration(elapsed)}
            </span>
        </button>
    );
}

function DualClockBar() {
    return (
        <div className="grid grid-cols-2 gap-2 px-3 py-2">
            {USER_KEYS.map(uk => (
                <StopwatchWidget key={uk} userKey={uk} label={uk === "raghendh" ? "Ragh" : "Dev"} />
            ))}
        </div>
    );
}
