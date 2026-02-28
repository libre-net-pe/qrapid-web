export function scoreClass(score: number): string {
  if (score >= 85) return 'score-good';
  if (score >= 70) return 'score-warn';
  return 'score-low';
}
