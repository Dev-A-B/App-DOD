// =====================================================================
// App.js — top-level shell. Holds view-routing state, subscribes to
// profiles/splits, renders Header+Clock+Footer around whichever screen
// is active. Per spec: Header/Clock hidden on History and Profile views.
// =====================================================================

function App() {
    const [view, setView] = React.useState({ screen: "dashboard", tab: "raghendh" }); // dashboard | history | profile | pr
    const [dateKey, setDateKey] = React.useState(todayStr());
    const [profiles, setProfiles] = React.useState({ raghendh: {}, devanandh: {} });
    const [splits, setSplits] = React.useState({});
    const [scrollY, setScrollY] = React.useState(0);
    const scrollRef = React.useRef(null);

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

    const compressed = scrollY > 60;
    const showHeaderAndClock = view.screen === "dashboard";

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

    function renderScreen() {
        if (view.screen === "history") {
            return (
                <HistoryView
                    splits={splits}
                    onBack={() => setView({ screen: "dashboard", tab: view.tab })}
                    onJumpToDate={(d, uk) => { setDateKey(d); setView({ screen: "dashboard", tab: uk }); }}
                />
            );
        }
        if (view.screen === "profile") {
            return <ProfileView profiles={profiles} onBack={() => setView({ screen: "dashboard", tab: view.tab })} />;
        }
        if (view.screen === "pr") {
            return <PRView profiles={profiles} onBack={() => setView({ screen: "dashboard", tab: view.tab })} />;
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

    return (
        <div className="flex flex-col h-screen bg-bg text-text-primary">
            {showHeaderAndClock && (
                <>
                    <Header
                        dateKey={dateKey}
                        onDateChange={setDateKey}
                        onOpenHistory={() => setView({ screen: "history", tab: view.tab })}
                        onOpenProfile={() => setView({ screen: "profile", tab: view.tab })}
                        onOpenPR={() => setView({ screen: "pr", tab: view.tab })}
                        compressed={compressed}
                    />
                    <div className={`transition-all duration-300 overflow-hidden ${compressed ? "max-h-0 opacity-0" : "max-h-24 opacity-100"}`}>
                        <DualClockBar />
                    </div>
                </>
            )}

            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
                {renderScreen()}
            </div>

            <FooterTabs
                activeTab={view.tab === "splits" ? "splits" : view.tab}
                onChangeTab={(tab) => setView({ screen: "dashboard", tab })}
                profiles={profiles}
            />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
