import { useEffect, useState } from 'react';
import type { components } from '@libre-net-pe/qrapid-sdk';
import type { DynamicQRRecord } from '@/types';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';

type DynamicQrCode = components['schemas']['DynamicQrCode'];

function mapDynamicQrCode(qr: DynamicQrCode): DynamicQRRecord {
  return {
    id: qr.id,
    label: qr.label ?? qr.slug,
    destinationUrl: qr.destinationUrl,
    shortUrl: qr.shortUrl,
    slug: qr.slug,
    status: qr.status,
    downloadUrl: qr.downloadUrl,
    scanCount: qr.scanCount,
    lastScannedAt: qr.lastScannedAt ?? null,
    expiresAt: qr.expiresAt ?? null,
    folder: qr.folder?.name ?? '—',
    date: qr.createdAt.slice(0, 10),
  };
}

async function loadDynamicRecords(token: string): Promise<DynamicQRRecord[]> {
  const api = createQRapidClient(token);
  const res = await api.GET('/dynamic-qr-codes', { params: { query: { limit: 100 } } });
  if (res.error) {
    throw new Error('Failed to load dynamic QR codes');
  }
  return (res.data?.data ?? []).map(mapDynamicQrCode);
}

export function useDynamicQRCodes() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DynamicQRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const currentUser = user;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = await currentUser.getIdToken();
        const mapped = await loadDynamicRecords(token);
        if (!cancelled) setRecords(mapped);
      } catch (err) {
        console.error('Failed to fetch dynamic QR codes:', err);
        if (!cancelled) setError('Failed to load dynamic QR codes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  return { records, loading, error };
}
