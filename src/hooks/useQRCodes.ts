import { useEffect, useState } from 'react';
import type { components } from '@libre-net-pe/qrapid-sdk';
import type { QRRecord, QRType } from '@/types';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';

type QrCode = components['schemas']['QrCode'];

export function useQRCodes() {
  const { user } = useAuth();
  const [records, setRecords] = useState<QRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = await user!.getIdToken();
        const api = createQRapidClient(token);

        const [codesRes, foldersRes] = await Promise.all([
          api.GET('/qr-codes', { params: { query: { limit: 100 } } }),
          api.GET('/folders', {}),
        ]);

        if (cancelled) return;

        if (codesRes.error) {
          setError('Failed to load QR codes');
          return;
        }

        const folderMap = new Map<string, string>();
        if (foldersRes.data) {
          for (const folder of foldersRes.data.data) {
            folderMap.set(folder.id, folder.name);
          }
        }

        const qrCodes: QrCode[] = codesRes.data?.data ?? [];
        const mapped: QRRecord[] = qrCodes.map((qr) => ({
          label: qr.label ?? qr.id,
          content: qr.content,
          type: (qr.type === 'url' ? 'URL' : 'Text') as QRType,
          folder: qr.folderId ? (folderMap.get(qr.folderId) ?? '—') : '—',
          date: qr.createdAt.slice(0, 10) as `${number}-${number}-${number}`,
          score: qr.scannability?.score ?? 0,
        }));

        setRecords(mapped);
      } catch {
        if (!cancelled) setError('Failed to load QR codes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  return { records, loading, error };
}
