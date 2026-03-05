import React from 'react';
import type { Folder } from '@/types';
import { DynamicQRTable } from '@/components/DynamicQRTable';
import { DynamicDetailPanel } from '@/components/DynamicDetailPanel';
import { AlertTriangleIcon } from '@/components/AlertTriangleIcon';
import { useDynamicQRCodes } from '@/hooks/useDynamicQRCodes';
import { useRecordFilter } from '@/hooks/useRecordFilter';

function DynamicEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="30" y="6" width="16" height="16" rx="2" />
      <rect x="33" y="9" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="6" y="30" width="16" height="16" rx="2" />
      <rect x="9" y="33" width="10" height="10" rx="1" fill="currentColor" fillOpacity="0.08" />
      <path d="M32 32h4m4 0h.01M32 36h.01M36 36h4M32 40h4m4 0h.01" strokeWidth="1.8" />
      <path d="M38 24c4 0 8 3 8 8" strokeDasharray="2 2" opacity="0.4" />
      <path d="M24 14c0 4-3 8-8 8" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
}

interface DynamicQRViewProps {
  readonly folders: Folder[];
}

export function DynamicQRView({ folders }: Readonly<DynamicQRViewProps>) {
  const { records, loading, error } = useDynamicQRCodes();

  const {
    searchQuery, folderFilter, allFolders,
    filtered, safeIndex, selectedRecord,
    setSelectedIndex, handleSearch, handleFolderChange,
  } = useRecordFilter(
    records,
    (r, q) => {
      const lq = q.toLowerCase();
      return r.label.toLowerCase().includes(lq) ||
             r.destinationUrl.toLowerCase().includes(lq) ||
             r.shortUrl.toLowerCase().includes(lq);
    },
    folders,
  );

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
    content = <div style={{ padding: '2rem', opacity: 0.5 }}>Loading…</div>;
  } else if (records.length === 0) {
    content = (
      <div className="empty-state">
        <div className="empty-state-icon">
          <DynamicEmptyIcon />
        </div>
        <p className="error-state-title">No dynamic QR codes yet</p>
        <p className="error-state-sub">
          Create your first dynamic QR code to track scans and update destinations without reprinting.
        </p>
        <button className="btn-new" disabled title="Create dynamic QR — coming soon">+ Create Dynamic Code</button>
      </div>
    );
  } else {
    content = (
      <>
        <DynamicQRTable
          records={filtered}
          selectedIndex={safeIndex}
          onSelect={setSelectedIndex}
        />
        <DynamicDetailPanel record={selectedRecord} />
      </>
    );
  }

  return (
    <main className="main-col">
      <div className="topbar">
        <div>
          <span className="topbar-title">Dynamic QR</span>
          <span className="topbar-sub">dynamic · {loading || error ? '—' : filtered.length} records</span>
        </div>
        <div className="topbar-right">
          <div className="vr" />
          <input
            className="tb-search"
            type="search"
            placeholder="Filter records…"
            value={searchQuery}
            onChange={handleSearch}
            disabled={loading || !!error}
          />
          <select
            className="tb-select"
            value={folderFilter}
            onChange={handleFolderChange}
            disabled={loading || !!error}
          >
            {allFolders.map(f => <option key={f}>{f}</option>)}
          </select>
          <button className="btn-new" disabled title="Create dynamic QR — coming soon">+ New Code</button>
        </div>
      </div>

      <div className="content">
        {content}
      </div>
    </main>
  );
}
