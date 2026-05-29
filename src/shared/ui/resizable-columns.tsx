import { useRef, useState } from 'react';

export interface ColumnDef {
  /** Unique column key; order must match the table's cells. */
  key: string;
  /** Default width in px. */
  w: number;
  /** Minimum width a drag can shrink the column to. */
  min: number;
  /** Whether the column shows a drag-to-resize handle (default true). */
  resizable?: boolean;
}

/**
 * Design-system table column resizing. Pair with a `table-fixed` table, a
 * `<colgroup>` driven by `widths`, a `group/head` on the header `<tr>`, and a
 * <ColResizeHandle> in each resizable header cell.
 */
export function useResizableColumns(defs: ColumnDef[]) {
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(defs.map((d) => [d.key, d.w])),
  );
  const mins = useRef<Record<string, number>>(Object.fromEntries(defs.map((d) => [d.key, d.min])));
  const widthsRef = useRef(widths);
  widthsRef.current = widths;
  const resizing = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const onResizeStart = (key: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { key, startX: e.clientX, startW: widthsRef.current[key] ?? 120 };
    const onMove = (ev: PointerEvent) => {
      const r = resizing.current;
      if (!r) return;
      const min = mins.current[r.key] ?? 80;
      setWidths((prev) => ({ ...prev, [r.key]: Math.max(min, r.startW + (ev.clientX - r.startX)) }));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return { widths, onResizeStart };
}

/**
 * Right-edge resize handle for a header cell. The divider is invisible until you
 * hover that specific cell (`group/col` → faint divider) or its edge
 * (`group/rz` → stronger, thicker, draggable). Only the hovered column reacts.
 */
export function ColResizeHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <span
      onPointerDown={onPointerDown}
      aria-hidden="true"
      className="group/rz absolute top-0 -right-px h-full w-2.5 flex justify-end cursor-col-resize touch-none"
    >
      <span className="w-px h-full bg-transparent group-hover/col:bg-[var(--border-default)] group-hover/rz:bg-[var(--border-strong)] group-hover/rz:w-0.5 transition-all" />
    </span>
  );
}

/** Left-edge divider for a header cell — appears only while that cell is hovered. */
export function ColLeftDivider() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 left-0 h-full w-px bg-transparent group-hover/col:bg-[var(--border-default)] transition-colors"
    />
  );
}
