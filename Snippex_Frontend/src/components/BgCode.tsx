const CODE_SNIPPETS = [
  `const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};`,

  `async function retry(fn, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === maxRetries) throw e;
      await sleep(1000 * 2 ** i);
    }
  }
}`,

  `class TypedEmitter<T extends EventMap> {
  private listeners = new Map();
  on<K extends keyof T>(event: K, fn: (p: T[K]) => void) {
    this.listeners.set(event, fn);
    return () => this.off(event, fn);
  }
}`,

  `SELECT e.id, e.name, ot.depth + 1
FROM employees e
JOIN org_tree OT ON e.manager_id = ot.id
WHERE manager_id IS NULL
UNION ALL
SELECT e.id, e.name, ot.depth + 1
FROM employees e JOIN org_tree ot ON e.manager_id = ot.id;`,

  `def csv_to_dicts(filepath):
  with open(filepath) as f:
    reader = csv.DictReader(f)
    return [dict(row) for row in reader]`,

  `#!/bin/bash
for file in "$DIR"/*; do
  new=$(echo "$base" | tr "A-Z" "a-z")
  mv "$file" "$dir/$new"
done
echo "Feito"`,
];

// Repete os snippets para cobrir telas grandes
const FULL_TEXT = Array(6).fill(CODE_SNIPPETS.join("\n\n")).join("\n\n");

export function BgCode() {
  return (
    <div className="bg-code" aria-hidden="true">
      <pre className="bg-code__content">{FULL_TEXT}</pre>
    </div>
  );
}
