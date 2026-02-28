import { useState, type ChangeEvent } from 'react';
import type { QRRecord } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { QRTable } from '@/components/QRTable';
import { DetailPanel } from '@/components/DetailPanel';
import { CreateQRPanel } from '@/components/CreateQRPanel';

const INITIAL_RECORDS: QRRecord[] = [
  { label: 'Company Website',   content: 'https://example.com',                type: 'URL',  folder: 'Marketing', date: '2026-02-15', score: 87 },
  { label: 'Event WiFi Info',   content: 'Network: ConfWifi_2025',             type: 'Text', folder: 'Events',    date: '2026-02-10', score: 92 },
  { label: 'Product Catalogue', content: 'https://shop.example.com/catalogue', type: 'URL',  folder: 'Retail',    date: '2026-01-28', score: 79 },
  { label: 'Business Card',     content: 'https://jorge.me/contact',           type: 'URL',  folder: 'Personal',  date: '2026-01-05', score: 95 },
  { label: 'Restaurant Menu',   content: 'https://bistro.local/menu',          type: 'URL',  folder: '—',         date: '2025-12-20', score: 68 },
];

function avgScore(records: QRRecord[]): number {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length);
}

export default function App() {
  const [records, setRecords] = useState<QRRecord[]>(INITIAL_RECORDS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState('All folders');
  const [showCreate, setShowCreate] = useState(false);

  const allFolders = ['All folders', ...new Set(records.map(r => r.folder).filter(f => f !== '—'))];

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

  function handleCreated(record: QRRecord) {
    setRecords(prev => [record, ...prev]);
    setSearchQuery('');
    setFolderFilter('All folders');
    setSelectedIndex(0);
    setShowCreate(false);
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
              {allFolders.map(f => <option key={f}>{f}</option>)}
            </select>
            <button className="btn-new" onClick={() => setShowCreate(true)}>+ New Code</button>
          </div>
        </div>

        <div className="content">
          <QRTable
            records={filtered}
            selectedIndex={safeIndex}
            onSelect={setSelectedIndex}
          />
          <DetailPanel record={selectedRecord} />
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
