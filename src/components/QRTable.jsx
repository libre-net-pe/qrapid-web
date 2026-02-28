import { makeQR } from '../utils/makeQR';

export function QRTable({ records, selectedIndex, onSelect }) {
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
          <div
            key={r.label}
            className={`tr${i === selectedIndex ? ' sel' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
            onClick={() => onSelect(i)}
          >
            <div
              dangerouslySetInnerHTML={{ __html: makeQR(r.label) }}
              style={{ lineHeight: 0 }}
            />
            <div className="tr-name">{r.label}</div>
            <div className="tr-mono">{r.content}</div>
            <div>
              <span className={`badge ${r.type === 'URL' ? 'badge-url' : 'badge-text'}`}>
                {r.type}
              </span>
            </div>
            <div className="tr-folder">{r.folder}</div>
            <div className="tr-date">{r.date}</div>
            <div className="tr-menu">&#x22EF;</div>
          </div>
        ))}
      </div>
    </div>
  );
}
