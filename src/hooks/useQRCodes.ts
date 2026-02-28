import { useEffect, useState } from 'react';
import type { components } from '@libre-net-pe/qrapid-sdk';
import type { QRRecord, QRType } from '@/types';
import { useAuth } from '@/contexts/useAuth';
import { createQRapidClient } from '@/lib/qrapidClient';

type QrCode = components['schemas']['QrCode'];
type Folder = components['schemas']['Folder'];

function buildFolderMap(folders: Folder[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const folder of folders) {
    map.set(folder.id, folder.name);
  }
  return map;
}

function mapQrCode(qr: QrCode, folderMap: Map<string, string>): QRRecord {
  return {
    label: qr.label ?? qr.id,
    content: qr.content,
    type: (qr.type === 'url' ? 'URL' : 'Text') as QRType,
    folder: qr.folderId ? (folderMap.get(qr.folderId) ?? '—') : '—',
    date: qr.createdAt.slice(0, 10) as `${number}-${number}-${number}`,
    score: qr.scannability?.score ?? 0,
  };
}

async function loadRecords(token: string): Promise<QRRecord[]> {
  const api = createQRapidClient(token);
  const [codesRes, foldersRes] = await Promise.all([
    api.GET('/qr-codes', { params: { query: { limit: 100 } } }),
    api.GET('/folders', {}),
  ]);
  if (codesRes.error || foldersRes.error) {
    throw new Error('Failed to load QR codes or folders');
  }
  const folderMap = buildFolderMap(foldersRes.data?.data ?? []);
  const qrCodes: QrCode[] = codesRes.data?.data ?? [];
  return qrCodes.map((qr) => mapQrCode(qr, folderMap));
}

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
    const currentUser = user;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = await currentUser.getIdToken();
        const mapped = await loadRecords(token);
        if (!cancelled) setRecords(mapped);
      } catch (err) {
        console.error('Failed to fetch data:', err);
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
