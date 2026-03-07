import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Folder } from '@/types';

interface NavItemProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly label: string;
  readonly count?: number;
  readonly children: React.ReactNode;
}

function NavItem({ active, onClick, label, count, children }: Readonly<NavItemProps>) {
  return (
    <button type="button" className={`nav-item${active ? ' on' : ''}`} onClick={onClick}>
      {children}
      <span className={`nav-txt${active ? '' : ' dim'}`}>{label}</span>
      {count !== undefined && (
        <span className={`nav-count${active ? '' : ' dim'}`}>{count}</span>
      )}
    </button>
  );
}

interface SidebarProps {
  readonly folders: Folder[];
  readonly activeView: 'static' | 'dynamic' | 'folders' | 'assets';
  readonly staticCount?: number;
  readonly dynamicCount?: number;
}

export function Sidebar({ folders, activeView, staticCount, dynamicCount }: Readonly<SidebarProps>) {
  const { logout } = useAuth();
  const { profile } = useCurrentUser();
  const navigate = useNavigate();

  const displayName = profile?.displayName ?? '…';
  const email = profile?.email ?? '';
  const plan = profile?.plan ?? null;
  const initials = displayName === '…'
    ? '…'
    : displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

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
        <NavItem active={activeView === 'static'} onClick={() => navigate('/')} label="QR Codes" count={staticCount}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5"/><rect x="8" y="1" width="5" height="5"/><rect x="1" y="8" width="5" height="5"/>
            <path d="M8.5 8.5h.01M11 8.5h.01M8.5 11h.01M11 11h.01" strokeWidth="1.8"/>
          </svg>
        </NavItem>

        <NavItem active={activeView === 'dynamic'} onClick={() => navigate('/dynamic')} label="Dynamic QR" count={dynamicCount}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2v4h.4A6 6 0 0112.2 7.2m0 0H9.5m2.7 0 .5-1.5M12 12v-4h-.4A6 6 0 011.8 6.8m0 0H4.5m-2.7 0-.5 1.5"/>
          </svg>
        </NavItem>

        <NavItem active={activeView === 'folders'} onClick={() => navigate('/folders')} label="Folders" count={folders.length > 0 ? folders.length : undefined}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 4.5A1.5 1.5 0 012.5 3H5.5l1 1H12a1.5 1.5 0 011.5 1.5V11A1.5 1.5 0 0112 12.5H2A1.5 1.5 0 01.5 11V4.5z"/>
          </svg>
        </NavItem>

        {folders.length > 0 && (
          <div className="sb-folders">
            {folders.map(f => (
              <div key={f.id} className="sb-folder-item">
                <span className="sb-folder-name">{f.name}</span>
                <span className="sb-folder-count">{f.codeCount}</span>
              </div>
            ))}
          </div>
        )}

        <NavItem active={activeView === 'assets'} onClick={() => navigate('/assets')} label="Assets">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="12" height="12" rx="1.5"/>
            <circle cx="4.5" cy="4.5" r="1"/>
            <path d="M1 10l3.5-3.5 2.5 2.5 1.5-1.5L13 11"/>
          </svg>
        </NavItem>
      </nav>

      <div className="sb-user">
        <div className="ava"><span className="ava-txt">{initials}</span></div>
        <div>
          <div className="user-name">{displayName}</div>
          <div className="user-email">{email}</div>
          {plan && <span className="user-plan">{plan}</span>}
          <button className="user-action" onClick={logout}>Sign out</button>
        </div>
      </div>
    </aside>
  );
}
