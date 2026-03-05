import type { components } from '@libre-net-pe/qrapid-sdk';
import type { QRRecord, QRType } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';
import { useApiData } from './useApiData';

type QrCode = components['schemas']['QrCode'];

function mapQrCode(qr: QrCode): QRRecord {
  return {
    label: qr.label ?? qr.id,
    content: qr.content,
    type: (qr.type === 'url' ? 'URL' : 'Text') as QRType,
    folder: qr.folder?.name ?? '—',
    date: qr.createdAt.slice(0, 10) as `${number}-${number}-${number}`,
    score: qr.scannability?.score ?? 0,
  };
}

async function loadRecords(token: string): Promise<QRRecord[]> {
  const api = createQRapidClient(token);
  const res = await api.GET('/qr-codes', { params: { query: { limit: 100 } } });
  if (res.error) throw new Error('Failed to load QR codes');
  return (res.data?.data ?? []).map(mapQrCode);
}

export function useQRCodes() {
  const { data: records, loading, error } = useApiData(loadRecords, [] as QRRecord[]);
  return { records, loading, error };
}
