// Tempo relativo curto em pt-BR (ex.: "há 2h", "há 3d").
export function timeAgo(input?: string | Date | null): string {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  const ms = Date.now() - date.getTime();
  if (Number.isNaN(ms)) return '';

  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months}mês${months > 1 ? 'es' : ''}`;
  const years = Math.floor(months / 12);
  return `há ${years}a`;
}
