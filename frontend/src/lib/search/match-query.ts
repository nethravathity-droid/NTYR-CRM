export function matchesQuery(haystack: string, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const normalized = haystack.toLowerCase();
  return terms.every((term) => normalized.includes(term));
}

export function highlightMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  const term = query.trim().toLowerCase();
  if (!term) return null;

  const lower = text.toLowerCase();
  const index = lower.indexOf(term);
  if (index === -1) return null;

  return {
    before: text.slice(0, index),
    match: text.slice(index, index + term.length),
    after: text.slice(index + term.length),
  };
}
