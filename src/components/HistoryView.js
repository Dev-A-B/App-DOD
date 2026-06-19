// =====================================================================
// HistoryView.js — search bar + results across both users' logged
// workouts, matching exercise name, split name/focus, or legacy label.
// =====================================================================

function HistoryView({ onBack, onJumpToDate, splits }) {
    const [query, setQuery] = React.useState("");
    const [allDays, setAllDays] = React.useState(null);

    React.useEffect(() => {
        fetchAllDays().then(setAllDays);
    }, []);

    const results = React.useMemo(() => {
        if (!allDays) return [];
        const q = query.trim().toLowerCase();
        const out = [];
        Object.keys(allDays).sort().reverse().forEach(dateKey => {
            USER_KEYS.forEach(userKey => {
                const userDay = allDays[dateKey]?.[userKey];
                if (!userDay) return;
                const idx = buildSearchIndexForDay(userDay, splits);
                if (!q || idx.includes(q)) {
                    out.push({ dateKey, userKey, userDay });
                }
            });
        });
        return out;
    }, [allDays, query, splits]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <button onClick={onBack}><i className="ph ph-arrow-left text-xl"></i></button>
                <h2 className="font-display text-lg">History</h2>
            </div>

            <div className="px-3 py-2">
                <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                    <i className="ph ph-magnifying-glass text-text-secondary"></i>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search workout, split, or muscle group..."
                        className="flex-1 bg-transparent outline-none text-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 flex flex-col gap-2">
                {allDays === null && <div className="text-center text-text-secondary text-sm py-8">Loading...</div>}
                {allDays !== null && results.length === 0 && (
                    <div className="text-center text-text-secondary text-sm py-8">No matching workouts found.</div>
                )}
                {results.map(({ dateKey, userKey, userDay }, i) => {
                    const style = USER_STYLE[userKey];
                    const exNames = Object.values(userDay.exercises || {}).map(e => e.exerciseDisplayName || e.name);
                    return (
                        <button
                            key={`${dateKey}-${userKey}-${i}`}
                            onClick={() => onJumpToDate(dateKey, userKey)}
                            className="bg-surface border border-border rounded-xl px-3 py-2.5 text-left"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{formatDateDisplay(dateKey)}</span>
                                <span className={`text-[10px] uppercase font-semibold ${style.color}`}>{userKey}</span>
                            </div>
                            {userDay.legacySplitLabel && (
                                <div className="text-[11px] text-text-secondary mb-1">{userDay.legacySplitLabel}</div>
                            )}
                            <div className="text-[12px] text-text-secondary truncate">{exNames.join(", ") || "No exercises logged"}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
