import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { QRRecord, Folder } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { QRTable } from '@/components/QRTable';
import { DetailPanel } from '@/components/DetailPanel';
import { CreateQRPanel } from '@/components/CreateQRPanel';
import { AlertTriangleIcon } from '@/components/AlertTriangleIcon';
import { DynamicQRView } from '@/pages/DynamicQRView';
import { QREmptyIcon } from '@/components/QREmptyIcon';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useFolders } from '@/hooks/useFolders';
import { useRecordFilter } from '@/hooks/useRecordFilter';

function avgScore(records: QRRecord[]): number {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length);
}

function StaticQRContent({ folders }: Readonly<{ folders: Folder[] }>) {
  const { records: fetchedRecords, loading, error } = useQRCodes();
  const [additions, setAdditions] = useState<QRRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const records = useMemo(() => [...additions, ...fetchedRecords], [additions, fetchedRecords]);

  const {
    searchQuery, folderFilter, allFolders,
    filtered, safeIndex, selectedRecord,
    setSelectedIndex, handleSearch, handleFolderChange, reset,
  } = useRecordFilter(
    records,
    (r, q) => {
      const lq = q.toLowerCase();
      return r.label.toLowerCase().includes(lq) || r.content.toLowerCase().includes(lq);
    },
    folders,
  );

  function handleCreated(record: QRRecord) {
    setAdditions(prev => [record, ...prev]);
    reset();
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
      <div className="empty-state">
        <QREmptyIcon />
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
    <>
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
    </>
  );
}

export default function App() {
  const { folders } = useFolders();
  const location = useLocation();
  const isDynamic = location.pathname.startsWith('/dynamic');

  return (
    <div className="wrap">
      <Sidebar
        folders={folders}
        activeView={isDynamic ? 'dynamic' : 'static'}
      />
      {isDynamic
        ? <DynamicQRView folders={folders} />
        : <StaticQRContent folders={folders} />
      }
    </div>
  );
}
