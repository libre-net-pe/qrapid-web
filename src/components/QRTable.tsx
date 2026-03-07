import type { QRRecord } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { getBadgeClass } from '@/utils/badges';

interface QRTableProps {
  readonly records: QRRecord[];
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
}

export function QRTable({ records, selectedIndex, onSelect }: Readonly<QRTableProps>) {
  return (
    <div className="tbl-area">
      <div className="col-hdr">
        <div className="ch-cell" />
        <div className="ch-cell">Label</div>
        <div className="ch-cell">Content</div>
        <div className="ch-cell">Type</div>
        <div className="ch-cell">Folder</div>
        <div className="ch-cell">Created</div>
        <div />
      </div>
      <div className="tbl-rows">
        {records.map((r, i) => (
          <button
            key={r.label}
            type="button"
            className={`tr${i === selectedIndex ? ' sel' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onSelect(i)}
          >
            <QRCodeSVG value={r.content} size={24} fgColor="#1A0A05" bgColor="#FFFFFF" />
            <div className="tr-name">{r.label}</div>
            <div className="tr-mono">{r.content}</div>
            <div>
              <span className={`badge ${getBadgeClass(r.type)}`}>
                {r.type}
              </span>
            </div>
            <div className="tr-folder">{r.folder}</div>
            <div className="tr-date">{r.date}</div>
            <div className="tr-menu">&#x22EF;</div>
          </button>
        ))}
      </div>
    </div>
  );
}
