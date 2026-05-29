import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, Pencil, Trash2, AlertCircle, X, BedDouble, Layers, Users, Hash, Building, BadgeCheck, Tag } from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { useHotel } from './use-hotel';
import { formatPrice, type RoomStatus } from './hotel-data';
import { RoomEditor } from './room-editors';

function statusBadge(status: RoomStatus) {
  return status === 'Active' ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
}

export default function RoomDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const room = useHotel((s) => s.rooms.find((r) => r.id === id));
  const roomTypes = useHotel((s) => s.roomTypes);
  const upsertRoom = useHotel((s) => s.upsertRoom);
  const removeRoom = useHotel((s) => s.removeRoom);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!room) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Room not found.')}</p>
          <button onClick={() => navigate('/hotel/rooms')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" />{t('Back to Rooms')}</button>
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Type', Icon: Layers, value: room.typeName, subtitle: t('Room type') },
    { title: 'Floor', Icon: Building, value: String(room.floor), subtitle: t('Location') },
    { title: 'Occupancy', Icon: Users, value: `${room.occupancy}`, subtitle: `${room.beds} ${t('beds')}` },
    { title: 'Price', Icon: Tag, value: formatPrice(room.price), subtitle: t('Per night') },
  ];
  const fields = [
    { label: t('Floor'), value: String(room.floor), Icon: Building },
    { label: t('Number'), value: room.number, Icon: Hash },
    { label: t('Type'), value: room.typeName, Icon: Layers },
    { label: t('Beds'), value: String(room.beds), Icon: BedDouble },
    { label: t('Occupancy'), value: String(room.occupancy), Icon: Users },
    { label: t('Price'), value: formatPrice(room.price), Icon: Tag },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/hotel/rooms')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Rooms')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium">{t('Room')} {room.number}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 overflow-hidden">
            {roomTypes.find((rt) => rt.name === room.typeName)?.photos[0]
              ? <img src={roomTypes.find((rt) => rt.name === room.typeName)?.photos[0]} alt="" className="w-full h-full object-cover" />
              : <BedDouble className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{t('Room')} {room.number}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusBadge(room.status)}`}>{t(room.status)}</span>
              <span className="text-sm text-[var(--text-tertiary)]">{room.typeName}</span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{t('Floor')} {room.floor}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"><Pencil className="w-4 h-4" />{t('Edit')}</button>
          <button onClick={() => setDeleting(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />{t('Delete')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors"><card.Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between">
          <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Room details')}</h2>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full ${statusBadge(room.status)}`}><BadgeCheck className="w-3 h-3" />{t(room.status)}</span>
        </div>
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
              {room.amenities.length === 0 ? <span className="text-sm text-[var(--text-secondary)]">—</span> : room.amenities.map((a) => (
                <span key={a} className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {editing && <RoomEditor initial={room} types={roomTypes.map((r) => r.name)} onClose={() => setEditing(false)} onSave={(r) => { upsertRoom(r); setEditing(false); }} />}
      </AnimatePresence>

      <Portal>
        <AnimatePresence>
          {deleting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4" onClick={() => setDeleting(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3 }} className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-[var(--surface-subtle)]"><h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Delete')} {t('Room')} {room.number}?</h2></div>
                <div className="p-6">
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{t('This permanently removes the room. This action cannot be undone.')}</p>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{t('This action cannot be undone.')}</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button onClick={() => setDeleting(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
                  <button onClick={() => { removeRoom(room.id); navigate('/hotel/rooms'); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--danger-strong)] hover:bg-[var(--danger)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />{t('Delete')}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}
