export function QREmptyIcon({ size = 48 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="3" height="3" rx="0.5"/>
      <line x1="18" y1="14" x2="21" y2="14"/>
      <line x1="21" y1="14" x2="21" y2="17"/>
      <line x1="18" y1="21" x2="21" y2="21"/>
    </svg>
  );
}
