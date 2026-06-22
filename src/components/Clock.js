// =====================================================================
// Clock.js — per-user stopwatch. Click to start, click again to
// stop+reset (unchanged behavior from the original app). Now rendered
// as a persistent floating bar pinned near the top of the screen on
// every page, NOT tied to the Header. Size interpolates smoothly from
// large (at scroll top) to small (scrolled down) based on scrollY.
// When running, the entire block fills with the user's color rather
// than just the text, per explicit request.
// =====================================================================

function StopwatchWidget({ userKey, label, sizeT }) {
    // sizeT: 0 = fully expanded (top of scroll), 1 = fully compressed
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

    // Interpolated sizing: big block at top, small pill once scrolled.
    const paddingY = 18 - 12 * sizeT; // 18px -> 6px
    const fontSizePx = 34 - 18 * sizeT; // 34px -> 16px
    const labelOpacity = 1 - sizeT * 0.3;

    const filledBg = running ? style.bg : "bg-surface";
    const textColor = running ? "text-bg" : style.color;
    const labelColor = running ? "text-bg/70" : `${style.color} opacity-80`;

    return (
        <button
            onClick={handleClick}
            className={`flex flex-col items-center justify-center rounded-2xl w-full border ${style.border} ${filledBg} ${running ? style.shadow : ""} transition-[background-color,box-shadow] duration-300 active:scale-95 overflow-hidden`}
            style={{ paddingTop: paddingY, paddingBottom: paddingY }}
        >
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${labelColor} transition-opacity duration-300`} style={{ opacity: labelOpacity }}>
                {label}
            </span>
            <span
                className={`font-mono leading-tight ${textColor} tabular-nums transition-[font-size] duration-300`}
                style={{ fontSize: fontSizePx }}
            >
                {formatDuration(elapsed)}
            </span>
        </button>
    );
}

function FloatingClockBar({ scrollY }) {
    // Fully expanded for the first 0px of scroll, fully compressed by 140px.
    const maxScroll = 140;
    const sizeT = Math.max(0, Math.min(1, scrollY / maxScroll));
    const gap = 8 - 4 * sizeT;
    const marginY = 10 - 6 * sizeT;

    return (
        <div
            className="px-3 bg-bg/95 backdrop-blur transition-[padding] duration-300 relative z-30"
            style={{ paddingTop: marginY, paddingBottom: marginY }}
        >
            <div className="grid grid-cols-2 transition-[gap] duration-300" style={{ gap }}>
                {USER_KEYS.map(uk => (
                    <StopwatchWidget key={uk} userKey={uk} label={uk === "raghendh" ? "Ragh" : "Dev"} sizeT={sizeT} />
                ))}
            </div>
        </div>
    );
}
