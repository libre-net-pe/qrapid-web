export function Sidebar() {
  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-brandname">QR<em>apid</em></div>
        <div className="sb-tagline">QR Code Manager</div>
      </div>

      <div className="sb-rule" />

      <div className="sb-stats">
        <div className="sb-stat">
          <div className="sb-stat-n">8</div>
          <div className="sb-stat-l">Codes</div>
        </div>
        <div className="sb-stat">
          <div className="sb-stat-n accent">142</div>
          <div className="sb-stat-l">Scans</div>
        </div>
      </div>

      <div className="sb-rule2" />

      <nav className="sb-nav">
        <div className="nav-item on">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C45B30" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5"/><rect x="8" y="1" width="5" height="5"/><rect x="1" y="8" width="5" height="5"/>
            <path d="M8.5 8.5h.01M11 8.5h.01M8.5 11h.01M11 11h.01" strokeWidth="1.8"/>
          </svg>
          <span className="nav-txt">QR Codes</span>
          <span className="nav-count">5</span>
        </div>
        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(90,45,20,0.35)" strokeWidth="1.5">
            <path d="M2 2v4h.4A6 6 0 0112.2 7.2m0 0H9.5m2.7 0 .5-1.5M12 12v-4h-.4A6 6 0 011.8 6.8m0 0H4.5m-2.7 0-.5 1.5"/>
          </svg>
          <span className="nav-txt dim">Dynamic QR</span>
          <span className="nav-count dim">3</span>
        </div>
        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(90,45,20,0.35)" strokeWidth="1.5">
            <path d="M1 4.5A1.5 1.5 0 012.5 3H5.5l1 1H12a1.5 1.5 0 011.5 1.5V11A1.5 1.5 0 0112 12.5H2A1.5 1.5 0 01.5 11V4.5z"/>
          </svg>
          <span className="nav-txt dim">Folders</span>
        </div>
        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(90,45,20,0.35)" strokeWidth="1.5">
            <rect x="1" y="1" width="12" height="12" rx="1.5"/>
            <circle cx="4.5" cy="4.5" r="1"/>
            <path d="M1 10l3.5-3.5 2.5 2.5 1.5-1.5L13 11"/>
          </svg>
          <span className="nav-txt dim">Assets</span>
        </div>
      </nav>

      <div className="sb-user">
        <div className="ava"><span className="ava-txt">JD</span></div>
        <div>
          <div className="user-name">Jorge D.</div>
          <div className="user-action">Sign out</div>
        </div>
      </div>
    </aside>
  );
}
