function svgToObjectUrl(svgEl: SVGSVGElement): string {
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  return URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml' }));
}

export function downloadSVG(svgEl: SVGSVGElement, filename: string): void {
  const url = svgToObjectUrl(svgEl);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPNG(svgEl: SVGSVGElement, filename: string, size = 512): void {
  const url = svgToObjectUrl(svgEl);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2d context from canvas.');
      URL.revokeObjectURL(url);
      return;
    }
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = `${filename}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}
