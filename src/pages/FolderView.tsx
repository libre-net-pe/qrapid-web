import React from 'react';
import { AlertTriangleIcon } from '@/components/AlertTriangleIcon';
import type { Folder } from '@/types';

function FolderEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20a4 4 0 014-4h10l4 4h18a4 4 0 014 4v14a4 4 0 01-4 4H10a4 4 0 01-4-4V20z" />
      <path d="M26 28v8M22 32h8" strokeWidth="1.8" opacity="0.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

interface FolderViewProps {
  readonly folders: Folder[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onNewFolder?: () => void;
}

export function FolderView({ folders, loading, error, onNewFolder }: Readonly<FolderViewProps>) {
  let content: React.ReactNode;

  if (error) {
    content = (
      <div className="error-state">
        <AlertTriangleIcon />
        <p className="error-state-title">{error}</p>
        <p className="error-state-sub">The request failed. Check your connection and try again.</p>
      </div>
    );
  } else if (loading) {
    content = <div className="loading-state">Loading…</div>;
  } else if (folders.length === 0) {
    content = (
      <div className="empty-state">
        <div className="empty-state-icon">
          <FolderEmptyIcon />
        </div>
        <p className="error-state-title">No folders yet</p>
        <p className="error-state-sub">Create a folder to organize your QR codes.</p>
        <button className="btn-new" onClick={onNewFolder}>+ New Folder</button>
      </div>
    );
  } else {
    content = (
      <div className="folder-grid">
        {folders.map(f => (
          <div key={f.id} className="folder-card">
            <div className="folder-card-icon">
              <FolderIcon />
            </div>
            <div className="folder-card-body">
              <div className="folder-card-name">{f.name}</div>
              {f.description && (
                <div className="folder-card-desc">{f.description}</div>
              )}
            </div>
            <span className="folder-card-count">
              {f.codeCount} {f.codeCount === 1 ? 'code' : 'codes'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="main-col">
      <div className="topbar">
        <div>
          <span className="topbar-title">Folders</span>
          <span className="topbar-sub">
            organize · {loading || error ? '—' : folders.length} folders
          </span>
        </div>
        <div className="topbar-right">
          <button className="btn-new" disabled={loading || !!error} onClick={onNewFolder}>+ New Folder</button>
        </div>
      </div>

      <div className="content">
        {content}
      </div>
    </main>
  );
}
