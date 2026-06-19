// =====================================================================
// UserDashboard.js — the main screen for a selected user on a selected
// date: body weight, copy-from-other-user banner, exercise cards,
// add-exercise button.
// =====================================================================

function UserDashboard({ userKey, dateKey, profiles, splits }) {
    const otherUserKey = USER_KEYS.find(k => k !== userKey);
    const [dayData, setDayData] = React.useState({ exercises: {} });
    const [otherDayData, setOtherDayData] = React.useState({ exercises: {} });
    const [allHistory, setAllHistory] = React.useState(null);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [bwInput, setBwInput] = React.useState("");

    React.useEffect(() => {
        const unsub1 = subscribeDayUser(dateKey, userKey, (data) => {
            setDayData(data);
            setBwInput(data.bodyWeight || "");
        });
        const unsub2 = subscribeDayUser(dateKey, otherUserKey, setOtherDayData);
        return () => { unsub1(); unsub2(); };
    }, [dateKey, userKey, otherUserKey]);

    React.useEffect(() => {
        fetchAllDays().then(setAllHistory);
    }, [dateKey]);

    const exercisesArr = Object.entries(dayData.exercises || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

    function handleUpdateExercise(exId, newExData) {
        saveExercise(dateKey, userKey, exId, newExData);
        maybeUpdatePR(newExData);
    }

    function maybeUpdatePR(exData) {
        const profile = profiles[userKey];
        if (!profile) return;
        const prMap = { ...(profile.prs || {}) };
        const fakeExercises = { tmp: exData };
        const changed = updatePRsFromExercises(prMap, fakeExercises, dateKey);
        if (changed) {
            applyPRUpdates(userKey, { [exData.name]: prMap[exData.name] });
        }
    }

    function handleDeleteExercise(exId) {
        deleteExercise(dateKey, userKey, exId);
    }

    function handleAddExercise(exId, newEx, partnerEx) {
        if (partnerEx) {
            const partnerId = makeExerciseId(partnerEx.name, partnerEx.order);
            saveExercise(dateKey, userKey, exId, { ...newEx, supersetWith: partnerId });
            saveExercise(dateKey, userKey, partnerId, { ...partnerEx, supersetWith: exId });
        } else {
            saveExercise(dateKey, userKey, exId, newEx);
        }
    }

    function handleCopyFromOther(sourceEx) {
        const newOrder = exercisesArr.length;
        const copied = buildCopiedExercise(sourceEx, newOrder);
        const exId = makeExerciseId(copied.name, newOrder);
        saveExercise(dateKey, userKey, exId, copied);
    }

    function handleBwBlur() {
        if (bwInput !== dayData.bodyWeight) {
            saveBodyWeight(dateKey, userKey, bwInput);
        }
    }

    const exNameById = {};
    exercisesArr.forEach(([id, ex]) => { exNameById[id] = ex.exerciseDisplayName || ex.name; });

    return (
        <div className="flex flex-col gap-3 p-3 pb-24">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2">
                <i className="ph ph-scales text-primary"></i>
                <span className="text-xs text-text-secondary">Body weight</span>
                <input
                    type="number"
                    inputMode="decimal"
                    value={bwInput}
                    onChange={(e) => setBwInput(e.target.value)}
                    onBlur={handleBwBlur}
                    placeholder="kg"
                    className="flex-1 bg-transparent text-right text-sm outline-none"
                />
            </div>

            <CopyFromOtherUserBanner
                otherUserExercises={otherDayData.exercises}
                currentUserExercises={dayData.exercises}
                otherUserName={profiles[otherUserKey]?.name || "Other user"}
                onCopy={handleCopyFromOther}
            />

            <div className="flex flex-col gap-2.5">
                {exercisesArr.map(([exId, ex]) => (
                    <ExerciseCard
                        key={exId}
                        exercise={ex}
                        exId={exId}
                        dateKey={dateKey}
                        userKey={userKey}
                        profile={profiles[userKey]}
                        allHistory={allHistory}
                        partnerExerciseName={ex.supersetWith ? exNameById[ex.supersetWith] : null}
                        onUpdate={(newData) => handleUpdateExercise(exId, newData)}
                        onDelete={() => handleDeleteExercise(exId)}
                    />
                ))}
                {exercisesArr.length === 0 && (
                    <div className="text-center text-text-secondary text-sm py-8">No workouts added yet for this day.</div>
                )}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-bg shadow-neon-green flex items-center justify-center z-40"
            >
                <i className="ph ph-plus text-2xl"></i>
            </button>

            {showAddModal && (
                <AddExerciseModal
                    existingExercises={exercisesArr.map(([, e]) => e)}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddExercise}
                />
            )}
        </div>
    );
}
