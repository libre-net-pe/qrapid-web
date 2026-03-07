import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  value: string;
  size: number;
  logoUrl?: string;
}

export const QRDisplay = forwardRef<SVGSVGElement, QRDisplayProps>(
  ({ value, size, logoUrl }, ref) => {
    const imageSettings = logoUrl
      ? { src: logoUrl, height: Math.round(size * 0.2), width: Math.round(size * 0.2), excavate: true }
      : undefined;

    return (
      <QRCodeSVG
        ref={ref}
        value={value || ' '}
        size={size}
        fgColor="#1A0A05"
        bgColor="#FFFFFF"
        imageSettings={imageSettings}
      />
    );
  }
);

QRDisplay.displayName = 'QRDisplay';
