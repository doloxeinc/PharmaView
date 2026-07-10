# Veridian — Aurion (frontend prototype)

A React + Vite implementation of the Aurion UI mock-up: Aurion is the flagship
biopharma data intelligence product inside Veridian's wider product suite,
covering **Drugs, Clinical Trials, Companies, Drug Price, Cost of Therapy,**
and **International Reference Pricing**. It ships with a query builder,
per-module search-field catalog, filters, a configurable data table, tiered
export (quick / custom / AI-assisted Excel), an AI analyst side panel, a
cross-module Analytics dashboard, and a Home landing page.

The top navbar's **Products** mega-menu also surfaces Aurion's sibling
platforms (BIO 360, Clinovate, HEOR Via, MolecuLens, NextGen) as
placeholder/waitlist entries, matching how a multi-product suite would present
"what else is in this family" alongside the product you're actually using.

This is a **UI/UX prototype with mock data** — there is no backend. Every screen
is real, interactive React, but table contents, search results, and AI answers are
static/sample so the whole experience runs client-side with `npm run dev`.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  main.jsx                 # React entry point
  App.jsx                  # Top-level state + layout orchestration
  index.css                # All styling (design tokens as CSS variables, no CSS framework)

  data/
    modules.js              # MODULES: per-module label, icon key, result count, default
                             # filters, and view definitions (columns + sample rows)
    nav.js                  # NAV_ORDER: module grouping/order (used by the Products mega-menu + Home)
    platforms.js             # PLATFORMS: Aurion + its sibling product lines shown in the
                             # Products mega-menu and the Home page's "Explore the Aurion suite"
    fields.js                # FIELD_DEFS: the searchable-field catalog shown in the
                             # "Search fields" browser, grouped per module
    valueOptions.js          # VALUE_OPTIONS: known pick-list values per field name,
                             # powering the per-field value "intellisense" picker
    reportsCategories.jsx    # REPORTS_CATEGORIES: Disease/Country/Industry Trend items
                             # shown on the Reports landing page, each mapped to one
                             # of the `reports` module's views in modules.js
    savedSearches.js         # INITIAL_SAVED_SEARCHES seed data, lifted to App.jsx
                             # state so Home and the profile modal stay in sync
    icons.jsx               # Inline SVG icon components (no icon-font dependency)

  components/
    TopNav.jsx                # Sticky dark top navbar: Home / Products (mega-menu) /
                             # Industry Trends / Reports, plus Ask Analyst + avatar
    Home.jsx                  # Landing page: "Ask Aurion" hero search, module grid,
                             # sibling-platform grid, saved searches, portfolio KPIs
    Reports.jsx               # Reports landing page: Disease/Country/Industry Trend
                             # category panels; picking an item opens that category's
                             # view through the same module-page rendering path
    SearchBuilder.jsx        # The "molecule chain" query builder (field/op/value nodes
                             # joined by clickable AND/OR bonds)
    SearchFieldsModal.jsx    # Field browser — select fields, pick specific values per
                             # field via a searchable checklist / free-text tags / range
                             # picker, then confirm to add them all to the search builder
    SubTabs.jsx               # Sub-view tab strip (Basic / Regulatory / Forecast, etc.)
    FilterBar.jsx             # Removable filter chips + "Add filter"
    TableToolbar.jsx          # Results count, Columns dropdown, Export dropdown
    DataTable.jsx             # Paginated, per-column-filterable table for the active
                             # view (client-side, over a materialized sample dataset)
    Badge.jsx                 # Status-pill renderer (good / warn / bad / neutral)
    CustomExportModal.jsx     # Column picker + format + row-scope export dialog
    AIExportModal.jsx         # "Export to Excel with AI query" dialog
    AskAnalystModal.jsx       # Human-support question form (24-48h SLA), opened from
                             # the top navbar's "Ask Analyst" button
    UserProfileModal.jsx      # Profile: basic details, subscription, modules & API
                             # access table, saved-searches preview
    AIPanel.jsx               # AI Analyst side drawer (suggested prompts + free text)
    Analytics.jsx             # Cross-module KPI cards + charts view
    Modal.jsx                 # Generic overlay/dialog wrapper used by the export modals
                             # and the field browser
    Toast.jsx                 # Bottom-center transient notification

  hooks/
    useToast.js               # Minimal single-message toast manager

  utils/
    classify.js               # Badge tone classification + numeric-cell detection
    searchSummary.js          # Renders the query builder's conditions as one readable
                             # line for the post-"Run search" confirmation banner
```

## Navigation model

`App.jsx` holds a single `page` state: `'home' | 'module' | 'analytics' | 'reportsHome'`.

- **TopNav** is always visible (sticky, `position: sticky; top: 0`) and renders
  Home / Products / Industry Trends / Reports plus Ask Analyst and the avatar.
  The **Products** button opens a two-column mega-menu: column 1 lists every
  platform (`data/platforms.js`), column 2 previews whichever platform is
  selected — for **Aurion** that's the full module list (grouped, with a
  divider before the pricing modules); for the other platforms it's either a
  single stubbed sub-item (Clinovate → Gen AI Protocol, HEOR Via → Smart HTA
  Dossier, NextGen → BioPharmaKSM) or a generic "join the waitlist" panel.
- **Home** (`page === 'home'`) is the landing page.
- **Analytics** (`page === 'analytics'`) is the cross-module dashboard.
- **Reports** (`page === 'reportsHome'`) is a landing page with three category
  panels — Disease, Country, Industry Trend (`data/reportsCategories.jsx`).
  Picking an item within a category (e.g. "Oncology" under Disease) calls
  `openReportView(catKey, itemLabel)`, which sets `moduleKey = 'reports'`,
  `viewKey` to that category's view (`diseaseView`/`countryView`/`trendView`,
  defined in `data/modules.js` like any other module), and stores the
  selection in a `reportContext` state. From there it's rendered by the exact
  same "module page" branch as Drugs/Trials/Companies/etc. — same search
  builder, Search fields, Save search, filters, table with pagination/column
  filters, exports, and AI panel. A "← Back to Reports" link appears above the
  module heading whenever you're inside a report view, returning to the
  category grid.

  Rather than mutating the shared `MODULES.reports` object with the current
  selection (which wouldn't trigger a re-render), `App.jsx` derives an
  `activeModule` for rendering: when `reportContext` is set, it overlays
  `desc`/`filters` describing the selection (e.g. `filters: ['Disease:
  Oncology']`) on top of the base `MODULES.reports` entry, leaving the shared
  data untouched.
- **Module pages** (`page === 'module'`) render the shared module chrome
  (search bar, query builder, sub-view tabs, filters, table toolbar, data
  table, AI panel) driven by `moduleKey` / `viewKey`.

There is no sidebar and no separate status ribbon — navigation lives entirely
in the top bar, and the header background intentionally reuses the same dark
navy (`#0E1726`) that platform data-freshness indicators would typically use,
so it reads as a persistent "system chrome" bar rather than page content.

## Data model

Every module in `data/modules.js` follows the same shape:

```js
drugs: {
  label: 'Drugs',
  icon: 'drug',              // key into ICONS in data/icons.jsx
  count: '6,482',            // display-only "total matching records" figure
  desc: '...',
  filters: ['Molecule Type: Small molecule + mAb', 'Phase: III – Marketed', ...],
  views: {
    basic: {
      label: 'Basic',
      cols: ['Drug Name', 'Molecule Type', ...],
      rows: [
        ['Zomarlimab', 'Monoclonal antibody', ..., { badge: 'Marketed' }],
        ...
      ],
    },
    ...
  },
},
```

**Row cells** are either a plain string/number, or a small descriptor object so
`DataTable` can render a status pill without any HTML in the data:

```js
{ badge: 'Approved' }                    // renders a colored status pill
{ badge: 'High', suffix: ' 1.33×' }      // pill + trailing plain text (used in IRP)
```

**Search fields** in `data/fields.js` are grouped per module and typed so the
builder can pick a sensible default operator/value when a field is added:

```js
'Identity & Classification': [
  { n: 'Drug Name', t: 'txt' },     // txt   -> "contains"
  { n: 'Approval Date', t: 'date' } // date  -> "between"
  { n: 'Indication', t: 'enum' }    // enum  -> "="
  { n: 'Enrollment Size', t: 'num' } // num  -> "between"
],
```

**Platforms** in `data/platforms.js` describe the Products mega-menu entries:

```js
{
  key: 'clinovate',
  label: 'Clinovate',
  sub: 'Clinical innovation & protocol design',
  launching: true,
  hasSubmenu: true,          // shows a chevron in column 1
  submenuItem: 'Gen AI Protocol', // the single stub item shown in column 2
},
```

Only `aurion` is a real, functional platform; the rest are intentionally inert
placeholders (clicking them shows a "join the waitlist" toast).

## Table pagination and column filters

`DataTable` materializes a larger sample dataset (`MOCK_TOTAL_ROWS = 60`, by
cycling each view's authored rows) so pagination and per-column filtering have
something real to operate on, without pretending the whole (much larger) live
result set is loaded into the browser at once — only the current page's rows
are ever rendered into the DOM, which is the actual performance point of
pagination for a real backend integration.

- **Column filters**: a second header row of text inputs, one per visible
  column. Typing filters the materialized rows client-side (case-insensitive
  substring match, badge cells match on their label) and resets to page 1.
- **Pagination**: First/Prev/page-numbers (windowed ±2 around the current
  page)/Next/Last, plus a page-size selector (10/25/50). All state lives in
  `DataTable` itself and resets whenever the `resetKey` prop changes (App.jsx
  passes `` `${moduleKey}-${viewKey}` ``, so switching modules or sub-views
  starts fresh).
- The footer text distinguishes **"rows matching your column filters"** (a
  real, small, client-side count) from **"total matching records"** (the
  module's headline search-result count) — this is the difference between what's
  actually loaded/paginated in the grid vs. what a real backend query would
  say it matched overall.

When wiring to a real API: replace `getExpandedRows`/the in-memory filter with
server-side paging (send `page`, `pageSize`, and column filters as query
params) and drop the row-cycling entirely once real data is flowing.

## Ask Analyst vs. Ask AI

These are two intentionally different features:

- **Ask AI** (sparkle button in each module's search row) opens `AIPanel` —
  an instant, AI-generated answer scoped to the current module/view's results.
- **Ask Analyst** (top navbar) opens `AskAnalystModal` — a support-ticket form
  (optional related module + a question textarea) that submits to a **human**
  analyst team, with an explicit **24–48 hour** reply-time SLA shown in the
  modal. Submitting just toasts a confirmation in this prototype; wire
  `AskAnalystModal`'s `submit` handler to your support/ticketing API to make
  it real.

## User profile

Clicking the avatar (top-right) opens `UserProfileModal`: name/email/company,
subscription plan + start/renewal dates, a **Modules & API access** table
(`PROFILE_MODULE_ACCESS` in that component — each of the six Aurion modules
marked subscribed yes/no and API-access yes/no independently, since a module
can be licensed for UI use without API access or vice versa), and a read-only
preview of the same saved-search list shown on Home (top 5, with a "Manage →"
link that closes the modal and navigates to Home).

The saved-search list itself is lifted to `App.jsx` state (`savedSearches` /
`setSavedSearches`, seeded from `data/savedSearches.js`) specifically so this
profile preview and the full CRUD list in `SavedSearches.jsx` always agree —
editing or deleting a saved search from Home is immediately reflected here too.

When wiring to real auth: replace the hardcoded name/email/company/plan with
your session/user data, and drive `PROFILE_MODULE_ACCESS` from your
entitlements API instead of the static array.

## Search fields, value picker, and the confirm-search flow

Selecting a field in `SearchFieldsModal` doesn't just add it — it opens an
inline value picker scoped to that field, driven by its type (`data/fields.js`)
and, where one exists, a known pick-list (`data/valueOptions.js`):

- **enum/txt with a known list** (e.g. Drug Name, Indication, Trial Status) →
  a searchable, multi-select checklist.
- **enum/txt without one** (e.g. NCT ID, Principal Investigator) → free-text
  tag entry (type a value, press Enter, remove with the ✕).
- **num/date** (e.g. Enrollment Size, Approval Date) → a min/max range pair.

For the two value-list pickers (checklist and free-text tags), a **Match:
OR / AND / NOT** toggle controls how *that field's own* selected values
combine — independent of, and in addition to, the AND/OR/NOT joins between
different fields described below:

- **OR** (default) — matches any of the picked values → `op: 'in'`.
- **AND** — must include all of the picked values → `op: 'includes all of'`.
- **NOT** — excludes rows with any of the picked values → `op: 'excludes'`
  (or `≠` when only one value is picked).

This lives on each field's `entry.valueLogic` in `SearchFieldsModal`'s local
state and is read by `confirmSelection` when building the condition's
`op`/`value`. Range fields (num/date) don't get this toggle — a min/max pair
is already its own form of AND between two bounds.

Confirming turns each selected field into a condition, appended to the query
builder with a default join of **AND** against whatever's already there.

Each condition's join (between different fields) is a separate three-state
toggle — click the pill in the chain to cycle **AND → OR → NOT**. "NOT" reads
as "AND NOT" in the criteria summary (i.e. it excludes matches for that
condition rather than requiring them).

Clicking **Run search** doesn't just toast — it also renders a confirmation
banner ("Showing results for: …") built by `utils/searchSummary.js` from the
current conditions, so the person can see exactly what was searched before
trusting the (sample) results below. **Clear all** in the builder dismisses
that banner; reopening the builder to tweak conditions does not (the banner
only changes on the next Run).

## Wiring this up to a real backend

Everything that would hit an API is currently a `showToast(...)` call in `App.jsx`.
The natural integration points are:

- **Search / Build search / Run search** — `onRunSearch` in `SearchBuilder` should
  call your search API with the current `conditions` array and replace the active
  view's `rows` with the response.
- **Search fields** — `FIELD_DEFS` should eventually come from your schema/metadata
  service rather than being hand-authored, so new indexed fields show up automatically.
- **Filters** — `FilterBar` currently only removes chips locally; wire `onAddFilter`
  to a real filter-picker and re-run the search when chips change.
- **Quick / Custom / AI export** — `onQuickExport`, `onCustomExport` (via
  `CustomExportModal`'s `onExport`), and `onAIExport` (via `AIExportModal`'s
  `onExport`) currently just toast. Point these at an export/report-generation
  endpoint; `AIExportModal` already collects the natural-language query, format,
  row scope, and sheet name needed to build that request.
- **AI Analyst / Ask AI / Ask Aurion** — `AIPanel`'s `runQuery` currently sets
  a canned answer, and the Home hero search currently just toasts. Replace with
  a call to your LLM/analytics service, passing the question plus the active
  module/view/rows as context.
- **Ask Analyst** — `AskAnalystModal`'s `submit` handler currently just toasts
  a confirmation. Wire it to your support/ticketing system so real questions
  reach a real analyst queue.
- **Other platforms** — each non-Aurion entry in `data/platforms.js` currently
  resolves to a toast. Once those products exist, point them at real URLs/routes
  instead.
- **Pagination / column filters** — `DataTable` currently paginates and filters
  a materialized, cycled sample dataset (`MOCK_TOTAL_ROWS` rows) entirely
  client-side. Swap `getExpandedRows`/the local filter for server-side paging —
  send `page`, `pageSize`, and the column-filter values as query params, and
  render whatever page the server returns.

## Notes on scope

- Sample data covers 6 fictional drugs, 6 fictional companies, and matching
  trials/sites/pricing rows so every module tells one consistent story — swap in
  real data by following the same shape.
- Cost of Therapy and International Reference Pricing field lists in
  `data/fields.js` were extended to match the pattern of the other modules since
  they weren't explicitly specified; adjust freely.
- No CSS framework is used — all design tokens are CSS custom properties at the
  top of `index.css`, so retheming is a matter of editing that `:root` block.
