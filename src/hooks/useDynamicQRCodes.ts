import type { components } from '@libre-net-pe/qrapid-sdk';
import type { DynamicQRRecord } from '@/types';
import { createQRapidClient } from '@/lib/qrapidClient';
import { useApiData } from './useApiData';

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
  if (res.error) throw new Error('Failed to load dynamic QR codes');
  return (res.data?.data ?? []).map(mapDynamicQrCode);
}

export function useDynamicQRCodes() {
  const { data: records, loading, error } = useApiData(loadDynamicRecords, [] as DynamicQRRecord[]);
  return { records, loading, error };
}
