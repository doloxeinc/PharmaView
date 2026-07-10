const CATEGORY_ICONS = {
  disease: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 2h6M10 2v6.2L4.6 18a2 2 0 0 0 1.8 3h11.2a2 2 0 0 0 1.8-3L14 8.2V2" />
      <path d="M6.5 15h11" />
    </svg>
  ),
  country: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  trend: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19V10M11 19V5M18 19v-7" />
    </svg>
  ),
};

export default function Reports({ onOpenReportView, reportsCategories }) {
  return (
    <div className="reports-wrap">
      <div className="reports-head">
        <h1>Reports</h1>
        <p>
          Pick a disease, country, or industry trend to open a full data view — with the same search, filters,
          columns, export, and pagination as any Aurion module.
        </p>
      </div>

      <div className="reports-category-grid">
        {Object.entries(reportsCategories).map(([catKey, cat]) => {
          const Icon = CATEGORY_ICONS[catKey];
          return (
            <div className="reports-category-card" key={catKey}>
              <div className="reports-category-head">
                <div className="reports-category-icon">
                  <Icon />
                </div>
                <h3>{cat.label}</h3>
              </div>
              <p className="sub">{cat.desc}</p>
              <div className="reports-item-list">
                {cat.items.map((item) => (
                  <button key={item} className="reports-item-btn" onClick={() => onOpenReportView(catKey, item)}>
                    {item}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
