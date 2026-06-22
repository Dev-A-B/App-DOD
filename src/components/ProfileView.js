// =====================================================================
// ProfileView.js — pick a user, see their stats (derived from Firebase
// /profiles and /days — no hardcoded user facts beyond style accents).
// =====================================================================

function ProfileView({ onBack, profiles }) {
    const [selected, setSelected] = React.useState(null);
    const [allDays, setAllDays] = React.useState(null);

    React.useEffect(() => {
        if (selected) fetchAllDays().then(setAllDays);
    }, [selected]);

    // IMPORTANT: hooks must run unconditionally on every render, in the same
    // order, regardless of `selected`. The previous version put this
    // useMemo AFTER an early `return` for the !selected case, which violates
    // React's Rules of Hooks the moment a user is picked (hook count changes
    // between renders) — React throws and unmounts the whole tree, which is
    // what caused the black screen when tapping a user.
    const stats = React.useMemo(() => {
        if (!selected || !allDays) return null;
        let daysTrained = 0, totalSets = 0, totalExercises = 0;
        const bodyWeights = [];
        Object.keys(allDays).sort().forEach(d => {
            const ud = allDays[d]?.[selected];
            if (!ud) return;
            const exCount = Object.keys(ud.exercises || {}).length;
            if (exCount > 0) daysTrained++;
            totalExercises += exCount;
            Object.values(ud.exercises || {}).forEach(ex => { totalSets += Object.keys(ex.sets || {}).length; });
            if (ud.bodyWeight) bodyWeights.push({ date: d, weight: parseFloat(ud.bodyWeight) });
        });
        const latestBW = bodyWeights.length ? bodyWeights[bodyWeights.length - 1] : null;
        return { daysTrained, totalSets, totalExercises, latestBW };
    }, [allDays, selected]);

    if (!selected) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                    <button onClick={onBack}><i className="ph ph-arrow-left text-xl"></i></button>
                    <h2 className="font-display text-lg">Users</h2>
                </div>
                <div className="flex-1 flex flex-col gap-3 p-4 justify-center">
                    {USER_KEYS.map(uk => {
                        const style = USER_STYLE[uk];
                        const profile = profiles[uk] || {};
                        return (
                            <button
                                key={uk}
                                onClick={() => setSelected(uk)}
                                className={`flex items-center gap-3 bg-surface border ${style.border} rounded-xl px-4 py-4`}
                            >
                                <i className={`ph ph-user-circle text-3xl ${style.color}`}></i>
                                <div className="text-left">
                                    <div className="font-display text-lg">{profile.name || uk}</div>
                                    {profile.height && <div className="text-xs text-text-secondary">Height: {profile.height} cm</div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const profile = profiles[selected] || {};
    const style = USER_STYLE[selected];

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <button onClick={() => setSelected(null)}><i className="ph ph-arrow-left text-xl"></i></button>
                <h2 className="font-display text-lg">{profile.name || selected}</h2>
            </div>
            <div className="p-4 flex flex-col gap-3">
                <div className={`bg-surface border ${style.border} rounded-xl p-4 flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                        <i className={`ph ph-user-circle text-2xl ${style.color}`}></i>
                        <span className="font-display text-xl">{profile.name || selected}</span>
                    </div>
                    {profile.dob && <div className="text-xs text-text-secondary">DOB: {profile.dob}</div>}
                    {profile.height && <div className="text-xs text-text-secondary">Height: {profile.height} cm</div>}
                    {stats?.latestBW && <div className="text-xs text-text-secondary">Latest weight: {stats.latestBW.weight} kg ({stats.latestBW.date})</div>}
                </div>

                {stats === null && <div className="text-center text-text-secondary text-sm py-8">Loading stats...</div>}
                {stats && (
                    <div className="grid grid-cols-3 gap-2">
                        <StatBox label="Days trained" value={stats.daysTrained} />
                        <StatBox label="Exercises logged" value={stats.totalExercises} />
                        <StatBox label="Total sets" value={stats.totalSets} />
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <div className="font-display text-2xl">{value}</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</div>
        </div>
    );
}
