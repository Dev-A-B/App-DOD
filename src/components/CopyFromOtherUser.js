// =====================================================================
// CopyFromOtherUser.js — when the other user already added exercises
// today, show a one-click "copy" option that brings over exercise name,
// setType, and number of sets only (NOT weights/reps — those are
// per-user). Per spec: copies become fully independent afterward.
// =====================================================================

function CopyFromOtherUserBanner({ otherUserExercises, currentUserExercises, otherUserName, onCopy }) {
    const currentNames = new Set(Object.values(currentUserExercises || {}).map(e => e.name));
    const copyable = Object.values(otherUserExercises || {}).filter(e => !currentNames.has(e.name));

    if (copyable.length === 0) return null;

    return (
        <div className="bg-accent-purple/10 border border-accent-purple/40 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-accent-purple font-medium">
                <i className="ph ph-copy"></i>
                {otherUserName} already added {copyable.length} workout{copyable.length > 1 ? "s" : ""} today
            </div>
            <div className="flex flex-col gap-1.5">
                {copyable.map(ex => (
                    <div key={ex.name} className="flex items-center justify-between bg-surface rounded-lg px-2.5 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <i className={`ph ${SET_TYPE_META[ex.setType || "standard"].icon} text-primary text-sm shrink-0`}></i>
                            <span className="text-sm truncate">{ex.exerciseDisplayName || ex.name}</span>
                            <span className="text-[10px] text-text-secondary shrink-0">{Object.keys(ex.sets || {}).length} sets</span>
                        </div>
                        <button onClick={() => onCopy(ex)} className="text-[11px] font-semibold text-primary shrink-0 ml-2">
                            + Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Builds a fresh, independent exercise object (blank weights/reps) from
// another user's exercise — name/setType/set-count only, per spec.
function buildCopiedExercise(sourceEx, newOrder) {
    const setType = sourceEx.setType || "standard";
    const setCount = Object.keys(sourceEx.sets || {}).length || 1;
    const setsObj = {};
    for (let i = 0; i < setCount; i++) {
        setsObj[`s${i}`] = makeEmptySet(setType);
    }
    return {
        order: newOrder,
        name: sourceEx.name,
        exerciseDisplayName: sourceEx.exerciseDisplayName,
        setType,
        sets: setsObj
    };
}
