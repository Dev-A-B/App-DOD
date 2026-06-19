// =====================================================================
// Pure utility functions. No workout/user/split content lives here —
// only generic logic that operates on whatever data Firebase returns.
// =====================================================================

function todayStr() {
    const d = new Date();
    return formatDateKey(d);
}

function formatDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatDateDisplay(dateKey) {
    const d = new Date(dateKey + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function normalizeExerciseName(name) {
    return (name || "").trim().toUpperCase();
}

function makeExerciseId(name, order) {
    const base = normalizeExerciseName(name).replace(/[.#$\[\]/]/g, "_").replace(/\s+/g, "_").replace(/^_+|_+$/g, "") || "EXERCISE";
    return `${base}_${order}_${Date.now().toString(36)}`;
}

// --- Set-shape helpers: extract a comparable "heaviest stage weight" from
// any set, regardless of setType, for PR computation. ---
function heaviestWeightInSet(set, setType) {
    if (setType === "dropset" || setType === "pyramid") {
        const stages = set.stages || [];
        let max = -Infinity;
        for (const s of stages) {
            const w = parseFloat(s.weight);
            if (!isNaN(w) && w > max) max = w;
        }
        return max === -Infinity ? null : max;
    }
    const w = parseFloat(set.weight);
    return isNaN(w) ? null : w;
}

function isUnilateralSet(set) {
    return !!set.uni;
}

// Given a day's exercises object (from /days/{date}/{user}/exercises), update
// a PR record map { [exName]: {bilateral, unilateral, lastUpdated} } in place,
// returning whether anything changed.
function updatePRsFromExercises(prMap, exercises, dateKey) {
    let changed = false;
    Object.values(exercises || {}).forEach(ex => {
        const name = ex.name;
        if (!name) return;
        if (!prMap[name]) {
            prMap[name] = { bilateral: 0, unilateral: 0, lastUpdated: null };
        }
        const rec = prMap[name];
        Object.values(ex.sets || {}).forEach(set => {
            const w = heaviestWeightInSet(set, ex.setType);
            if (w === null) return;
            if (isUnilateralSet(set)) {
                if (w > rec.unilateral) { rec.unilateral = w; rec.lastUpdated = dateKey; changed = true; }
            } else {
                if (w > rec.bilateral) { rec.bilateral = w; rec.lastUpdated = dateKey; changed = true; }
            }
        });
    });
    return changed;
}

// Build a flat, lower-cased searchable string for a day+user's workout,
// used by the History search. Includes exercise names and the split label
// if present (free-text legacy label or resolved split/day focus).
function buildSearchIndexForDay(dayUserData, splitsMap) {
    const parts = [];
    if (dayUserData.legacySplitLabel) parts.push(dayUserData.legacySplitLabel);
    if (dayUserData.splitId && splitsMap && splitsMap[dayUserData.splitId]) {
        const split = splitsMap[dayUserData.splitId];
        parts.push(split.name);
        const day = (split.days || []).find(d => d.id === dayUserData.splitDayId);
        if (day) parts.push(day.focus || day.label);
    }
    Object.values(dayUserData.exercises || {}).forEach(ex => {
        parts.push(ex.exerciseDisplayName || ex.name);
    });
    return parts.join(" ").toLowerCase();
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function formatDuration(totalMs) {
    const totalCentis = Math.floor(totalMs / 10);
    const minutes = Math.floor(totalCentis / 6000);
    const seconds = Math.floor((totalCentis % 6000) / 100);
    const centis = totalCentis % 100;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}
