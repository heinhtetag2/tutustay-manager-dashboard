import { Upload, Plus, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TFn = ReturnType<typeof useTranslation>['t'];

/** Standard multi-image gallery — wide dropzone when empty, then uniform tiles with an
 *  inline "Add" tile. The first photo is the cover; any other can be promoted to cover. */
export function PhotoGallery({ value, onChange, t }: { value?: string[]; onChange: (next: string[]) => void; t: TFn }) {
  const photos = value ?? [];
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    e.target.value = '';
    if (!files.length) return;
    Promise.all(
      files.map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(typeof r.result === 'string' ? r.result : '');
            r.readAsDataURL(f);
          }),
      ),
    ).then((urls) => onChange([...photos, ...urls.filter(Boolean)]));
  };

  // Empty state — a wide dropzone, matching the document upload.
  if (photos.length === 0) {
    return (
      <label className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)]/30 px-4 py-7 text-center cursor-pointer hover:border-[var(--brand-primary)] hover:bg-[var(--surface-subtle)]/60 transition-colors">
        <input type="file" accept="image/png,image/jpeg" multiple className="sr-only" onChange={onFiles} />
        <span className="w-9 h-9 rounded-full bg-white border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)]">
          <Upload className="w-4 h-4" />
        </span>
        <span className="text-sm font-medium text-[var(--text-primary)]">{t('Upload a photo')}</span>
        <span className="text-xs text-[var(--text-tertiary)]">{t('JPG or PNG up to 5MB each.')}</span>
      </label>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {photos.map((src, i) => (
          <div key={i} className="group relative w-28 h-28 rounded-md overflow-hidden border border-[var(--border-default)] bg-white">
            <img src={src} alt="" className="w-full h-full object-cover" />
            {i === 0 ? (
              <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/65 text-white">
                <Star className="w-2.5 h-2.5 fill-current" />
                {t('Cover')}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onChange([photos[i], ...photos.filter((_, idx) => idx !== i)])}
                className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/65 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/85 transition-all cursor-pointer"
              >
                {t('Set as cover')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              aria-label={t('Remove')}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ))}
        <label className="w-28 h-28 rounded-md border border-dashed border-[var(--border-strong)] flex flex-col items-center justify-center gap-1 text-[var(--text-tertiary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-subtle)]/50 transition-colors cursor-pointer">
          <input type="file" accept="image/png,image/jpeg" multiple className="sr-only" onChange={onFiles} />
          <Plus className="w-5 h-5" />
          <span className="text-xs font-medium">{t('Add photo')}</span>
        </label>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mt-2.5">{t('JPG or PNG up to 5MB each.')}</p>
    </div>
  );
}
