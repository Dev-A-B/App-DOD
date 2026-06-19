// =====================================================================
// Footer.js — bottom nav with exactly three tabs per spec:
// User 1 (Raghendh), User 2 (Devanandh), Splits.
// =====================================================================

function FooterTabs({ activeTab, onChangeTab, profiles }) {
    const tabs = [
        { id: "raghendh", icon: "ph-person-simple-run", label: profiles?.raghendh?.name || "User 1", styleKey: "raghendh" },
        { id: "devanandh", icon: "ph-person-simple-run", label: profiles?.devanandh?.name || "User 2", styleKey: "devanandh" },
        { id: "splits", icon: "ph-stack", label: "Splits", styleKey: null }
    ];

    return (
        <div className="grid grid-cols-3 bg-surface border-t border-border">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const style = tab.styleKey ? USER_STYLE[tab.styleKey] : null;
                const activeColor = style ? style.color : "text-accent-purple";
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChangeTab(tab.id)}
                        className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${isActive ? activeColor : "text-text-secondary"}`}
                    >
                        <i className={`ph ${tab.icon} text-2xl`}></i>
                        <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
