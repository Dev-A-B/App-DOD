// =====================================================================
// ExerciseCard.js — one exercise within a day's workout. Shows the
// type-aware set list, live PR/history-max/last-session info pulled
// from Firebase, and controls to add/remove sets or delete the exercise.
// =====================================================================

function ExerciseCard({ exercise, exId, dateKey, userKey, onUpdate, onDelete, profile, allHistory, partnerExerciseName }) {
    const [expanded, setExpanded] = React.useState(true);
    const setType = exercise.setType || "standard";
    const meta = SET_TYPE_META[setType];

    const sets = Object.entries(exercise.sets || {});

    const prRecord = profile?.prs?.[exercise.name];

    const lastSession = React.useMemo(() => {
        if (!allHistory) return null;
        const dates = Object.keys(allHistory).filter(d => d < dateKey).sort().reverse();
        for (const d of dates) {
            const userDay = allHistory[d]?.[userKey];
            if (!userDay) continue;
            const match = Object.values(userDay.exercises || {}).find(e => e.name === exercise.name);
            if (match) return { date: d, exercise: match };
        }
        return null;
    }, [allHistory, dateKey, userKey, exercise.name]);

    function addSet() {
        const newSets = { ...exercise.sets };
        const nextIdx = sets.length;
        newSets[`s${nextIdx}_${Date.now().toString(36)}`] = makeEmptySet(setType);
        onUpdate({ ...exercise, sets: newSets });
    }

    function updateSet(setId, newVal) {
        onUpdate({ ...exercise, sets: { ...exercise.sets, [setId]: newVal } });
    }

    function removeSet(setId) {
        const newSets = { ...exercise.sets };
        delete newSets[setId];
        onUpdate({ ...exercise, sets: newSets });
    }

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-2 min-w-0">
                    <i className={`ph ${meta.icon} text-primary text-base shrink-0`}></i>
                    <span className="font-medium text-sm truncate">{exercise.exerciseDisplayName || exercise.name}</span>
                    {setType === "superset" && partnerExerciseName && (
                        <span className="text-[10px] text-accent-purple bg-accent-purple/10 rounded px-1.5 py-0.5 shrink-0">+ {partnerExerciseName}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-wide text-text-secondary">{meta.label}</span>
                    <i className={`ph ph-caret-${expanded ? "up" : "down"} text-text-secondary`}></i>
                </div>
            </div>

            {expanded && (
                <div className="px-3 pb-3 flex flex-col gap-3">
                    {(prRecord || lastSession) && (
                        <div className="flex gap-3 text-[11px] text-text-secondary border-t border-border pt-2 flex-wrap">
                            {prRecord && prRecord.bilateral > 0 && (
                                <span className="flex items-center gap-1"><i className="ph ph-trophy text-secondary"></i>PR: {prRecord.bilateral}kg</span>
                            )}
                            {prRecord && prRecord.unilateral > 0 && (
                                <span className="flex items-center gap-1"><i className="ph ph-trophy text-accent-purple"></i>Uni PR: {prRecord.unilateral}kg</span>
                            )}
                            {lastSession && (
                                <span className="flex items-center gap-1">
                                    <i className="ph ph-history"></i>
                                    Last ({lastSession.date.slice(5)}): {Object.values(lastSession.exercise.sets || {}).map(s => summarizeSet(s, lastSession.exercise.setType)).join(", ")}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {sets.map(([setId, setVal], i) => (
                            <div key={setId} className="flex items-center gap-2">
                                <span className="text-[10px] text-text-secondary w-4">{i + 1}</span>
                                <div className="flex-1">
                                    <SetEditorForType setType={setType} value={setVal} onChange={(v) => updateSet(setId, v)} />
                                </div>
                                <button onClick={() => removeSet(setId)} className="text-text-secondary hover:text-secondary">
                                    <i className="ph ph-trash text-sm"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {exercise.remark && (
                        <div className="text-[11px] italic text-text-secondary bg-bg rounded-md px-2 py-1.5">
                            <i className="ph ph-note-pencil mr-1"></i>{exercise.remark}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <button onClick={addSet} className="text-xs text-primary flex items-center gap-1">
                            <i className="ph ph-plus"></i> Add set
                        </button>
                        <button onClick={onDelete} className="text-xs text-text-secondary flex items-center gap-1">
                            <i className="ph ph-trash"></i> Remove exercise
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
