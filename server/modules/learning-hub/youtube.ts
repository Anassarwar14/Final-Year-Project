export function extractYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s?#]+)/i,
    /(?:youtu\.be\/)([^&\s?#]+)/i,
    /(?:youtube\.com\/embed\/)([^&\s?#]+)/i,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}
