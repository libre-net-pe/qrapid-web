import type { DynamicQRRecord } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { QR_FG_COLOR, QR_BG_COLOR } from '@/constants/qr';

interface DynamicQRTableProps {
  readonly records: DynamicQRRecord[];
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
}

export function DynamicQRTable({ records, selectedIndex, onSelect }: Readonly<DynamicQRTableProps>) {
  return (
    <div className="tbl-area">
      <div className="col-hdr dyn-col-hdr">
        <div className="ch-cell" />
        <div className="ch-cell">Label</div>
        <div className="ch-cell">Destination</div>
        <div className="ch-cell">Status</div>
        <div className="ch-cell">Folder</div>
        <div className="ch-cell">Scans</div>
        <div className="ch-cell">Created</div>
        <div />
      </div>
      <div className="tbl-rows">
        {records.map((r, i) => (
          <button
            key={r.id}
            className={`tr dyn-tr${i === selectedIndex ? ' sel' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onSelect(i)}
            type="button"
          >
            <QRCodeSVG value={r.shortUrl} size={24} fgColor={QR_FG_COLOR} bgColor={QR_BG_COLOR} />
            <div className="tr-name">{r.label}</div>
            <div className="tr-mono">{r.destinationUrl}</div>
            <div>
              <span className={`badge badge-dyn-${r.status}`}>{r.status}</span>
            </div>
            <div className="tr-folder">{r.folder}</div>
            <div className="tr-scans">{r.scanCount.toLocaleString()}</div>
            <div className="tr-date">{r.date}</div>
            <div className="tr-menu">&#x22EF;</div>
          </button>
        ))}
      </div>
    </div>
  );
}
