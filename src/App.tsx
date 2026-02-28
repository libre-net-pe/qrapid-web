import { useState, useMemo, type ChangeEvent } from 'react';
import type { QRRecord } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { QRTable } from '@/components/QRTable';
import { DetailPanel } from '@/components/DetailPanel';
import { useQRCodes } from '@/hooks/useQRCodes';

function avgScore(records: QRRecord[]): number {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length);
}

export default function App() {
  const { records, loading } = useQRCodes();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState('All folders');

  const ALL_FOLDERS = useMemo(() => ['All folders', ...new Set(records.map(r => r.folder).filter(f => f !== '—'))], [records]);

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

  return (
    <div className="wrap">
      <Sidebar />

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
              {ALL_FOLDERS.map(f => <option key={f}>{f}</option>)}
            </select>
            <button className="btn-new" onClick={() => alert('Create flow')}>+ New Code</button>
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div style={{ padding: '2rem', opacity: 0.5 }}>Loading…</div>
          ) : (
            <>
              <QRTable
                records={filtered}
                selectedIndex={safeIndex}
                onSelect={setSelectedIndex}
              />
              <DetailPanel record={selectedRecord} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
