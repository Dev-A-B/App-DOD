// =====================================================================
// PRView.js — all PRs across both users, grouped by exercise, sourced
// entirely from Firebase /profiles/{user}/prs.
// =====================================================================

function PRView({ onBack, profiles }) {
    const [filterUser, setFilterUser] = React.useState("both");
    const [query, setQuery] = React.useState("");

    const exerciseNames = React.useMemo(() => {
        const names = new Set();
        USER_KEYS.forEach(uk => Object.keys(profiles[uk]?.prs || {}).forEach(n => names.add(n)));
        return Array.from(names).sort();
    }, [profiles]);

    const filtered = exerciseNames.filter(n => n.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <button onClick={onBack}><i className="ph ph-arrow-left text-xl"></i></button>
                <h2 className="font-display text-lg">Personal Records</h2>
            </div>

            <div className="px-3 py-2 flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                    <i className="ph ph-magnifying-glass text-text-secondary"></i>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercise" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
            </div>

            <div className="px-3 flex gap-2 pb-2">
                {["both", ...USER_KEYS].map(opt => (
                    <button
                        key={opt}
                        onClick={() => setFilterUser(opt)}
                        className={`text-xs px-3 py-1.5 rounded-full border ${filterUser === opt ? "bg-primary text-bg border-primary" : "border-border text-text-secondary"}`}
                    >
                        {opt === "both" ? "Both" : (profiles[opt]?.name || opt)}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 flex flex-col gap-2">
                {filtered.length === 0 && <div className="text-center text-text-secondary text-sm py-8">No PRs yet.</div>}
                {filtered.map(name => (
                    <div key={name} className="bg-surface border border-border rounded-xl px-3 py-2.5">
                        <div className="text-sm font-medium mb-1.5">{name}</div>
                        <div className="flex gap-4">
                            {USER_KEYS.filter(uk => filterUser === "both" || filterUser === uk).map(uk => {
                                const pr = profiles[uk]?.prs?.[name];
                                if (!pr || (pr.bilateral === 0 && pr.unilateral === 0)) return null;
                                const style = USER_STYLE[uk];
                                return (
                                    <div key={uk} className="flex flex-col">
                                        <span className={`text-[10px] uppercase font-semibold ${style.color}`}>{profiles[uk]?.name || uk}</span>
                                        {pr.bilateral > 0 && <span className="text-sm">{pr.bilateral} kg</span>}
                                        {pr.unilateral > 0 && <span className="text-xs text-text-secondary">{pr.unilateral} kg (uni)</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
