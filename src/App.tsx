import React, { useState, useMemo, useCallback, type ChangeEvent } from 'react';
import type { QRRecord } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { QRTable } from '@/components/QRTable';
import { DetailPanel } from '@/components/DetailPanel';
import { CreateQRPanel } from '@/components/CreateQRPanel';
import { AlertTriangleIcon } from '@/components/AlertTriangleIcon';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useFolders } from '@/hooks/useFolders';

function avgScore(records: QRRecord[]): number {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length);
}

export default function App() {
  const { records: fetchedRecords, loading, error } = useQRCodes();
  const { folders } = useFolders();
  const [additions, setAdditions] = useState<QRRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState('All folders');
  const [showCreate, setShowCreate] = useState(false);

  const records = useMemo(() => [...additions, ...fetchedRecords], [additions, fetchedRecords]);

  const allFolders = useMemo(
    () => ['All folders', ...folders.map(f => f.name)],
    [folders],
  );

  const filtered = records.filter(r => {
    const matchSearch = r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFolder = folderFilter === 'All folders' || r.folder === folderFilter;
    return matchSearch && matchFolder;
  });

  const safeIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));
  const selectedRecord = filtered[safeIndex] ?? null;

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
  }

  function handleFolderChange(e: ChangeEvent<HTMLSelectElement>) {
    setFolderFilter(e.target.value);
    setSelectedIndex(0);
  }

  const handleSidebarFolderChange = useCallback((folderName: string) => {
    setFolderFilter(folderName);
    setSelectedIndex(0);
  }, []);

  function handleCreated(record: QRRecord) {
    setAdditions(prev => [record, ...prev]);
    setSearchQuery('');
    setFolderFilter('All folders');
    setSelectedIndex(0);
    setShowCreate(false);
  }

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
  } else if (filtered.length === 0) {
    content = (
      <div className="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="3" height="3" rx="0.5"/>
          <line x1="18" y1="14" x2="21" y2="14"/>
          <line x1="21" y1="14" x2="21" y2="17"/>
          <line x1="18" y1="21" x2="21" y2="21"/>
        </svg>
        <p className="error-state-title">No QR codes found</p>
        <p className="error-state-sub">Create your first code using the + New Code button.</p>
      </div>
    );
  } else {
    content = (
      <>
        <QRTable
          records={filtered}
          selectedIndex={safeIndex}
          onSelect={setSelectedIndex}
        />
        <DetailPanel record={selectedRecord} />
      </>
    );
  }

  return (
    <div className="wrap">
      <Sidebar
        folders={folders}
        folderFilter={folderFilter}
        onFolderChange={handleSidebarFolderChange}
      />

      <main className="main-col">
        <div className="topbar">
          <div>
            <span className="topbar-title">QR Codes</span>
            <span className="topbar-sub">static · {filtered.length} records</span>
          </div>
          <div className="topbar-right">
            <div className="avg-chip">
              {avgScore(filtered)} <span>avg score</span>
            </div>
            <div className="vr" />
            <input
              className="tb-search"
              type="search"
              placeholder="Filter records…"
              value={searchQuery}
              onChange={handleSearch}
            />
            <select
              className="tb-select"
              value={folderFilter}
              onChange={handleFolderChange}
            >
              {allFolders.map(f => <option key={f}>{f}</option>)}
            </select>
            <button className="btn-new" onClick={() => setShowCreate(true)}>+ New Code</button>
          </div>
        </div>

        <div className="content">
          {content}
        </div>
      </main>

      {showCreate && (
        <CreateQRPanel
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
