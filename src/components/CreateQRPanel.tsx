import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { type components } from '@libre-net-pe/qrapid-sdk';
import { useAuth } from '@/contexts/useAuth';
import type { QRRecord, QRType } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';

interface Props {
  onClose: () => void;
  onCreated: (record: QRRecord) => void;
}

type ApiQRCode = components['schemas']['QrCode'];

function toRecord(data: ApiQRCode | null, label: string, content: string, type: QRType): QRRecord {
  const today = new Date().toISOString().slice(0, 10) as QRRecord['date'];
  return {
    label: data?.label ?? label,
    content: data?.content ?? content,
    type: (data?.type === 'url' ? 'URL' : data?.type === 'text' ? 'Text' : type),
    folder: data?.folder?.name ?? '—',
    date: (data?.createdAt?.slice(0, 10) as QRRecord['date'] | undefined) ?? today,
    score: data?.scannability?.score ?? 80,
  };
}

async function postQRCode(
  token: string,
  body: { label: string; content: string; type: QRType },
): Promise<{ data: ApiQRCode | undefined; error: unknown }> {
  // The SDK dist does not bundle schema types; cast is required to call POST.
  const client = createQRapidClient(token) as { POST: (path: string, opts: { body: unknown }) => Promise<{ data: ApiQRCode | undefined; error: unknown }> };
  return client.POST('/qr-codes', { body });
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
    const trimmedLabel = label.trim();
    const trimmedContent = content.trim();
    if (!trimmedLabel || !trimmedContent || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const { data, error: apiError } = await postQRCode(token, {
        label: trimmedLabel,
        content: trimmedContent,
        type,
      });

      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : 'Failed to create QR code.');
        return;
      }

      onCreated(toRecord(data ?? null, trimmedLabel, trimmedContent, type));
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
          <div className="create-fields">
          <div className="create-field">
            <label className="create-lbl" htmlFor="qr-label">Label</label>
            <input
              id="qr-label"
              ref={labelRef}
              className="create-input"
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
              className="create-input"
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
          </div>

          <div className="create-footer">
            <button className="create-cancel" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="create-submit"
              type="submit"
              disabled={submitting || !label.trim() || !content.trim()}
            >
              {submitting ? 'Creating…' : 'Create QR Code'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
