import React, { useEffect, useRef, useState } from 'react';
import type { Logo } from '@/types';
import { AlertTriangleIcon } from '@/components/AlertTriangleIcon';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';
import type { components } from '@libre-net-pe/qrapid-sdk';

type LogoCreateRequest = components['schemas']['LogoCreateRequest'];

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] as const;

function AssetsEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="40" height="40" rx="3" fill="currentColor" fillOpacity="0.04" />
      <circle cx="18" cy="20" r="4" />
      <path d="M6 36l10-10 8 8 6-6 16 14" />
      <path d="M32 14h12M38 8v12" strokeWidth="1.8" />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function AssetsView() {
  const { user } = useAuth();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchLogos() {
      setLoading(true);
      setError(null);
      try {
        const token = await user!.getIdToken();
        const api = createQRapidClient(token);

        const { data: listData, error: listError } = await api.GET('/assets/logo');
        if (listError || !listData) {
          if (!cancelled) setError('Failed to load assets.');
          return;
        }

        const withUrls = await Promise.all(
          listData.data.map(async (summary) => {
            const { data: dl } = await api.GET('/assets/logo/{logoId}', {
              params: { path: { logoId: summary.logoId } },
            });
            return dl
              ? { logoId: summary.logoId, filename: summary.filename, createdAt: summary.createdAt, downloadUrl: dl.downloadUrl }
              : null;
          })
        );

        if (!cancelled) {
          setLogos(withUrls.filter((l): l is Logo => l !== null));
        }
      } catch {
        if (!cancelled) setError('Failed to load assets.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchLogos();
    return () => { cancelled = true; };
  }, [user]);

  async function handleUpload(file: File) {
    if (!user) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_LOGO_SIZE_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    if (!ALLOWED_CONTENT_TYPES.includes(file.type as typeof ALLOWED_CONTENT_TYPES[number])) {
      const allowedFriendlyTypes = ALLOWED_CONTENT_TYPES.map(type => type.replace('image/', '').replace('+xml', '').toUpperCase()).join(', ');
      setError(`Unsupported file type "${file.type}". Allowed types: ${allowedFriendlyTypes}.`);
      return;
    }

    const contentType = file.type as LogoCreateRequest['contentType'];
    setUploading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const api = createQRapidClient(token);

      // Step 1: Request pre-signed upload URL
      const { data: logoData, error: apiError } = await api.POST('/assets/logo', {
        body: { filename: file.name, contentType },
      });

      if (apiError || !logoData) {
        setError('Failed to initiate logo upload.');
        return;
      }

      // Step 2: Upload file directly to storage via pre-signed PUT URL
      const s3Res = await fetch(logoData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!s3Res.ok) {
        console.error('S3 upload failed:', await s3Res.text());
        setError('Failed to upload logo to storage.');
        return;
      }

      // Step 3: Fetch display URL
      const { data: downloadData, error: downloadError } = await api.GET('/assets/logo/{logoId}', {
        params: { path: { logoId: logoData.logoId } },
      });

      if (downloadError || !downloadData) {
        setError('Logo uploaded but failed to fetch preview.');
        return;
      }

      setLogos(prev => [{
        logoId: logoData.logoId,
        filename: logoData.filename,
        downloadUrl: downloadData.downloadUrl,
        createdAt: logoData.createdAt,
      }, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
      e.target.value = '';
    }
  }

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="empty-state">
        <p className="error-state-sub">Loading assets…</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="error-state">
        <AlertTriangleIcon />
        <p className="error-state-title">{error}</p>
        <p className="error-state-sub">The upload failed. Check your connection and try again.</p>
      </div>
    );
  } else if (logos.length === 0) {
    content = (
      <div className="empty-state">
        <div className="empty-state-icon">
          <AssetsEmptyIcon />
        </div>
        <p className="error-state-title">No assets yet</p>
        <p className="error-state-sub">Upload a logo to use as branding on your QR codes.</p>
        <button className="btn-new" onClick={() => fileInputRef.current?.click()}>
          + Upload Logo
        </button>
      </div>
    );
  } else {
    content = (
      <div className="assets-grid">
        {logos.map(logo => (
          <div key={logo.logoId} className="asset-card">
            <div className="asset-card-preview">
              <img src={logo.downloadUrl} alt={logo.filename} />
            </div>
            <div className="asset-card-info">
              <span className="asset-card-name">{logo.filename}</span>
              <span className="asset-card-date">{formatDate(logo.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="main-col">
      <div className="topbar">
        <div>
          <span className="topbar-title">Assets</span>
          <span className="topbar-sub">logos · {logos.length} uploaded</span>
        </div>
        <div className="topbar-right">
          <div className="vr" />
          <button
            className="btn-new"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '+ Upload Logo'}
          </button>
        </div>
      </div>

      <div className="content">
        {content}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </main>
  );
}
