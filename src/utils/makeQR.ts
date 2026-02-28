/**
 * Generates a deterministic QR-pattern SVG string.
 * Visual approximation for display purposes, not a spec-compliant QR code.
 *
 * @param {string} seed - The string to hash into a pattern
 * @param {string} fg   - Foreground color (default: espresso #1A0A05)
 * @param {string} bg   - Background color (default: white #FFFFFF)
 * @returns {string}    - SVG markup string
 */
// eslint-disable-next-line complexity
export function makeQR(seed: string, fg = '#1A0A05', bg = '#FFFFFF'): string {
  const S = 21; let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  let d = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
  [[0,0],[S-7,0],[0,S-7]].forEach(([y,x]) => {
    d += `<rect x="${x}" y="${y}" width="7" height="7" fill="${fg}"/>`;
    d += `<rect x="${x+1}" y="${y+1}" width="5" height="5" fill="${bg}"/>`;
    d += `<rect x="${x+2}" y="${y+2}" width="3" height="3" fill="${fg}"/>`;
  });
  for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
    if ((r<7&&c<7)||(r<7&&c>=S-7)||(r>=S-7&&c<7)) continue;
    if (r===6||c===6) {
      if ((r+c)%2===0) d += `<rect x="${c}" y="${r}" width="1" height="1" fill="${fg}"/>`; // eslint-disable-line max-depth
      continue;
    }
    h ^= h<<13; h ^= h>>7; h ^= h<<17;
    if (h&1) d += `<rect x="${c}" y="${r}" width="1" height="1" fill="${fg}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges">${d}</svg>`;
}
