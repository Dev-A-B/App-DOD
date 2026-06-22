// =====================================================================
// SplitsView.js — list of splits, then per-split detail with three
// tabs: Plan, Rules, Edit. "Add to today" actions for whole days and
// individual exercises. All split content comes from Firebase /splits.
// =====================================================================

function SplitsView({ splits, profiles, onAddDayToToday, onAddExerciseToToday }) {
    const [selectedSplitId, setSelectedSplitId] = React.useState(null);
    const [showNewSplitModal, setShowNewSplitModal] = React.useState(false);

    const splitList = Object.values(splits || {});

    if (selectedSplitId && splits[selectedSplitId]) {
        return (
            <SplitDetail
                split={splits[selectedSplitId]}
                onBack={() => setSelectedSplitId(null)}
                profiles={profiles}
                onAddDayToToday={onAddDayToToday}
                onAddExerciseToToday={onAddExerciseToToday}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-3 py-2.5 border-b border-border">
                <h2 className="font-display text-lg">Workout Splits</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                {splitList.map(split => (
                    <button
                        key={split.id}
                        onClick={() => setSelectedSplitId(split.id)}
                        className="bg-surface border border-border rounded-xl px-4 py-3.5 text-left"
                    >
                        <div className="font-display text-base">{split.name}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{split.subtitle}</div>
                        <div className="text-[10px] text-text-secondary mt-1.5">{(split.days || []).length} days</div>
                    </button>
                ))}
                <button
                    onClick={() => setShowNewSplitModal(true)}
                    className="border border-dashed border-border rounded-xl px-4 py-3.5 text-text-secondary flex items-center justify-center gap-2 text-sm"
                >
                    <i className="ph ph-plus"></i> New split
                </button>
            </div>
            {showNewSplitModal && (
                <NewSplitModal
                    onClose={() => setShowNewSplitModal(false)}
                    onCreate={(newSplit) => { saveSplit(newSplit.id, newSplit); setShowNewSplitModal(false); setSelectedSplitId(newSplit.id); }}
                />
            )}
        </div>
    );
}

function NewSplitModal({ onClose, onCreate }) {
    const [name, setName] = React.useState("");

    function handleCreate() {
        if (!name.trim()) return;
        const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") + "_" + Date.now().toString(36);
        onCreate({ id, name: name.trim(), subtitle: "", rules: [], days: [] });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surface rounded-2xl w-80 p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-display text-lg">New Split</h3>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Split name" className="bg-bg border border-border rounded-md px-3 py-2 text-sm" autoFocus />
                <button onClick={handleCreate} disabled={!name.trim()} className="bg-primary text-bg font-semibold rounded-lg py-2 disabled:opacity-40">Create</button>
            </div>
        </div>
    );
}

function SplitDetail({ split, onBack, profiles, onAddDayToToday, onAddExerciseToToday }) {
    const [tab, setTab] = React.useState("plan");

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <button onClick={onBack}><i className="ph ph-arrow-left text-xl"></i></button>
                <h2 className="font-display text-lg truncate">{split.name}</h2>
            </div>

            <div className="flex border-b border-border">
                {[["plan", "Plan"], ["rules", "Rules"], ["edit", "Edit"]].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex-1 py-2.5 text-sm font-medium ${tab === id ? "text-primary border-b-2 border-primary" : "text-text-secondary"}`}
                    >{label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {tab === "plan" && <SplitPlanTab split={split} onAddDayToToday={onAddDayToToday} onAddExerciseToToday={onAddExerciseToToday} profiles={profiles} />}
                {tab === "rules" && <SplitRulesTab split={split} />}
                {tab === "edit" && <SplitEditTab split={split} />}
            </div>
        </div>
    );
}

function SplitPlanTab({ split, onAddDayToToday, onAddExerciseToToday, profiles }) {
    const [pickingUserFor, setPickingUserFor] = React.useState(null); // {type: 'day'|'exercise', day, exercise}
    const days = split.days || [];
    const [activeDayIdx, setActiveDayIdx] = React.useState(0);
    const activeDay = days[activeDayIdx];

    function confirmAdd(userKey) {
        if (pickingUserFor.type === "day") {
            onAddDayToToday(userKey, split, pickingUserFor.day);
        } else {
            onAddExerciseToToday(userKey, pickingUserFor.exercise);
        }
        setPickingUserFor(null);
    }

    return (
        <div className="flex flex-col h-full">
            {/* Horizontal scrollable day-tab strip — drag/swipe to reveal more days,
                tap one to show only that day below. Does not wrap or grid; each
                pill keeps its natural width so dragging feels like the original. */}
            <div className="flex gap-2 px-3 py-2.5 overflow-x-auto border-b border-border" style={{ WebkitOverflowScrolling: "touch" }}>
                {days.map((day, idx) => {
                    const isActive = idx === activeDayIdx;
                    return (
                        <button
                            key={day.id}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${isActive ? "bg-primary text-bg border-primary" : "border-border text-text-secondary"}`}
                        >
                            <span>{day.emoji}</span>
                            <span>{day.rest ? "Rest" : day.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {activeDay && (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2.5" style={{ borderLeft: `4px solid ${activeDay.color || "#555"}` }}>
                            <div>
                                <div className="font-display text-base">{activeDay.label} {activeDay.emoji}</div>
                                <div className="text-xs text-text-secondary">{activeDay.focus}</div>
                            </div>
                        </div>
                        {!activeDay.rest && (activeDay.exercises || []).length > 0 && (
                            <div className="flex flex-col">
                                {activeDay.exercises.map((ex, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 border-t border-border/60">
                                        <div className="min-w-0">
                                            <div className="text-sm flex items-center gap-1.5">
                                                <i className={`ph ${SET_TYPE_META[ex.setType || "standard"].icon} text-primary text-xs`}></i>
                                                {ex.name}
                                            </div>
                                            <div className="text-[11px] text-text-secondary">{ex.sets} sets x {ex.reps} {ex.notes ? `— ${ex.notes}` : ""}</div>
                                        </div>
                                        <button onClick={() => setPickingUserFor({ type: "exercise", exercise: ex })} className="text-[11px] text-primary font-semibold shrink-0 ml-2">+ Today</button>
                                    </div>
                                ))}
                                <div className="px-3 py-2 border-t border-border/60">
                                    <button onClick={() => setPickingUserFor({ type: "day", day: activeDay })} className="w-full text-xs bg-primary/10 text-primary rounded-lg py-2 font-semibold">
                                        Add this full day to today
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeDay.rest && (
                            <div className="px-3 py-6 text-center text-text-secondary text-sm">Rest day — nothing to add.</div>
                        )}
                    </div>
                )}
            </div>

            {pickingUserFor && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPickingUserFor(null)}>
                    <div className="bg-surface rounded-2xl w-72 p-4 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-base mb-1">Add for which user?</h3>
                        {USER_KEYS.map(uk => (
                            <button key={uk} onClick={() => confirmAdd(uk)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border ${USER_STYLE[uk].border}`}>
                                <i className={`ph ph-user-circle ${USER_STYLE[uk].color}`}></i>
                                {profiles[uk]?.name || uk}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SplitRulesTab({ split }) {
    return (
        <div className="p-3 flex flex-col gap-2.5">
            {(split.rules || []).length === 0 && <div className="text-center text-text-secondary text-sm py-8">No rules added yet.</div>}
            {(split.rules || []).map((r, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl px-3 py-2.5">
                    <div className="text-sm font-medium text-primary">{r.rule}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{r.method}</div>
                </div>
            ))}
        </div>
    );
}
