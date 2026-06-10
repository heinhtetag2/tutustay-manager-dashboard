/** Semantic / accent tints for an overview stat-card icon chip.
 *
 *  Each tone pairs a soft pastel background (`-10` shade) with a strong icon
 *  foreground, so a row of cards reads at a glance instead of looking flat.
 *  Use the semantic tones (success/warning/danger) where a card has a clear
 *  meaning; use the accent hues to give neutral metrics distinct identities. */
export type StatTone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'teal'
  | 'pink'
  | 'amber'
  | 'neutral';

// Backgrounds use the soft pastel `base-*` `-10` shades (or a white-mixed tint
// for blue, which has no soft base family) so every chip sits at the same gentle
// saturation as the semantic tones — the `data-*` `-10` shades read too strong.
export const STAT_TONE: Record<StatTone, string> = {
  brand: 'bg-[var(--color-base-ocean-10)] text-[var(--brand-primary)]',
  success: 'bg-[var(--color-base-evergreen-10)] text-[var(--success)]',
  warning: 'bg-[var(--color-base-ember-10)] text-[var(--warning-strong)]',
  danger: 'bg-[var(--color-data-red-10)] text-[var(--danger)]',
  info: 'bg-[color-mix(in_srgb,var(--color-data-blue-10)_42%,white)] text-[var(--color-data-blue-50)]',
  purple: 'bg-[var(--color-base-iris-10)] text-[var(--color-base-iris-50)]',
  teal: 'bg-[var(--color-base-tropic-10)] text-[var(--color-base-tropic-50)]',
  pink: 'bg-[var(--color-base-sakura-10)] text-[var(--color-base-sakura-50)]',
  amber: 'bg-[color-mix(in_srgb,var(--color-data-yellow-10)_60%,white)] text-[var(--color-data-yellow-50)]',
  neutral: 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]',
};

/** Convenience: the chip className for a tone. */
export function statToneChip(tone: StatTone): string {
  return STAT_TONE[tone];
}
