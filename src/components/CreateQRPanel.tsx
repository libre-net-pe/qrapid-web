import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { createClient } from '@libre-net-pe/qrapid-sdk';
import { useAuth } from '@/contexts/useAuth';
import type { QRRecord, QRType } from '@/types';

interface Props {
  onClose: () => void;
  onCreated: (record: QRRecord) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(data: any, label: string, content: string, type: QRType): QRRecord {
  const today = new Date().toISOString().slice(0, 10) as QRRecord['date'];
  return {
    label: data?.label ?? label,
    content: data?.content ?? content,
    type: data?.type ?? type,
    folder: data?.folder ?? '—',
    date: data?.date ?? today,
    score: data?.score ?? 80,
  };
}

async function postQRCode(
  token: string,
  body: { label: string; content: string; type: QRType },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any; error: any }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (createClient({ token }) as any).POST('/qr-codes', { body });
}

export function CreateQRPanel({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<QRType>('URL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    labelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !content.trim() || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const { data, error: apiError } = await postQRCode(token, {
        label: label.trim(),
        content: content.trim(),
        type,
      });

      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : 'Failed to create QR code.');
        return;
      }

      onCreated(toRecord(data, label.trim(), content.trim(), type));
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="create-overlay" onClick={onClose} />
      <aside className="create-drawer" role="dialog" aria-modal="true" aria-label="Create QR Code">
        <div className="create-head">
          <div>
            <p className="create-eyebrow">New QR Code</p>
            <h2 className="create-title">Create</h2>
          </div>
          <button className="create-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="create-body" onSubmit={handleSubmit} noValidate>
          <div className="create-field">
            <label className="create-lbl" htmlFor="qr-label">Label</label>
            <input
              id="qr-label"
              ref={labelRef}
              className={`create-input${label === '' && error ? ' error' : ''}`}
              type="text"
              placeholder="e.g. Company Website"
              value={label}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
              required
            />
          </div>

          <div className="create-field">
            <label className="create-lbl" htmlFor="qr-type">Type</label>
            <div className="create-type-row">
              <button
                type="button"
                className={`create-type-btn${type === 'URL' ? ' active' : ''}`}
                onClick={() => setType('URL')}
              >
                URL
              </button>
              <button
                type="button"
                className={`create-type-btn${type === 'Text' ? ' active' : ''}`}
                onClick={() => setType('Text')}
              >
                Text
              </button>
            </div>
          </div>

          <div className="create-field">
            <label className="create-lbl" htmlFor="qr-content">
              {type === 'URL' ? 'URL' : 'Content'}
            </label>
            <input
              id="qr-content"
              className={`create-input${content === '' && error ? ' error' : ''}`}
              type={type === 'URL' ? 'url' : 'text'}
              placeholder={type === 'URL' ? 'https://example.com' : 'Enter text content…'}
              value={content}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
              required
            />
            {type === 'URL' && (
              <span className="create-hint">Must start with https://</span>
            )}
          </div>

          {error && <p className="create-err">{error}</p>}
        </form>

        <div className="create-footer">
          <button className="create-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-submit"
            type="submit"
            disabled={submitting || !label.trim() || !content.trim()}
            onClick={handleSubmit}
          >
            {submitting ? 'Creating…' : 'Create QR Code'}
          </button>
        </div>
      </aside>
    </>
  );
}
