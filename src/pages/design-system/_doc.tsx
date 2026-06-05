import React from 'react';

/* ============================================================================
   Shared documentation primitives for the live Design System reference.
   Used by DesignSystemPage and the composed-pattern gallery sections.
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

/** A framed entry for one component/pattern: name, source path, status, blurb + live demo. */
export function ComponentEntry({
  name,
  path,
  desc,
  children,
}: {
  name: string;
  path: string;
  /** Accepted for back-compat; no longer rendered. */
  status?: 'live' | 'proposed';
  desc?: string;
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
    </div>
  );
}

/** A small caption above a demo row. */
export function DemoLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)] mb-2">{children}</div>;
}
