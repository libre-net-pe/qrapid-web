import type { DynamicQRRecord } from '@/types';
import { makeQR } from '@/utils/makeQR';

interface DynamicDetailPanelProps {
  record: DynamicQRRecord | null;
}

export function DynamicDetailPanel({ record }: DynamicDetailPanelProps) {
  if (!record) return null;

  return (
    <aside className="panel">
      <div className="p-head">
        <div className="p-eyebrow">Dynamic QR</div>
        <div className="p-title">{record.label}</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge badge-dyn-${record.status}`}>{record.status}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--t2)', opacity: 0.7 }}>
            {record.folder}
          </span>
        </div>
      </div>

      <div className="p-qr-zone">
        <div dangerouslySetInnerHTML={{ __html: makeQR(record.shortUrl) }} />
        <div className="p-qr-hint">Encodes short URL · redirects to destination</div>
      </div>

      <div className="p-body">
        <div className="p-field">
          <div className="p-lbl">Destination URL</div>
          <div className="p-val">{record.destinationUrl}</div>
        </div>

        <div className="p-field">
          <div className="p-lbl">Short URL</div>
          <div className="p-val">{record.shortUrl}</div>
        </div>

        <div className="p-grid">
          <div>
            <div className="p-lbl">Scans</div>
            <div className="p-val plain dyn-scan-count">{record.scanCount.toLocaleString()}</div>
          </div>
          <div>
            <div className="p-lbl">Created</div>
            <div className="p-val plain">{record.date}</div>
          </div>
        </div>

        {record.lastScannedAt && (
          <div className="p-field">
            <div className="p-lbl">Last Scanned</div>
            <div className="p-val plain">{record.lastScannedAt.slice(0, 10)}</div>
          </div>
        )}

        {record.expiresAt && (
          <div className="p-field">
            <div className="p-lbl">Expires</div>
            <div className="p-val plain">{record.expiresAt.slice(0, 10)}</div>
          </div>
        )}
      </div>

      <div className="p-acts">
        <button className="btn-edit">Edit Destination</button>
        <a className="btn-dl" href={record.downloadUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Download
        </a>
      </div>
      <button className="btn-del">Delete record…</button>
    </aside>
  );
}
