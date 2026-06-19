# Do or Die — New Firebase Data Model

## /days/{YYYY-MM-DD}/{raghendh|devanandh}
```
{
  bodyWeight: "92" | null,
  splitId: "cbum_8" | null,        // optional, references /splits/{splitId}
  splitDayId: 1 | null,            // which day of that split, optional
  exercises: {
    "<exId>": {
      order: 0,                    // for stable ordering (object, not array, for safer multi-write)
      name: "SQUATS",              // normalized uppercase, display copy kept in exerciseDisplayName
      exerciseDisplayName: "Squats",
      setType: "standard" | "dropset" | "pyramid" | "superset" | "timed",
      remark: "Do 45 last" | null,
      supersetWith: "<exId of partner>" | null,   // only when setType === "superset"
      sets: { "<setId>": { ... shape depends on setType, see below } }
    }
  }
}
```

### Set shapes by setType

**standard**
```
{ weight: "60", reps: "10" | "F", uni: false }
```
`reps: "F"` means "to failure". `uni: true` = unilateral (per-side weight).

**timed**
```
{ weight: "0" | "BW", durationSeconds: 45, uni: false }
```
weight "BW" = bodyweight only.

**dropset**  — ONE logical set = ordered stages, each a weight drop
```
{
  stages: [
    { weight: "60", reps: "8" },
    { weight: "42", reps: "F" },
    { weight: "30", reps: "F" }
  ],
  uni: false
}
```

**pyramid** — ONE logical "round" = ordered stages, ascending or descending
```
{
  direction: "ascending" | "descending",
  stages: [
    { weight: "20", reps: "20" },
    { weight: "30", reps: "15" },
    { weight: "35", reps: "10" },
    { weight: "40", reps: "F" }
  ],
  uni: false
}
```

**superset** — lives on TWO exercise entries (linked via supersetWith), each entry's `sets`
are plain standard-shaped sets, but the round number ties them together via array index /
ordering. (No special set-shape; the exercise-level link is what marks it.)

---

## /profiles/{raghendh|devanandh}
```
{
  name, dob, height,
  prs: {
    "<exId>": {
      bilateral: 60,
      unilateral: 12.5,
      lastUpdated: "2026-06-16"
    }
  }
}
```
PR rule: for dropset/pyramid sets, only the heaviest single stage weight within that
logical set counts toward bilateral/unilateral PR. Recomputed by the app whenever a
set is saved (incremental update — compare new value vs stored PR, bump if higher).
Migration script does a one-time full recompute from history.

## /splits/{splitId}
```
{
  id: "cbum_8", name: "C-Bum 8-Day Split", subtitle: "...",
  rules: [ { rule: "...", method: "..." } ],
  days: [
    {
      id: 1, label: "Day 1", focus: "Quads & Calves", emoji, color,
      rest: false,
      exercises: [
        {
          name, tag, sets, reps, weightMethod, tempo, rest, notes,
          setType: "standard" | "dropset" | "pyramid" | "superset" | "timed"  // NEW field added in migration
        }
      ]
    },
    { id: 4, label: "Day 4", focus: "REST", rest: true }
  ]
}
```
`splits` is now a TOP-LEVEL shared library (not per-user like the old `/programs/{user}/{splitId}`),
since splits are shared templates both users pick from.

## /exercise_meta/{EXERCISE_KEY}
Unchanged from existing export — carried over as-is. AI-generated muscle engagement data,
keyed by normalized uppercase exercise name.
