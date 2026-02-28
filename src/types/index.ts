export type QRType = 'URL' | 'Text';

export interface QRRecord {
  label: string;
  content: string;
  type: QRType;
  folder: string;
  date: string;
  score: number;
}
