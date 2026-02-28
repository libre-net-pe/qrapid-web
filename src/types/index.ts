export type QRType = 'URL' | 'Text';

export interface QRRecord {
  label: string;
  content: string;
  type: QRType;
  folder: string;
  date: `${number}-${number}-${number}`;
  score: number;
}
