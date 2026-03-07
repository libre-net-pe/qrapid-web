import { useRef } from 'react';
import type { DynamicQRRecord } from '@/types';
import { QRDisplay } from '@/components/QRDisplay';
import { downloadSVG, downloadPNG } from '@/utils/downloadQR';

interface DynamicDetailPanelProps {
  readonly record: DynamicQRRecord | null;
}

function safeUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : '#';
}

export function DynamicDetailPanel({ record }: Readonly<DynamicDetailPanelProps>) {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!record) return null;

  return (
    <aside className="panel">
      <div className="p-head">
        <div className="p-eyebrow">Dynamic QR</div>
        <div className="p-title">{record.label}</div>
        <div className="p-head-meta">
          <span className={`badge badge-dyn-${record.status}`}>{record.status}</span>
          <span className="p-head-folder">{record.folder}</span>
        </div>
      </div>

      <div className="p-qr-zone">
        <QRDisplay ref={svgRef} value={record.shortUrl} size={156} />
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
        <button className="btn-dl" onClick={() => svgRef.current && downloadSVG(svgRef.current, record.label)}>
          SVG
        </button>
        <button className="btn-dl" onClick={() => svgRef.current && downloadPNG(svgRef.current, record.label)}>
          PNG
        </button>
        <a className="btn-dl btn-dl-link" href={safeUrl(record.downloadUrl)} target="_blank" rel="noreferrer">
          API
        </a>
      </div>
      <button className="btn-del">Delete record…</button>
    </aside>
  );
}
