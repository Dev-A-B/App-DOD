// =====================================================================
// SplitEditor.js — full edit mode for a split: rename, edit subtitle,
// edit/add/remove rules, edit/add/remove days, edit/add/remove exercises
// per day including set type and all fields. Saves back to Firebase.
// =====================================================================

function SplitEditTab({ split }) {
    const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(split)));
    const [dirty, setDirty] = React.useState(false);
    const [savedFlash, setSavedFlash] = React.useState(false);

    function update(patch) {
        setDraft(prev => ({ ...prev, ...patch }));
        setDirty(true);
    }

    function updateDay(dayIdx, patch) {
        const days = draft.days.map((d, i) => i === dayIdx ? { ...d, ...patch } : d);
        update({ days });
    }

    function updateExercise(dayIdx, exIdx, patch) {
        const days = draft.days.map((d, i) => {
            if (i !== dayIdx) return d;
            const exercises = (d.exercises || []).map((e, j) => j === exIdx ? { ...e, ...patch } : e);
            return { ...d, exercises };
        });
        update({ days });
    }

    function addExercise(dayIdx) {
        const days = draft.days.map((d, i) => {
            if (i !== dayIdx) return d;
            const exercises = [...(d.exercises || []), { name: "New Exercise", setType: "standard", sets: "3", reps: "10", notes: "" }];
            return { ...d, exercises };
        });
        update({ days });
    }

    function removeExercise(dayIdx, exIdx) {
        const days = draft.days.map((d, i) => {
            if (i !== dayIdx) return d;
            return { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) };
        });
        update({ days });
    }

    function addDay() {
        const newId = (draft.days.length ? Math.max(...draft.days.map(d => d.id)) : 0) + 1;
        update({ days: [...draft.days, { id: newId, label: `Day ${newId}`, focus: "New Focus", emoji: "🏋️", color: "#555555", rest: false, exercises: [] }] });
    }

    function removeDay(dayIdx) {
        update({ days: draft.days.filter((_, i) => i !== dayIdx) });
    }

    function addRule() {
        update({ rules: [...(draft.rules || []), { rule: "New rule", method: "" }] });
    }

    function updateRule(idx, patch) {
        const rules = draft.rules.map((r, i) => i === idx ? { ...r, ...patch } : r);
        update({ rules });
    }

    function removeRule(idx) {
        update({ rules: draft.rules.filter((_, i) => i !== idx) });
    }

    async function handleSave() {
        await saveSplit(draft.id, draft);
        setDirty(false);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
    }

    return (
        <div className="p-3 flex flex-col gap-4 pb-24">
            <div>
                <label className="text-xs text-text-secondary">Split name</label>
                <input value={draft.name} onChange={(e) => update({ name: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 mt-1 text-sm font-display" />
            </div>
            <div>
                <label className="text-xs text-text-secondary">Subtitle</label>
                <input value={draft.subtitle || ""} onChange={(e) => update({ subtitle: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 mt-1 text-sm" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Rules</h4>
                    <button onClick={addRule} className="text-xs text-primary flex items-center gap-1"><i className="ph ph-plus"></i> Add rule</button>
                </div>
                <div className="flex flex-col gap-2">
                    {(draft.rules || []).map((r, i) => (
                        <div key={i} className="bg-surface border border-border rounded-lg p-2.5 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <input value={r.rule} onChange={(e) => updateRule(i, { rule: e.target.value })} className="flex-1 bg-bg border border-border rounded px-2 py-1 text-xs font-medium" placeholder="Rule title" />
                                <button onClick={() => removeRule(i)}><i className="ph ph-trash text-text-secondary text-sm"></i></button>
                            </div>
                            <textarea value={r.method} onChange={(e) => updateRule(i, { method: e.target.value })} className="bg-bg border border-border rounded px-2 py-1 text-xs" placeholder="Method / description" rows={2} />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Days</h4>
                    <button onClick={addDay} className="text-xs text-primary flex items-center gap-1"><i className="ph ph-plus"></i> Add day</button>
                </div>
                <div className="flex flex-col gap-3">
                    {draft.days.map((day, dayIdx) => (
                        <div key={dayIdx} className="bg-surface border border-border rounded-xl p-2.5 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input value={day.label} onChange={(e) => updateDay(dayIdx, { label: e.target.value })} className="w-20 bg-bg border border-border rounded px-2 py-1 text-xs" placeholder="Label" />
                                <input value={day.focus} onChange={(e) => updateDay(dayIdx, { focus: e.target.value })} className="flex-1 bg-bg border border-border rounded px-2 py-1 text-xs" placeholder="Focus" />
                                <input value={day.emoji || ""} onChange={(e) => updateDay(dayIdx, { emoji: e.target.value })} className="w-12 bg-bg border border-border rounded px-2 py-1 text-xs text-center" placeholder="🏋️" />
                                <button onClick={() => removeDay(dayIdx)}><i className="ph ph-trash text-text-secondary text-sm"></i></button>
                            </div>
                            <label className="flex items-center gap-2 text-[11px] text-text-secondary">
                                <input type="checkbox" checked={!!day.rest} onChange={(e) => updateDay(dayIdx, { rest: e.target.checked })} />
                                Rest day (no exercises)
                            </label>

                            {!day.rest && (
                                <div className="flex flex-col gap-2 mt-1">
                                    {(day.exercises || []).map((ex, exIdx) => (
                                        <div key={exIdx} className="bg-bg border border-border rounded-lg p-2 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <input value={ex.name} onChange={(e) => updateExercise(dayIdx, exIdx, { name: e.target.value })} className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs" placeholder="Exercise name" />
                                                <button onClick={() => removeExercise(dayIdx, exIdx)}><i className="ph ph-trash text-text-secondary text-sm"></i></button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select value={ex.setType || "standard"} onChange={(e) => updateExercise(dayIdx, exIdx, { setType: e.target.value })} className="bg-surface border border-border rounded px-1.5 py-1 text-[11px]">
                                                    {SET_TYPE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                                </select>
                                                <input value={ex.sets} onChange={(e) => updateExercise(dayIdx, exIdx, { sets: e.target.value })} className="w-12 bg-surface border border-border rounded px-1.5 py-1 text-[11px] text-center" placeholder="sets" />
                                                <input value={ex.reps} onChange={(e) => updateExercise(dayIdx, exIdx, { reps: e.target.value })} className="w-16 bg-surface border border-border rounded px-1.5 py-1 text-[11px] text-center" placeholder="reps" />
                                            </div>
                                            <input value={ex.notes || ""} onChange={(e) => updateExercise(dayIdx, exIdx, { notes: e.target.value })} className="bg-surface border border-border rounded px-2 py-1 text-[11px]" placeholder="Notes" />
                                        </div>
                                    ))}
                                    <button onClick={() => addExercise(dayIdx)} className="text-[11px] text-primary flex items-center gap-1 self-start">
                                        <i className="ph ph-plus"></i> Add exercise
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={!dirty}
                className={`fixed bottom-20 left-3 right-3 rounded-xl py-3 font-semibold ${savedFlash ? "bg-primary text-bg" : dirty ? "bg-primary text-bg" : "bg-border text-text-secondary"}`}
            >
                {savedFlash ? "Saved!" : "Save changes"}
            </button>
        </div>
    );
}
