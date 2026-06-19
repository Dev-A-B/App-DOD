// =====================================================================
// IMPORTANT: This file defines ONLY app behavior/structure — set-type
// shapes, UI labels for set types, empty-set factories. It must NEVER
// contain actual workout data, user names, split content, or rules.
// All of that lives exclusively in Firebase under /days, /profiles,
// /splits, /exercise_meta — fetched at runtime.
// =====================================================================

const USER_KEYS = ["raghendh", "devanandh"];

// Visual accents per user slot — purely cosmetic, not user data itself.
// (User display name, dob, etc. come from Firebase /profiles/{key}.)
const USER_STYLE = {
    raghendh: { color: "text-primary", bg: "bg-primary", border: "border-primary", shadow: "shadow-neon-green" },
    devanandh: { color: "text-secondary", bg: "bg-secondary", border: "border-secondary", shadow: "shadow-neon-orange" }
};

// Set-type definitions: these describe the SHAPE of input the app collects,
// not workout content. Adding a new type here is a code change; the actual
// exercises/sets logged or planned are always Firebase data.
const SET_TYPE_OPTIONS = [
    { id: "standard", label: "Standard", icon: "ph-square", desc: "Weight x reps" },
    { id: "dropset", label: "Drop Set", icon: "ph-trend-down", desc: "Weight drops mid-set" },
    { id: "pyramid", label: "Pyramid", icon: "ph-triangle", desc: "Weight steps up/down" },
    { id: "superset", label: "Superset", icon: "ph-link", desc: "Two exercises, back to back" },
    { id: "timed", label: "Timed", icon: "ph-timer", desc: "Duration instead of reps" }
];

const SET_TYPE_META = Object.fromEntries(SET_TYPE_OPTIONS.map(o => [o.id, o]));

// Empty set factories per type — structural defaults for a NEW blank input
// row, not workout data.
function makeEmptySet(setType) {
    switch (setType) {
        case "standard":
            return { weight: "", reps: "", uni: false };
        case "timed":
            return { weight: "", durationSeconds: "", uni: false };
        case "dropset":
            return { stages: [{ weight: "", reps: "" }, { weight: "", reps: "" }], uni: false };
        case "pyramid":
            return { direction: "ascending", stages: [{ weight: "", reps: "" }, { weight: "", reps: "" }, { weight: "", reps: "" }], uni: false };
        case "superset":
            return { weight: "", reps: "", uni: false };
        default:
            return { weight: "", reps: "", uni: false };
    }
}
