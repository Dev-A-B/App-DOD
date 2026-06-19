// =====================================================================
// AddExerciseModal.js — add a new exercise to the current day, picking
// its set type. For supersets, asks for the partner exercise name too.
// =====================================================================

function AddExerciseModal({ onClose, onAdd, existingExercises }) {
    const [name, setName] = React.useState("");
    const [setType, setSetType] = React.useState("standard");
    const [partnerName, setPartnerName] = React.useState("");
    const [numSets, setNumSets] = React.useState(3);

    function handleAdd() {
        if (!name.trim()) return;
        const order = existingExercises.length;
        const exId = makeExerciseId(name, order);
        const setsObj = {};
        for (let i = 0; i < numSets; i++) {
            setsObj[`s${i}`] = makeEmptySet(setType);
        }
        const newEx = {
            order,
            name: normalizeExerciseName(name),
            exerciseDisplayName: name.trim(),
            setType,
            sets: setsObj
        };
        let partnerEx = null;
        if (setType === "superset" && partnerName.trim()) {
            const partnerId = makeExerciseId(partnerName, order + 1);
            const partnerSets = {};
            for (let i = 0; i < numSets; i++) partnerSets[`s${i}`] = makeEmptySet("superset");
            partnerEx = {
                order: order + 1,
                name: normalizeExerciseName(partnerName),
                exerciseDisplayName: partnerName.trim(),
                setType: "superset",
                supersetWith: exId,
                sets: partnerSets
            };
            newEx.supersetWith = "PENDING"; // resolved by caller once partner id is known
        }
        onAdd(exId, newEx, partnerEx);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[85vh] overflow-y-auto p-4 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">Add Workout</h3>
                    <button onClick={onClose}><i className="ph ph-x text-xl text-text-secondary"></i></button>
                </div>

                <div>
                    <label className="text-xs text-text-secondary">Exercise name</label>
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Squats"
                        className="w-full bg-bg border border-border rounded-md px-3 py-2 mt-1 text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs text-text-secondary mb-1.5 block">Set type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SET_TYPE_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSetType(opt.id)}
                                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border text-left ${setType === opt.id ? "border-primary bg-primary/10" : "border-border"}`}
                            >
                                <i className={`ph ${opt.icon} text-primary`}></i>
                                <div>
                                    <div className="text-xs font-medium">{opt.label}</div>
                                    <div className="text-[10px] text-text-secondary">{opt.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {setType === "superset" && (
                    <div>
                        <label className="text-xs text-text-secondary">Paired with</label>
                        <input
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            placeholder="e.g. Hammer Curl"
                            className="w-full bg-bg border border-border rounded-md px-3 py-2 mt-1 text-sm"
                        />
                    </div>
                )}

                <div>
                    <label className="text-xs text-text-secondary">Number of sets</label>
                    <div className="flex items-center gap-3 mt-1">
                        <button onClick={() => setNumSets(Math.max(1, numSets - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center"><i className="ph ph-minus"></i></button>
                        <span className="text-base font-medium w-6 text-center">{numSets}</span>
                        <button onClick={() => setNumSets(numSets + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center"><i className="ph ph-plus"></i></button>
                    </div>
                </div>

                <button onClick={handleAdd} disabled={!name.trim()} className="bg-primary text-bg font-semibold rounded-lg py-2.5 disabled:opacity-40">
                    Add to today
                </button>
            </div>
        </div>
    );
}
