// =====================================================================
// SplitSelector.js — lets each user pick which split + day they're
// "doing" today, purely as a label (does NOT add/edit/delete any
// exercises). Each user's choice is independent once set, but when
// User A picks first, User B's still-empty selection defaults to the
// same pick until User B explicitly changes it themselves.
// =====================================================================

function SplitSelector({ userKey, otherUserKey, dateKey, splits, currentSplitId, currentSplitDayId, otherSplitId, otherSplitDayId }) {
    const [showPicker, setShowPicker] = React.useState(false);

    // If this user hasn't picked anything yet but the other user has,
    // show the other user's pick as the inherited default (display only —
    // nothing is written to Firebase until this user actually opens the
    // picker and confirms a choice, so it never silently overwrites).
    const effectiveSplitId = currentSplitId || otherSplitId || null;
    const effectiveDayId = currentSplitId ? currentSplitDayId : otherSplitDayId;
    const isInherited = !currentSplitId && !!otherSplitId;

    const split = effectiveSplitId ? splits[effectiveSplitId] : null;
    const day = split ? (split.days || []).find(d => d.id === effectiveDayId) : null;

    function selectSplitDay(splitId, dayId) {
        saveDaySplit(dateKey, userKey, splitId, dayId);
        setShowPicker(false);
    }

    function clearSelection() {
        saveDaySplit(dateKey, userKey, null, null);
        setShowPicker(false);
    }

    return (
        <div className="bg-surface border border-border rounded-xl px-3 py-2.5">
            <button onClick={() => setShowPicker(true)} className="w-full flex items-center justify-between text-left">
                <div className="min-w-0">
                    <div className="text-[10px] text-text-secondary uppercase tracking-wide flex items-center gap-1">
                        <i className="ph ph-stack"></i> Today's split
                        {isInherited && <span className="text-accent-purple">(from other user)</span>}
                    </div>
                    {split ? (
                        <div className="text-sm font-medium truncate">
                            {split.name}{day ? ` — ${day.focus || day.label}` : ""}
                        </div>
                    ) : (
                        <div className="text-sm text-text-secondary">No split selected</div>
                    )}
                </div>
                <i className="ph ph-caret-right text-text-secondary shrink-0 ml-2"></i>
            </button>

            {showPicker && (
                <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" onClick={() => setShowPicker(false)}>
                    <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[75vh] overflow-y-auto p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-lg">Pick today's split</h3>
                        {Object.values(splits || {}).map(s => (
                            <div key={s.id} className="flex flex-col gap-1.5">
                                <div className="text-xs font-semibold text-text-secondary">{s.name}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(s.days || []).map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => selectSplitDay(s.id, d.id)}
                                            className={`text-xs px-2.5 py-1.5 rounded-full border ${effectiveSplitId === s.id && effectiveDayId === d.id ? "bg-primary text-bg border-primary" : "border-border text-text-secondary"}`}
                                        >
                                            {d.emoji} {d.rest ? "Rest" : d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {split && (
                            <button onClick={clearSelection} className="text-xs text-secondary mt-1">Clear selection</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
