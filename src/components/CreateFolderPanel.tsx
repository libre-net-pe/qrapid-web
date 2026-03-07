import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { type components } from '@libre-net-pe/qrapid-sdk';
import { useAuth } from '@/contexts/useAuth';
import type { Folder } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';

interface Props {
  onClose: () => void;
  onCreated: (folder: Folder) => void;
}

type ApiFolder = components['schemas']['Folder'];

function mapFolder(f: ApiFolder): Folder {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    codeCount: f.codeCount,
  };
}

async function postFolder(
  token: string,
  body: { name: string; description?: string },
): Promise<{ data: ApiFolder | undefined; error: unknown }> {
  const client = createQRapidClient(token) as { POST: (path: string, opts: { body: unknown }) => Promise<{ data: ApiFolder | undefined; error: unknown }> };
  return client.POST('/folders', { body });
}

export function CreateFolderPanel({ onClose, onCreated }: Readonly<Props>) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.showModal();
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Handle native Escape key and backdrop close from showModal
    function onCancel(e: Event) {
      e.preventDefault();
      handleClose();
    }
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [handleClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const body: { name: string; description?: string } = { name: trimmedName };
      const trimmedDesc = description.trim();
      if (trimmedDesc) body.description = trimmedDesc;

      const { data, error: apiError } = await postFolder(token, body);

      if (apiError) {
        setError(typeof apiError === 'string' ? apiError : 'Failed to create folder.');
        return;
      }

      if (data) {
        onCreated(mapFolder(data));
      }
    } catch (err) {
      console.error('Folder creation failed:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="create-drawer" aria-label="Create Folder">
        <div className="create-head">
          <div>
            <p className="create-eyebrow">New Folder</p>
            <h2 className="create-title">Create</h2>
          </div>
          <button className="create-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <form className="create-body" onSubmit={handleSubmit} noValidate>
          <div className="create-fields">
            <div className="create-field">
              <label className="create-lbl" htmlFor="folder-name">Name</label>
              <input
                id="folder-name"
                ref={nameRef}
                className="create-input"
                type="text"
                placeholder="e.g. Marketing Campaign"
                value={name}
                maxLength={100}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
              <span className="create-hint">Must be unique. Max 100 characters.</span>
            </div>

            <div className="create-field">
              <label className="create-lbl" htmlFor="folder-description">Description <span className="create-lbl-optional">(optional)</span></label>
              <input
                id="folder-description"
                className="create-input"
                type="text"
                placeholder="e.g. All QR codes for the Q1 campaign"
                value={description}
                maxLength={255}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              />
              <span className="create-hint">Max 255 characters.</span>
            </div>

            {error && <p className="create-err">{error}</p>}
          </div>

          <div className="create-footer">
            <button className="create-cancel" type="button" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="create-submit"
              type="submit"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating…' : 'Create Folder'}
            </button>
          </div>
        </form>
    </dialog>
  );
}
