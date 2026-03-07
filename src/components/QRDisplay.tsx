import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QR_FG_COLOR, QR_BG_COLOR } from '@/constants/qr';

const LOGO_SIZE_RATIO = 0.2;

interface QRDisplayProps {
  value: string;
  size: number;
  logoUrl?: string;
}

export const QRDisplay = forwardRef<SVGSVGElement, QRDisplayProps>(
  ({ value, size, logoUrl }, ref) => {
    const imageSettings = logoUrl
      ? { src: logoUrl, height: Math.round(size * LOGO_SIZE_RATIO), width: Math.round(size * LOGO_SIZE_RATIO), excavate: true }
      : undefined;

    return (
      <QRCodeSVG
        ref={ref}
        value={value || ' '}
        size={size}
        fgColor={QR_FG_COLOR}
        bgColor={QR_BG_COLOR}
        imageSettings={imageSettings}
      />
    );
  }
);

QRDisplay.displayName = 'QRDisplay';
