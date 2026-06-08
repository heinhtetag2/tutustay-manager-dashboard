import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, Pencil, Trash2, AlertCircle, BedDouble, Users, Tag, Layers, CalendarClock, Sun, Maximize2 } from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { useHotel } from './use-hotel';
import { formatPrice, totalBeds } from './hotel-data';
import { RoomTypeEditor } from './RoomTypeEditor';

export default function RoomTypeDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const rt = useHotel((s) => s.roomTypes.find((x) => x.id === id));
  const rooms = useHotel((s) => s.rooms);
  const upsertRoomType = useHotel((s) => s.upsertRoomType);
  const removeRoomType = useHotel((s) => s.removeRoomType);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!rt) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Room type not found.')}</p>
          <button onClick={() => navigate('/hotel/rooms')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" />{t('Back to Rooms')}</button>
        </div>
      </div>
    );
  }

  const typeRooms = rooms.filter((r) => r.typeName === rt.name);
  const roomCount = typeRooms.length;
  const stats = [
    { title: 'Regular price', Icon: Tag, value: formatPrice(rt.regularPrice), subtitle: t('Per night') },
    { title: 'Occupancy', Icon: Users, value: `${rt.occupancy} ${t('guests')}`, subtitle: `${totalBeds(rt)} ${totalBeds(rt) === 1 ? t('bed') : t('beds')}` },
    { title: 'Rooms', Icon: BedDouble, value: String(roomCount), subtitle: t('Of this type') },
    { title: 'Session price', Icon: CalendarClock, value: rt.sessionEnabled ? formatPrice(rt.sessionPrice) : '—', subtitle: rt.sessionEnabled ? `${rt.sessionHours}h ${t('session')}` : t('Disabled') },
  ];
  const fields = [
    { label: t('Beds'), value: rt.beds.map((b) => `${b.count} ${t(b.type)}`).join(', ') || '—', Icon: BedDouble },
    { label: t('Occupancy'), value: String(rt.occupancy), Icon: Users },
    { label: t('Room size'), value: rt.roomSize ? `${rt.roomSize} ${rt.sizeUnit}` : '—', Icon: Maximize2 },
    { label: t('Regular price'), value: formatPrice(rt.regularPrice), Icon: Tag },
    { label: t('Weekend price'), value: rt.weekendEnabled ? formatPrice(rt.weekendPrice) : '—', Icon: Sun },
    { label: t('Session price'), value: rt.sessionEnabled ? formatPrice(rt.sessionPrice) : '—', Icon: CalendarClock },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/hotel/rooms')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Room Types')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium">{rt.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 overflow-hidden">
            {rt.photos[0] ? <img src={rt.photos[0]} alt="" className="w-full h-full object-cover" /> : <Layers className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{rt.name}</h1>
            <p className="text-sm text-[var(--text-tertiary)]">{roomCount} {roomCount === 1 ? t('room') : t('rooms')} · {totalBeds(rt)} {totalBeds(rt) === 1 ? t('bed') : t('beds')} · {rt.occupancy} {t('guests')}</p>
            {rt.description && <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">{rt.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"><Pencil className="w-4 h-4" />{t('Edit')}</button>
          <button onClick={() => setDeleting(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />{t('Delete')}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors"><card.Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--surface-subtle)]"><h2 className="text-base font-medium text-[var(--text-primary)]">{t('Room type details')}</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 px-6 py-5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[var(--text-tertiary)]"><f.Icon className="w-4 h-4" /></div>
              <div className="min-w-0"><div className="text-xs text-[var(--text-secondary)] mb-0.5">{f.label}</div><div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{f.value}</div></div>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">{t('Amenities')}</div>
            <div className="flex flex-wrap gap-1.5">
              {rt.amenities.length === 0 ? <span className="text-sm text-[var(--text-secondary)]">—</span> : rt.amenities.map((a) => (
                <span key={a} className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rooms belonging to this type */}
      <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center gap-2">
          <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Rooms of this type')}</h2>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)] tabular-nums">{roomCount}</span>
        </div>
        {roomCount === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">{t('No rooms are assigned to this type yet.')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--surface-subtle)]">
            {typeRooms.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => navigate(`/hotel/rooms/${r.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-left hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">{r.typeName.trim().charAt(0).toUpperCase() || '?'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t('Room')} {r.number}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{t('Floor')} {r.floor}</div>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums shrink-0">{formatPrice(r.price)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full shrink-0 ${r.status === 'Active' ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]'}`}>{t(r.status)}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AnimatePresence>
        {editing && <RoomTypeEditor initial={rt} onClose={() => setEditing(false)} onSave={(r) => { upsertRoomType(r); setEditing(false); }} />}
      </AnimatePresence>


      <Portal>
        <AnimatePresence>
          {deleting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4" onClick={() => setDeleting(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3 }} className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-[var(--surface-subtle)]"><h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Delete')} {rt.name}?</h2></div>
                <div className="p-6">
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{t('This permanently removes the room type. This action cannot be undone.')}</p>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{t('This action cannot be undone.')}</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button onClick={() => setDeleting(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
                  <button onClick={() => { removeRoomType(rt.id); navigate('/hotel/rooms'); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--danger-strong)] hover:bg-[var(--danger)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />{t('Delete')}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}
