import Modal from './Modal.jsx';
import Badge from './Badge.jsx';

export default function UserProfileModal({
  open,
  onClose,
  savedSearches,
  onManageSavedSearches,
  showToast,
  modules: MODULES,
  profileModuleAccess: PROFILE_MODULE_ACCESS,
  userProfile,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="profile-avatar-lg">{userProfile.initials}</span>
          <span>
            <span style={{ display: 'block', fontSize: 18, fontWeight: 700 }}>{userProfile.name}</span>
          </span>
        </span>
      }
      subtitle={`${userProfile.email} · ${userProfile.company}`}
      footer={
        <>
          <button className="btn" onClick={() => showToast('Sign-out would happen here.')}>
            Sign out
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="profile-section">
        <div className="profile-section-head">
          <h3>Subscription</h3>
          <Badge value={userProfile.subscription.status} />
        </div>
        <div className="profile-detail-grid">
          <div>
            <span className="label">Plan</span>
            <span className="value">{userProfile.subscription.plan}</span>
          </div>
          <div>
            <span className="label">Start date</span>
            <span className="value">{userProfile.subscription.startDate}</span>
          </div>
          <div>
            <span className="label">Renewal date</span>
            <span className="value">{userProfile.subscription.renewalDate}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Modules &amp; API access</h3>
        <table className="profile-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Subscribed</th>
              <th>API access</th>
            </tr>
          </thead>
          <tbody>
            {PROFILE_MODULE_ACCESS.map((m) => (
              <tr key={m.key}>
                <td className="cell-strong">{MODULES[m.key].label}</td>
                <td>
                  <Badge value={m.subscribed ? 'Yes' : 'No'} />
                </td>
                <td>
                  <Badge value={m.api ? 'Yes' : 'No'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="profile-section">
        <div className="profile-section-head">
          <h3>Saved searches</h3>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              onManageSavedSearches();
            }}
          >
            Manage →
          </a>
        </div>
        {savedSearches.length === 0 ? (
          <div className="profile-empty">No saved searches yet.</div>
        ) : (
          savedSearches.slice(0, 5).map((s) => (
            <div className="profile-saved-row" key={s.id}>
              <span className="title">{s.title}</span>
              <span className="date">Saved {s.savedOn}</span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
