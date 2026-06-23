import React from 'react';
import { Check, Copy } from 'lucide-react';

/* ============================================================================
   Shared documentation primitives for the live Design System reference.
   Used by DesignSystemPage and the composed-pattern gallery sections.

   Layout per component (Polaris-style):
     name + source path  →  live demo  →  code snippet  →  props table
   ============================================================================ */

/** A titled, anchored section of the doc. */
export function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-1">{title}</h2>
      {intro && <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-2xl">{intro}</p>}
      {children}
    </section>
  );
}

/** One documented prop: name, type, whether required, default, and description. */
export interface PropRow {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  desc: string;
}

/* ----------------------------------------------------------------------------
   Tiny dependency-free TSX highlighter. Themed with the data-color tokens so
   the palette tracks the design system. Order matters: comments and strings
   are matched first so keywords inside them aren't re-coloured.
   ---------------------------------------------------------------------------- */
const SYNTAX_COLORS: Record<string, string> = {
  comment: 'var(--color-data-olive-60)',
  string: 'var(--color-data-green-60)',
  tag: 'var(--color-data-blue-50)',
  keyword: 'var(--color-data-violet-50)',
  number: 'var(--color-data-orange-50)',
  bool: 'var(--color-data-orange-50)',
};

const KEYWORDS = [
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return',
  'new', 'type', 'interface', 'extends', 'as', 'of', 'in', 'if', 'else', 'for', 'while',
  'await', 'async', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef',
];

const TOKEN_RE = new RegExp(
  [
    '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)',
    "(?<string>'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\"|`(?:[^`\\\\]|\\\\.)*`)",
    '(?<tag></?[A-Za-z][\\w.]*)',
    `(?<keyword>\\b(?:${KEYWORDS.join('|')})\\b)`,
    '(?<bool>\\b(?:true|false|null|undefined)\\b)',
    '(?<number>\\b\\d[\\d_.]*\\b)',
  ].join('|'),
  'g',
);

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const groups = m.groups ?? {};
    const kind = Object.keys(groups).find((g) => groups[g] != null) ?? '';
    const color = SYNTAX_COLORS[kind];
    out.push(
      <span key={key++} style={color ? { color, fontStyle: kind === 'comment' ? 'italic' : undefined } : undefined}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

/**
 * Copy-to-clipboard code snippet, design-system styled. Mirrors the Polaris
 * "React" code panel: a framed block with a copy affordance top-right and
 * lightweight TSX syntax highlighting.
 */
export function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(() => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="relative rounded-md border border-[var(--border-default)] bg-[var(--surface-subtle)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-default)]">
        <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--text-muted)]">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-[var(--text-primary)]">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

/**
 * Polaris-style props table. Renders the public interface of a component:
 * prop name, type, default, and description, with required props marked.
 */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="rounded-md border border-[var(--border-default)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-[var(--surface-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-[var(--border-default)] align-top">
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span className="text-[12.5px] font-mono font-medium text-[var(--text-primary)]">{r.name}</span>
                {r.required && <span className="ml-1 text-[var(--brand-primary)]" title="Required">*</span>}
              </td>
              <td className="px-4 py-2.5">
                <span className="text-[12px] font-mono text-[var(--brand-primary)] break-words">{r.type}</span>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span className="text-[12px] font-mono text-[var(--text-muted)]">{r.default ?? '—'}</span>
              </td>
              <td className="px-4 py-2.5 text-[13px] text-[var(--text-secondary)]">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A framed entry for one component/pattern: name, source path, blurb, live demo, code, props. */
export function ComponentEntry({
  name,
  path,
  desc,
  code,
  props,
  blocks,
  children,
}: {
  name: string;
  path: string;
  /** Accepted for back-compat; no longer rendered. */
  status?: 'live' | 'proposed';
  desc?: string;
  /** Optional usage snippet rendered below the live demo. */
  code?: string;
  /** Optional public-interface table rendered below the code. */
  props?: PropRow[];
  /** Optional "Built from" list — the primitives a composed pattern assembles. */
  blocks?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-md border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[var(--border-default)] bg-[var(--surface-subtle)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">{path}</span>
      </div>
      {desc && <p className="px-5 pt-4 -mb-1 text-sm text-[var(--text-secondary)] max-w-2xl">{desc}</p>}
      <div className="p-5">{children}</div>
      {(code || (props && props.length > 0) || (blocks && blocks.length > 0)) && (
        <div className="px-5 pb-5 space-y-4">
          {blocks && blocks.length > 0 && (
            <div>
              <DemoLabel>Built from</DemoLabel>
              <div className="flex flex-wrap gap-1.5">
                {blocks.map((b) => (
                  <span key={b} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
          {code && (
            <div>
              <DemoLabel>Usage</DemoLabel>
              <CodeBlock code={code} />
            </div>
          )}
          {props && props.length > 0 && (
            <div>
              <DemoLabel>Props</DemoLabel>
              <PropsTable rows={props} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A small caption above a demo row. */
export function DemoLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)] mb-2">{children}</div>;
}
