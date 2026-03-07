export function downloadSVG(svgEl: SVGSVGElement, filename: string): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPNG(svgEl: SVGSVGElement, filename: string, size = 512): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = `${filename}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}
