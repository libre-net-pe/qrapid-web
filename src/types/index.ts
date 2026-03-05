export type QRType = 'URL' | 'Text';

export interface QRRecord {
  label: string;
  content: string;
  type: QRType;
  folder: string;
  date: `${number}-${number}-${number}`;
  score: number;
}

export interface DynamicQRRecord {
  id: string;
  label: string;
  destinationUrl: string;
  shortUrl: string;
  slug: string;
  status: 'active' | 'expired';
  downloadUrl: string;
  scanCount: number;
  lastScannedAt: string | null;
  expiresAt: string | null;
  folder: string;
  date: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string | null;
  codeCount: number;
}
