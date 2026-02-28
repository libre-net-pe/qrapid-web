import type { QRRecord } from '@/types';
import { makeQR } from '@/utils/makeQR';
import { getBadgeClass } from '@/utils/badges';
import { scoreClass } from '@/utils/score';

interface DetailPanelProps {
  record: QRRecord | null;
}

export function DetailPanel({ record }: DetailPanelProps) {
  if (!record) return null;

  const badgeClass = getBadgeClass(record.type);

  return (
    <aside className="panel">
      <div className="p-head">
        <div className="p-eyebrow">Selected code</div>
        <div className="p-title">{record.label}</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${badgeClass}`}>{record.type}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--t2)', opacity: 0.7 }}>
            {record.folder}
          </span>
        </div>
      </div>

      <div className="p-qr-zone">
        <div dangerouslySetInnerHTML={{ __html: makeQR(record.label) }} />
        <div className="p-qr-hint">Scan to verify · espresso on white</div>
      </div>

      <div className="p-body">
        <div className="p-field">
          <div className="p-lbl">Content</div>
          <div className="p-val">{record.content}</div>
        </div>

        <div className="p-grid">
          <div>
            <div className="p-lbl">Created</div>
            <div className="p-val plain">{record.date}</div>
          </div>
          <div>
            <div className="p-lbl">Type</div>
            <div style={{ marginTop: 2 }}>
              <span className={`badge ${badgeClass}`}>{record.type}</span>
            </div>
          </div>
        </div>

        <div className="p-field">
          <div className="p-lbl">Scannability</div>
          <div className="score-row">
            <div className="score-track">
              <div className="score-fill" style={{ width: `${record.score}%` }} />
            </div>
            <div className={`score-num ${scoreClass(record.score)}`}>{record.score}</div>
          </div>
        </div>
      </div>

      <div className="p-acts">
        <button className="btn-edit">Edit Label</button>
        <button className="btn-dl">Download</button>
      </div>
      <button className="btn-del">Delete record…</button>
    </aside>
  );
}
