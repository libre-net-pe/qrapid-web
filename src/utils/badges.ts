import type { QRType } from '@/types';

export function getBadgeClass(type: QRType): string {
  return type === 'URL' ? 'badge-url' : 'badge-text';
}
