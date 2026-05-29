import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Portal } from '@/shared/ui/portal';

const VIEW = 320; // square viewport / circle diameter (px)
const OUT = 320; // exported image size (px)

interface ImageCropperProps {
  src: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

/** Circular avatar cropper — pan by dragging, zoom with the slider. */
export function ImageCropper({ src, onCancel, onSave }: ImageCropperProps) {
  const { t } = useTranslation();
  const [img, setImg] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const baseScale = img ? Math.max(VIEW / img.w, VIEW / img.h) : 1;
  const effScale = baseScale * zoom;
  const dw = img ? img.w * effScale : VIEW;
  const dh = img ? img.h * effScale : VIEW;

  const clamp = (x: number, y: number) => ({
    x: Math.min(0, Math.max(VIEW - dw, x)),
    y: Math.min(0, Math.max(VIEW - dh, y)),
  });

  useEffect(() => {
    const im = new Image();
    im.onload = () => setImg({ w: im.naturalWidth, h: im.naturalHeight });
    im.src = src;
  }, [src]);

  // Center the image once its dimensions are known.
  useEffect(() => {
    if (!img) return;
    const w = img.w * baseScale;
    const h = img.h * baseScale;
    setOffset({ x: (VIEW - w) / 2, y: (VIEW - h) / 2 });
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  const onZoom = (z: number) => {
    if (!img) { setZoom(z); return; }
    const cx = VIEW / 2;
    const cy = VIEW / 2;
    const prevEff = baseScale * zoom;
    const newEff = baseScale * z;
    const ipx = (cx - offset.x) / prevEff;
    const ipy = (cy - offset.y) / prevEff;
    const ndw = img.w * newEff;
    const ndh = img.h * newEff;
    const nx = Math.min(0, Math.max(VIEW - ndw, cx - ipx * newEff));
    const ny = Math.min(0, Math.max(VIEW - ndh, cy - ipy * newEff));
    setZoom(z);
    setOffset({ x: nx, y: ny });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(clamp(drag.current.ox + (e.clientX - drag.current.x), drag.current.oy + (e.clientY - drag.current.y)));
  };
  const onPointerUp = () => { drag.current = null; };

  const save = () => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const im = new Image();
    im.onload = () => {
      const srcX = (0 - offset.x) / effScale;
      const srcY = (0 - offset.y) / effScale;
      const srcSize = VIEW / effScale;
      ctx.drawImage(im, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
      onSave(canvas.toDataURL('image/jpeg', 0.9));
    };
    im.src = src;
  };

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--text-primary)]/40 flex items-center justify-center z-[70] p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white rounded-md w-full max-w-md shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Adjust your image')}</h2>
              <button
                onClick={onCancel}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-5">
              <div
                className="relative overflow-hidden rounded-md bg-[var(--text-primary)] touch-none select-none cursor-grab active:cursor-grabbing"
                style={{ width: VIEW, height: VIEW, maxWidth: '100%' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                {img && (
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    style={{ position: 'absolute', left: offset.x, top: offset.y, width: dw, height: dh, maxWidth: 'none' }}
                  />
                )}
                {/* Circular mask */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full" style={{ width: VIEW, height: VIEW, boxShadow: '0 0 0 9999px rgba(43,40,38,0.55)' }} />
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => onZoom(Number(e.target.value))}
                className="w-full accent-[var(--brand-primary)] cursor-pointer"
                aria-label={t('Zoom')}
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={save}
                disabled={!img}
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
