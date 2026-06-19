// =====================================================================
// Header.js — top bar. Date selector, history icon, user icon, PR icon.
// Shown on every screen except History and Profile views (per spec).
// =====================================================================

function Header({ dateKey, onDateChange, onOpenHistory, onOpenProfile, onOpenPR, compressed }) {
    const dateInputRef = React.useRef(null);

    function openDatePicker() {
        if (dateInputRef.current) {
            if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
            else dateInputRef.current.click();
        }
    }

    return (
        <div className={`flex items-center justify-between px-3 ${compressed ? "py-1.5" : "py-2.5"} bg-surface/95 backdrop-blur border-b border-border transition-all duration-300`}>
            <button onClick={openDatePicker} className="flex items-center gap-1.5 text-text-primary">
                <i className="ph ph-calendar-blank text-lg text-primary"></i>
                <span className="font-display text-sm tracking-wide">{formatDateDisplay(dateKey)}</span>
                <input
                    ref={dateInputRef}
                    type="date"
                    className="sr-only"
                    value={dateKey}
                    onChange={(e) => onDateChange(e.target.value)}
                />
            </button>

            <div className="flex items-center gap-3">
                <button onClick={onOpenHistory} aria-label="History" className="text-text-secondary hover:text-primary transition-colors">
                    <i className="ph ph-clock-counter-clockwise text-xl"></i>
                </button>
                <button onClick={onOpenPR} aria-label="Personal Records" className="text-text-secondary hover:text-secondary transition-colors">
                    <i className="ph ph-trophy text-xl"></i>
                </button>
                <button onClick={onOpenProfile} aria-label="User profiles" className="text-text-secondary hover:text-primary transition-colors">
                    <i className="ph ph-user-circle text-xl"></i>
                </button>
            </div>
        </div>
    );
}
