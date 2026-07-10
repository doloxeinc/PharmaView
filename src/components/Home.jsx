import { useState } from 'react';
import { ICONS } from '../data/icons.jsx';
import SavedSearches from './SavedSearches.jsx';
import PortfolioAnalytics from './PortfolioAnalytics.jsx';

export default function Home({
  onSelectModule,
  onSelectModuleView,
  onOpenBuilder,
  onShowAnalytics,
  savedSearches,
  setSavedSearches,
  showToast,
  modules: MODULES,
  navOrder,
  platforms: PLATFORMS,
  homeKpis,
  userProfile,
  homeSearchTags,
}) {
  const [activeSuite, setActiveSuiteState] = useState(null);
  const [showPortfolioAnalytics, setShowPortfolioAnalytics] = useState(false);

  const AURION_MODULE_ORDER = navOrder.flatMap((g) => g.items);

  const setActiveSuite = (key) => setActiveSuiteState((prev) => (prev === key ? null : key));

  const activePlatform = PLATFORMS.find((p) => p.key === activeSuite);

  return (
    <div className="home-wrap">
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-eyebrow">Good afternoon, {userProfile.name}</div>
          <h1>Ask Aurion</h1>
          <p>Ask a question or search across drugs, trials, companies, and pricing — or jump straight into a module below.</p>
          <div className="home-search">
            <ICONS.search />
            <input
              type="text"
              placeholder="Ask Aurion anything, or search drug names, sponsors, NCT-style IDs, companies…"
              onKeyDown={(e) => e.key === 'Enter' && showToast('Global search would run across all modules.')}
            />
            <span className="kbd">⌘K</span>
          </div>
          <div className="home-search-tags">
            {homeSearchTags.map((tag) => (
              <button className="home-search-tag" key={tag.label} onClick={() => onSelectModule(tag.moduleKey)}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="home-body">
        <div className="home-split">
          <div>
            <div className="home-section-head">
              <h2>Portfolio snapshot</h2>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onShowAnalytics();
                }}
              >
                Full dashboard →
              </a>
            </div>
            <div className="kpi-mini-grid">
              {homeKpis.map((kpi) => (
                <div className="home-kpi" key={kpi.label}>
                  <div className="home-kpi-label">{kpi.label}</div>
                  <div className="home-kpi-value">{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="home-section-head" style={{ marginTop: 20 }}>
              <h2>Portfolio Analytics</h2>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPortfolioAnalytics((v) => !v);
                }}
              >
                {showPortfolioAnalytics ? 'Hide Analytics →' : 'View Analytics →'}
              </a>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '-6px 0 0 0', lineHeight: 1.5 }}>
              6 charts covering pipeline growth, trial mix, pricing, and safety signals.
            </p>
          </div>

          <div>
            <div className="home-section-head">
              <h2>Explore the Aurion suite</h2>
            </div>
            <div className="module-grid suite-grid">
              {PLATFORMS.map((p) => {
                const isSelected = activeSuite === p.key;
                const isDimmed = activeSuite && !isSelected;
                const Icon = p.key === 'aurion' ? ICONS.drug : null;
                return (
                  <button
                    key={p.key}
                    className={`module-card ${isSelected ? 'selected-suite' : ''} ${isDimmed ? 'dimmed' : ''}`}
                    onClick={() => setActiveSuite(p.key)}
                  >
                    <div className="module-card-top">
                      <div className="module-card-icon">{Icon ? <Icon /> : p.label.slice(0, 1)}</div>
                      {p.key === 'aurion' && <span className="module-card-count">6 modules</span>}
                    </div>
                    <h3>{p.label}</h3>
                    <p>{p.sub}</p>
                    <span className="module-card-cta">
                      {isSelected ? 'Hide modules' : 'View modules'}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showPortfolioAnalytics && <PortfolioAnalytics />}

        {activeSuite && (
          <div>
            <div className="home-section-head">
              <h2>{activePlatform.label} modules</h2>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSuiteState(null);
                }}
              >
                Close ✕
              </a>
            </div>
            <div className="module-grid">
              {activePlatform.key === 'aurion' &&
                AURION_MODULE_ORDER.map((key) => {
                  const m = MODULES[key];
                  const Icon = ICONS[m.icon];
                  return (
                    <button className="module-card" key={key} onClick={() => onSelectModule(key)}>
                      <div className="module-card-top">
                        <div className="module-card-icon">
                          <Icon />
                        </div>
                        <span className="module-card-count">{m.count}</span>
                      </div>
                      <h3>{m.label}</h3>
                      <p>{m.desc}</p>
                      <span className="module-card-cta">
                        Open module
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </button>
                  );
                })}

              {activePlatform.key !== 'aurion' && (
                <div className="module-card" style={{ gridColumn: '1/-1' }}>
                  <div className="module-card-top">
                    <div className="module-card-icon">{activePlatform.label.slice(0, 1)}</div>
                  </div>
                  <h3>{activePlatform.hasSubmenu ? activePlatform.submenuItem : `${activePlatform.label} is on its way`}</h3>
                  <p>{activePlatform.sub} — join the waitlist to get notified when it&apos;s available.</p>
                  <span
                    className="module-card-cta"
                    style={{ cursor: 'pointer' }}
                    onClick={() => showToast(`You're on the list for ${activePlatform.label}.`)}
                  >
                    Notify me
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <SavedSearches
          items={savedSearches}
          setItems={setSavedSearches}
          onSelectModule={onSelectModule}
          onSelectModuleView={onSelectModuleView}
          onOpenBuilder={onOpenBuilder}
          showToast={showToast}
        />
      </div>
    </div>
  );
}
