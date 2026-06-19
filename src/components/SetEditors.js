// =====================================================================
// SetEditors.js — input rows for each set type. Each editor receives
// the current set value object and an onChange(newSetValue) callback.
// =====================================================================

function FailureToggleReps({ value, onChange, placeholder }) {
    // reps field that supports a normal number OR "F" for failure
    const isFailure = value === "F";
    return (
        <div className="flex items-center gap-1">
            <input
                type={isFailure ? "text" : "number"}
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "reps"}
                className="w-14 bg-bg border border-border rounded-md px-2 py-1 text-sm text-center"
            />
            <button
                type="button"
                onClick={() => onChange(isFailure ? "" : "F")}
                title="Toggle failure"
                className={`text-[10px] font-bold rounded px-1.5 py-1 border ${isFailure ? "bg-secondary text-bg border-secondary" : "border-border text-text-secondary"}`}
            >F</button>
        </div>
    );
}

function WeightInput({ value, onChange, allowBodyweight }) {
    const isBW = value === "BW";
    return (
        <div className="flex items-center gap-1">
            <input
                type={isBW ? "text" : "number"}
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="kg"
                disabled={isBW}
                className="w-16 bg-bg border border-border rounded-md px-2 py-1 text-sm text-center disabled:opacity-40"
            />
            {allowBodyweight && (
                <button
                    type="button"
                    onClick={() => onChange(isBW ? "" : "BW")}
                    title="Bodyweight only"
                    className={`text-[10px] font-bold rounded px-1.5 py-1 border ${isBW ? "bg-primary text-bg border-primary" : "border-border text-text-secondary"}`}
                >BW</button>
            )}
        </div>
    );
}

function UniToggle({ value, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            title="Unilateral (per side)"
            className={`text-[10px] font-bold rounded px-1.5 py-1 border ${value ? "bg-accent-purple text-bg border-accent-purple" : "border-border text-text-secondary"}`}
        >UNI</button>
    );
}

// ---- Standard ----
function StandardSetEditor({ value, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <WeightInput value={value.weight} onChange={(w) => onChange({ ...value, weight: w })} />
            <span className="text-text-secondary text-xs">x</span>
            <FailureToggleReps value={value.reps} onChange={(r) => onChange({ ...value, reps: r })} />
            <UniToggle value={value.uni} onChange={(u) => onChange({ ...value, uni: u })} />
        </div>
    );
}

// ---- Timed ----
function TimedSetEditor({ value, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <WeightInput value={value.weight} onChange={(w) => onChange({ ...value, weight: w })} allowBodyweight />
            <span className="text-text-secondary text-xs">for</span>
            <input
                type="number"
                inputMode="numeric"
                value={value.durationSeconds}
                onChange={(e) => onChange({ ...value, durationSeconds: e.target.value })}
                placeholder="sec"
                className="w-16 bg-bg border border-border rounded-md px-2 py-1 text-sm text-center"
            />
            <UniToggle value={value.uni} onChange={(u) => onChange({ ...value, uni: u })} />
        </div>
    );
}

// ---- Dropset (ordered stages within one logical set) ----
function DropsetSetEditor({ value, onChange }) {
    const stages = value.stages || [];

    function updateStage(i, patch) {
        const next = stages.map((s, idx) => idx === i ? { ...s, ...patch } : s);
        onChange({ ...value, stages: next });
    }
    function addStage() {
        onChange({ ...value, stages: [...stages, { weight: "", reps: "" }] });
    }
    function removeStage(i) {
        onChange({ ...value, stages: stages.filter((_, idx) => idx !== i) });
    }

    return (
        <div className="flex flex-col gap-1.5">
            {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary w-10">{i === 0 ? "Start" : `Drop ${i}`}</span>
                    <WeightInput value={s.weight} onChange={(w) => updateStage(i, { weight: w })} />
                    <span className="text-text-secondary text-xs">x</span>
                    <FailureToggleReps value={s.reps} onChange={(r) => updateStage(i, { reps: r })} />
                    {stages.length > 2 && (
                        <button onClick={() => removeStage(i)} className="text-text-secondary hover:text-secondary">
                            <i className="ph ph-x text-sm"></i>
                        </button>
                    )}
                </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
                <button onClick={addStage} className="text-[11px] text-primary flex items-center gap-1">
                    <i className="ph ph-plus text-xs"></i> Add drop
                </button>
                <UniToggle value={value.uni} onChange={(u) => onChange({ ...value, uni: u })} />
            </div>
        </div>
    );
}

// ---- Pyramid (ordered stages, ascending or descending) ----
function PyramidSetEditor({ value, onChange }) {
    const stages = value.stages || [];

    function updateStage(i, patch) {
        const next = stages.map((s, idx) => idx === i ? { ...s, ...patch } : s);
        onChange({ ...value, stages: next });
    }
    function addStage() {
        onChange({ ...value, stages: [...stages, { weight: "", reps: "" }] });
    }
    function removeStage(i) {
        onChange({ ...value, stages: stages.filter((_, idx) => idx !== i) });
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5 mb-1">
                {["ascending", "descending"].map(dir => (
                    <button
                        key={dir}
                        onClick={() => onChange({ ...value, direction: dir })}
                        className={`text-[10px] font-semibold rounded px-2 py-1 border flex items-center gap-1 ${value.direction === dir ? "bg-primary text-bg border-primary" : "border-border text-text-secondary"}`}
                    >
                        <i className={`ph ${dir === "ascending" ? "ph-trend-up" : "ph-trend-down"} text-xs`}></i>
                        {dir === "ascending" ? "Weight up" : "Weight down"}
                    </button>
                ))}
            </div>
            {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary w-10">Step {i + 1}</span>
                    <WeightInput value={s.weight} onChange={(w) => updateStage(i, { weight: w })} />
                    <span className="text-text-secondary text-xs">x</span>
                    <FailureToggleReps value={s.reps} onChange={(r) => updateStage(i, { reps: r })} />
                    {stages.length > 2 && (
                        <button onClick={() => removeStage(i)} className="text-text-secondary hover:text-secondary">
                            <i className="ph ph-x text-sm"></i>
                        </button>
                    )}
                </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
                <button onClick={addStage} className="text-[11px] text-primary flex items-center gap-1">
                    <i className="ph ph-plus text-xs"></i> Add step
                </button>
                <UniToggle value={value.uni} onChange={(u) => onChange({ ...value, uni: u })} />
            </div>
        </div>
    );
}

// ---- Superset (this set editor renders like Standard; the linkage to a
// partner exercise happens at the exercise level, see ExerciseCard.js) ----
function SupersetSetEditor({ value, onChange }) {
    return <StandardSetEditor value={value} onChange={onChange} />;
}

function SetEditorForType({ setType, value, onChange }) {
    switch (setType) {
        case "dropset": return <DropsetSetEditor value={value} onChange={onChange} />;
        case "pyramid": return <PyramidSetEditor value={value} onChange={onChange} />;
        case "timed": return <TimedSetEditor value={value} onChange={onChange} />;
        case "superset": return <SupersetSetEditor value={value} onChange={onChange} />;
        case "standard":
        default: return <StandardSetEditor value={value} onChange={onChange} />;
    }
}

// Compact read-only summary string for a set, used in history/PR displays.
function summarizeSet(set, setType) {
    if (setType === "dropset" || setType === "pyramid") {
        return (set.stages || []).map(s => `${s.weight || "-"}x${s.reps || "-"}`).join(" → ");
    }
    if (setType === "timed") {
        return `${set.weight || "BW"} for ${set.durationSeconds || "-"}s`;
    }
    return `${set.weight || "-"}x${set.reps || "-"}${set.uni ? " (uni)" : ""}`;
}
