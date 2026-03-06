import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { type components } from '@libre-net-pe/qrapid-sdk';
import { useAuth } from '@/contexts/useAuth';
import type { DynamicQRRecord } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';

interface Props {
  onClose: () => void;
  onCreated: (record: DynamicQRRecord) => void;
}

type ApiDynamicQrCode = components['schemas']['DynamicQrCode'];

function toRecord(data: ApiDynamicQrCode | null, label: string, destinationUrl: string): DynamicQRRecord {
  const today = new Date().toISOString().slice(0, 10) as DynamicQRRecord['date'];
  if (!data) {
    return {
      id: crypto.randomUUID(),
      label,
      destinationUrl,
      shortUrl: '',
      slug: '',
      status: 'active',
      downloadUrl: '',
      scanCount: 0,
      lastScannedAt: null,
      expiresAt: null,
      folder: '—',
      date: today,
    };
  }
  return {
    id: data.id,
    label: data.label ?? data.slug,
    destinationUrl: data.destinationUrl,
    shortUrl: data.shortUrl,
    slug: data.slug,
    status: data.status,
    downloadUrl: data.downloadUrl,
    scanCount: data.scanCount,
    lastScannedAt: data.lastScannedAt ?? null,
    expiresAt: data.expiresAt ?? null,
    folder: data.folder?.name ?? '—',
    date: data.createdAt.slice(0, 10) as DynamicQRRecord['date'],
  };
}

async function postDynamicQRCode(
  token: string,
  body: { label: string; destinationUrl: string },
): Promise<{ data: ApiDynamicQrCode | undefined; error: unknown }> {
  const client = createQRapidClient(token) as { POST: (path: string, opts: { body: unknown }) => Promise<{ data: ApiDynamicQrCode | undefined; error: unknown }> };
  return client.POST('/dynamic-qr-codes', { body });
}

export function CreateDynamicQRPanel({ onClose, onCreated }: Readonly<Props>) {
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
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
    const trimmedUrl = destinationUrl.trim();
    if (!trimmedLabel || !trimmedUrl || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const { data, error: apiError } = await postDynamicQRCode(token, {
        label: trimmedLabel,
        destinationUrl: trimmedUrl,
      });

      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : 'Failed to create dynamic QR code.');
        return;
      }

      onCreated(toRecord(data ?? null, trimmedLabel, trimmedUrl));
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="create-overlay"
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog className="create-drawer" aria-label="Create Dynamic QR Code" open>
        <div className="create-head">
          <div>
            <p className="create-eyebrow">New Dynamic QR Code</p>
            <h2 className="create-title">Create</h2>
          </div>
          <button className="create-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="create-body" onSubmit={handleSubmit} noValidate>
          <div className="create-fields">
            <div className="create-field">
              <label className="create-lbl" htmlFor="dqr-label">Label</label>
              <input
                id="dqr-label"
                ref={labelRef}
                className="create-input"
                type="text"
                placeholder="e.g. Campaign Landing Page"
                value={label}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
                required
              />
            </div>

            <div className="create-field">
              <label className="create-lbl" htmlFor="dqr-url">Destination URL</label>
              <input
                id="dqr-url"
                className="create-input"
                type="url"
                placeholder="https://example.com"
                value={destinationUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDestinationUrl(e.target.value)}
                required
              />
              <span className="create-hint">Must start with https://</span>
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
              disabled={submitting || !label.trim() || !destinationUrl.trim()}
            >
              {submitting ? 'Creating…' : 'Create Dynamic QR'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
