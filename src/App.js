// =====================================================================
// App.js — top-level shell. Holds view-routing state (now backed by the
// browser History API so the phone/back gesture navigates inside the
// app instead of closing it), subscribes to profiles/splits, keeps the
// screen awake while open, and renders a persistent floating Clock that
// sizes itself by scroll position independently of which screen is active.
// =====================================================================

function viewToHash(view) {
    const parts = [view.screen];
    if (view.tab) parts.push(view.tab);
    return "#" + parts.join("/");
}

function hashToView(hash, fallbackTab) {
    const clean = (hash || "").replace(/^#/, "");
    const [screen, tab] = clean.split("/");
    if (!screen) return { screen: "dashboard", tab: fallbackTab || "raghendh" };
    return { screen, tab: tab || fallbackTab || "raghendh" };
}

function App() {
    const initialView = hashToView(window.location.hash, "raghendh");
    const [view, setViewState] = React.useState(initialView);
    const [dateKey, setDateKey] = React.useState(todayStr());
    const [profiles, setProfiles] = React.useState({ raghendh: {}, devanandh: {} });
    const [splits, setSplits] = React.useState({});
    const [scrollY, setScrollY] = React.useState(0);
    const scrollRef = React.useRef(null);
    const wakeLockRef = React.useRef(null);

    // ---- Navigation backed by History API so phone back button works ----
    // Every screen change pushes a new history entry. Pressing back fires
    // 'popstate', which we use to move the in-app view backward instead of
    // letting the browser/PWA close or exit.
    function navigateTo(nextView) {
        setViewState(nextView);
        window.history.pushState(nextView, "", viewToHash(nextView));
    }

    React.useEffect(() => {
        // Seed an initial history entry so the very first back-press has
        // something of ours to land on rather than leaving the app.
        window.history.replaceState(initialView, "", viewToHash(initialView));

        function handlePopState(e) {
            const next = e.state || hashToView(window.location.hash, view.tab);
            setViewState(next);
        }
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // ---- Keep screen awake while the app is open ----
    React.useEffect(() => {
        async function requestWakeLock() {
            try {
                if ("wakeLock" in navigator) {
                    wakeLockRef.current = await navigator.wakeLock.request("screen");
                }
            } catch (err) {
                // Wake Lock can fail (e.g. low battery mode, unsupported browser) —
                // app should still work fine without it, just without this perk.
                console.warn("Wake Lock not available:", err.message);
            }
        }
        requestWakeLock();

        function handleVisibilityChange() {
            if (document.visibilityState === "visible") requestWakeLock();
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
        };
    }, []);

    React.useEffect(() => {
        const unsubs = USER_KEYS.map(uk => subscribeProfile(uk, (data) => {
            setProfiles(prev => ({ ...prev, [uk]: data }));
        }));
        const unsubSplits = subscribeSplits(setSplits);
        return () => { unsubs.forEach(u => u()); unsubSplits(); };
    }, []);

    function handleScroll(e) {
        setScrollY(e.target.scrollTop);
    }

    async function handleAddDayToToday(userKey, split, day) {
        const today = todayStr();
        let order = 0;
        const existing = await get(dayUserRef(today, userKey)).then(s => s.val());
        order = Object.keys(existing?.exercises || {}).length;
        for (const ex of (day.exercises || [])) {
            const setCount = parseInt(ex.sets) || 1;
            const setsObj = {};
            for (let i = 0; i < setCount; i++) setsObj[`s${i}`] = makeEmptySet(ex.setType || "standard");
            const exId = makeExerciseId(ex.name, order);
            await saveExercise(today, userKey, exId, {
                order, name: normalizeExerciseName(ex.name), exerciseDisplayName: ex.name,
                setType: ex.setType || "standard", sets: setsObj
            });
            order++;
        }
        await saveDaySplit(today, userKey, split.id, day.id);
    }

    async function handleAddExerciseToToday(userKey, ex) {
        const today = todayStr();
        const existing = await get(dayUserRef(today, userKey)).then(s => s.val());
        const order = Object.keys(existing?.exercises || {}).length;
        const setCount = parseInt(ex.sets) || 1;
        const setsObj = {};
        for (let i = 0; i < setCount; i++) setsObj[`s${i}`] = makeEmptySet(ex.setType || "standard");
        const exId = makeExerciseId(ex.name, order);
        await saveExercise(today, userKey, exId, {
            order, name: normalizeExerciseName(ex.name), exerciseDisplayName: ex.name,
            setType: ex.setType || "standard", sets: setsObj
        });
    }

    function goBackToDashboard() {
        navigateTo({ screen: "dashboard", tab: view.tab });
    }

    function renderScreen() {
        if (view.screen === "history") {
            return (
                <HistoryView
                    splits={splits}
                    onBack={goBackToDashboard}
                    onJumpToDate={(d, uk) => { setDateKey(d); navigateTo({ screen: "dashboard", tab: uk }); }}
                />
            );
        }
        if (view.screen === "profile") {
            return <ProfileView profiles={profiles} onBack={goBackToDashboard} />;
        }
        if (view.screen === "pr") {
            return <PRView profiles={profiles} onBack={goBackToDashboard} />;
        }
        // dashboard
        if (view.tab === "splits") {
            return (
                <SplitsView
                    splits={splits}
                    profiles={profiles}
                    onAddDayToToday={handleAddDayToToday}
                    onAddExerciseToToday={handleAddExerciseToToday}
                />
            );
        }
        return <UserDashboard userKey={view.tab} dateKey={dateKey} profiles={profiles} splits={splits} />;
    }

    const showHeader = view.screen === "dashboard";
    // The clock is now a persistent floating element shown on every screen
    // (per spec), sized purely by scroll position rather than tied to the
    // header's visibility — it no longer disappears when Header is hidden.

    return (
        <div className="flex flex-col h-screen bg-bg text-text-primary relative">
            {showHeader && (
                <Header
                    dateKey={dateKey}
                    onDateChange={setDateKey}
                    onOpenHistory={() => navigateTo({ screen: "history", tab: view.tab })}
                    onOpenProfile={() => navigateTo({ screen: "profile", tab: view.tab })}
                    onOpenPR={() => navigateTo({ screen: "pr", tab: view.tab })}
                />
            )}

            <FloatingClockBar scrollY={scrollY} />

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
            >
                {renderScreen()}
            </div>

            <FooterTabs
                activeTab={view.tab === "splits" ? "splits" : view.tab}
                onChangeTab={(tab) => navigateTo({ screen: "dashboard", tab })}
                profiles={profiles}
            />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
