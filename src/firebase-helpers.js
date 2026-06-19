// =====================================================================
// Thin Firebase RTDB helpers. No content/data is ever hardcoded here —
// these functions only describe HOW to read/write whatever lives at
// /days, /profiles, /splits, /exercise_meta.
// =====================================================================

const db = window.firebaseDb;
const {
    ref, get, set, update, remove, push, onValue, child
} = window.firebaseRTDB;

function dbRef(path) {
    return ref(db, path);
}

// ---- Days ----
function dayUserRef(dateKey, userKey) {
    return dbRef(`days/${dateKey}/${userKey}`);
}

function subscribeDayUser(dateKey, userKey, callback) {
    return onValue(dayUserRef(dateKey, userKey), (snap) => {
        callback(snap.val() || { exercises: {} });
    });
}

async function saveExercise(dateKey, userKey, exerciseId, exerciseData) {
    await set(child(dayUserRef(dateKey, userKey), `exercises/${exerciseId}`), exerciseData);
}

async function deleteExercise(dateKey, userKey, exerciseId) {
    await remove(child(dayUserRef(dateKey, userKey), `exercises/${exerciseId}`));
}

async function saveBodyWeight(dateKey, userKey, value) {
    await update(dayUserRef(dateKey, userKey), { bodyWeight: value });
}

async function saveDaySplit(dateKey, userKey, splitId, splitDayId) {
    if (splitId === null) {
        await update(dayUserRef(dateKey, userKey), { splitId: null, splitDayId: null });
    } else {
        await update(dayUserRef(dateKey, userKey), { splitId, splitDayId });
    }
}

async function fetchAllDays() {
    const snap = await get(dbRef("days"));
    return snap.val() || {};
}

// ---- Profiles / PRs ----
function profileRef(userKey) {
    return dbRef(`profiles/${userKey}`);
}

function subscribeProfile(userKey, callback) {
    return onValue(profileRef(userKey), (snap) => callback(snap.val() || {}));
}

async function fetchProfile(userKey) {
    const snap = await get(profileRef(userKey));
    return snap.val() || {};
}

async function applyPRUpdates(userKey, prUpdates) {
    // prUpdates: { [exerciseName]: {bilateral, unilateral, lastUpdated} } — merge-only patch
    if (!prUpdates || Object.keys(prUpdates).length === 0) return;
    const patch = {};
    Object.entries(prUpdates).forEach(([name, rec]) => {
        patch[`prs/${name.replace(/[.#$\[\]/]/g, "_")}`] = rec;
    });
    await update(profileRef(userKey), patch);
}

// ---- Splits ----
function splitsRef() {
    return dbRef("splits");
}

function subscribeSplits(callback) {
    return onValue(splitsRef(), (snap) => callback(snap.val() || {}));
}

async function saveSplit(splitId, splitData) {
    await set(child(splitsRef(), splitId), splitData);
}

async function deleteSplit(splitId) {
    await remove(child(splitsRef(), splitId));
}

// ---- Exercise meta (muscle engagement library) ----
function exerciseMetaRef() {
    return dbRef("exercise_meta");
}

function subscribeExerciseMeta(callback) {
    return onValue(exerciseMetaRef(), (snap) => callback(snap.val() || {}));
}
