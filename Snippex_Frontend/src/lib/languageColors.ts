// Cores de linguagem baseadas no GitHub Linguist.
const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  'c#': '#178600',
  csharp: '#178600',
  'c++': '#f34b7d',
  cpp: '#f34b7d',
  c: '#555555',
  go: '#00ADD8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4F5D95',
  swift: '#F05138',
  kotlin: '#A97BFF',
  dart: '#00B4AB',
  html: '#e34c26',
  css: '#563d7c',
  scss: '#c6538c',
  shell: '#89e051',
  bash: '#89e051',
  sql: '#e38c00',
  json: '#cbcb41',
  yaml: '#cb171e',
  markdown: '#083fa1',
};

const DEFAULT_COLOR = '#8b949e';

export function getLanguageColor(language?: string | null): string {
  if (!language) return DEFAULT_COLOR;
  return LANGUAGE_COLORS[language.trim().toLowerCase()] ?? DEFAULT_COLOR;
}
