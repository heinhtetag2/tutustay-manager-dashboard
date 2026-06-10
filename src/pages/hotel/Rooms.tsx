import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SearchX,
  Plus,
  BedDouble,
  CheckCircle,
  XCircle,
  Layers,
  Users,
  Building,
  Trash2,
  AlertCircle,
  X,
  Pencil,
  ChevronRight,
  ChevronDown,
  DoorOpen,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { Portal } from '@/shared/ui/portal';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MultiSelect } from '@/shared/ui/multi-select';
import { MobileFilterButton, MobileFilterSheet, FilterField } from '@/shared/ui/mobile-filter-sheet';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import { useHotel } from './use-hotel';
import { AMENITIES, formatPrice, totalBeds, emptyRoomType, type Room, type RoomType, type RoomStatus } from './hotel-data';
import { RoomEditor, AmenityIcon } from './room-editors';
import { RoomTypeEditor } from './RoomTypeEditor';
import { useOnboarding } from '@/widgets/onboarding';
import { useRoomsTour, type PriceTab } from '@/widgets/onboarding/rooms-tour';

const emptyRoomFilters = { amenity: [] as string[], status: 'All' as 'All' | RoomStatus, floor: 'All', occupancy: 'All' };
const OCCUPANCY_OPTIONS = ['1', '2', '3', '4'];

function statusStyles(status: RoomStatus) {
  return status === 'Active' ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
}

/** Square thumbnail: photo if present, else the label's initial on a brand tint. */
function Thumb({ src, label, size = 'w-10 h-10' }: { src?: string; label: string; size?: string }) {
  if (src) {
    return <div className={`${size} rounded-md overflow-hidden border border-[var(--border-default)] shrink-0`}><img src={src} alt="" className="w-full h-full object-cover" /></div>;
  }
  return (
    <div className={`${size} rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0`}>
      {label.trim().charAt(0).toUpperCase() || '?'}
    </div>
  );
}

function Chip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)] whitespace-nowrap">
      <AmenityIcon name={name} className="w-3 h-3" />{name}
    </span>
  );
}

/** First amenity + a "+N" popover trigger, to keep the column tight. */
function Amenities({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-[var(--text-secondary)]">—</span>;
  const [first, ...rest] = items;
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Chip name={first} />
      {rest.length > 0 && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)] hover:bg-[var(--border-default)] transition-colors cursor-pointer">+{rest.length}</button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" align="start" sideOffset={6} className="z-50 rounded-md border border-[var(--brand-primary)] bg-white p-2 shadow-[0_4px_16px_rgba(44,38,39,0.12)] flex flex-col gap-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
              {items.map((a) => <Chip key={a} name={a} />)}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}

export default function Rooms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rooms, roomTypes, property, upsertRoom, upsertRoomType, removeRoom } = useHotel();
  // New room types inherit the hotel's pricing defaults (configured in Settings).
  const newRoomType = () => ({ ...emptyRoomType(), weekendDays: [...property.defaultWeekendDays], sessionHours: property.defaultSessionHours });

  const [search, setSearch] = useState('');
  const [roomFilters, setRoomFilters] = useState(emptyRoomFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [roomEditor, setRoomEditor] = useState<Room | null>(null);
  const [typeEditor, setTypeEditor] = useState<RoomType | null>(null);
  const [forcePriceTab, setForcePriceTab] = useState<PriceTab | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const counts = {
    total: rooms.length,
    active: rooms.filter((r) => r.status === 'Active').length,
    inactive: rooms.filter((r) => r.status === 'Inactive').length,
    types: roomTypes.length,
  };

  const roomFilterCount = (roomFilters.amenity.length ? 1 : 0) + (roomFilters.status !== 'All' ? 1 : 0) + (roomFilters.floor !== 'All' ? 1 : 0) + (roomFilters.occupancy !== 'All' ? 1 : 0);
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  const q = search.trim().toLowerCase();
  const anyFilterActive = roomFilterCount > 0 || q !== '';

  // A room passes the non-search filters (amenity / status / floor / occupancy).
  const passNonSearch = (r: Room) => {
    if (roomFilters.amenity.length && !roomFilters.amenity.some((a) => r.amenities.includes(a))) return false;
    if (roomFilters.status !== 'All' && r.status !== roomFilters.status) return false;
    if (roomFilters.floor !== 'All' && r.floor !== Number(roomFilters.floor)) return false;
    if (roomFilters.occupancy !== 'All' && r.occupancy < Number(roomFilters.occupancy)) return false;
    return true;
  };

  // Group rooms under their room type. A type group is shown when it has matching
  // rooms, when nothing is being filtered (so empty types still invite a first
  // room), or when the search matches the type's own name.
  const groups = roomTypes
    .map((rt) => {
      const typeMatch = q !== '' && rt.name.toLowerCase().includes(q);
      const visibleRooms = rooms.filter((r) => {
        if (r.typeName !== rt.name) return false;
        if (!passNonSearch(r)) return false;
        if (q && !typeMatch && !`${r.number} ${r.floor}`.toLowerCase().includes(q)) return false;
        return true;
      });
      return { rt, visibleRooms, typeMatch };
    })
    .filter((g) => g.visibleRooms.length > 0 || !anyFilterActive || g.typeMatch);

  // Orphan rooms whose type was removed — keep them reachable under "Other".
  const orphanRooms = rooms.filter((r) => !roomTypes.some((rt) => rt.name === r.typeName) && passNonSearch(r) && (!q || `${r.number} ${r.floor} ${r.typeName}`.toLowerCase().includes(q)));

  const allVisibleRoomIds = [...groups.flatMap((g) => g.visibleRooms.map((r) => r.id)), ...orphanRooms.map((r) => r.id)];
  const totalVisibleRooms = allVisibleRoomIds.length;

  const clearFilters = () => { setRoomFilters(emptyRoomFilters); setSearch(''); };

  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const groupAllSelected = (ids: string[]) => ids.length > 0 && ids.every((id) => selected.has(id));
  const toggleGroup = (ids: string[]) => setSelected((prev) => {
    const next = new Set(prev);
    if (groupAllSelected(ids)) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    return next;
  });

  const confirmBulkDelete = () => {
    selected.forEach((id) => removeRoom(id));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const stats = [
    { title: 'Total rooms', Icon: BedDouble, value: String(counts.total), subtitle: `${counts.active} ${t('active')} · ${counts.inactive} ${t('inactive')}`, tone: 'brand' as const },
    { title: 'Active rooms', Icon: CheckCircle, value: String(counts.active), subtitle: t('Bookable now'), tone: 'success' as const },
    { title: 'Inactive rooms', Icon: XCircle, value: String(counts.inactive), subtitle: t('Not bookable'), tone: 'danger' as const },
    { title: 'Room types', Icon: Layers, value: String(counts.types), subtitle: t('Pricing tiers'), tone: 'info' as const },
  ];

  const emptyRoom = (): Room => ({ id: '', floor: 1, number: '', typeName: roomTypes[0]?.name ?? '', beds: 1, occupancy: 2, amenities: [], price: roomTypes[0]?.regularPrice ?? 0, status: 'Active' });
  // Pre-bind a new room to a specific type so "Add room" inside a group inherits its pricing.
  const emptyRoomOfType = (rt: RoomType): Room => ({ ...emptyRoom(), typeName: rt.name, occupancy: rt.occupancy, price: rt.regularPrice });

  // Guided "create a room type → add a room" flow (drives the editors below).
  // The grouped view has no tabs, so the tab-switch actions are no-ops.
  const tour = useRoomsTour({
    openTypeEditor: () => setTypeEditor((p) => p ?? newRoomType()),
    closeTypeEditor: () => setTypeEditor(null),
    openRoomEditor: () => setRoomEditor((p) => p ?? emptyRoom()),
    closeRoomEditor: () => setRoomEditor(null),
    showRoomsTab: () => {},
    showTypesTab: () => {},
    setPriceTab: setForcePriceTab,
  });

  // Auto-run the guided flow on arrival (once per session, after any welcome
  // modal / global tour is out of the way). Demo: resets on refresh.
  const welcomeOpen = useOnboarding((s) => s.welcomeOpen);
  const globalTour = useOnboarding((s) => s.tourId);
  const roomsTourSeen = useOnboarding((s) => s.roomsTourSeen);
  const markRoomsTourSeen = useOnboarding((s) => s.markRoomsTourSeen);
  const startRef = useRef(tour.start);
  startRef.current = tour.start;
  useEffect(() => {
    if (roomsTourSeen || welcomeOpen || globalTour) return;
    const id = window.setTimeout(() => { markRoomsTourSeen(); startRef.current(); }, 500);
    return () => window.clearTimeout(id);
  }, [welcomeOpen, globalTour, roomsTourSeen, markRoomsTourSeen]);

  const hasTypes = roomTypes.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Rooms')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Each room belongs to a room type, which sets its price, beds and amenities. Create a type, then add rooms to it.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button data-tour="rooms-add" onClick={() => setTypeEditor(newRoomType())} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            {t('Add room type')}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}><card.Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {hasTypes && (
        <>
          {/* Toolbar — desktop (sm+) */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search rooms or types...')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <MultiSelect values={roomFilters.amenity} onChange={(v) => setRoomFilters((f) => ({ ...f, amenity: v }))} options={[...AMENITIES]} placeholder={t('Any amenity')} searchPlaceholder={t('Search amenity')} leftIcon={<Layers />} className="sm:w-auto min-w-[170px]" />
              <BrandSelect value={roomFilters.status} onValueChange={(v) => setRoomFilters((f) => ({ ...f, status: v as 'All' | RoomStatus }))} leftIcon={<CheckCircle />} className="sm:w-auto" options={[{ value: 'All', label: t('All Statuses') }, { value: 'Active', label: t('Active') }, { value: 'Inactive', label: t('Inactive') }]} />
              <BrandSelect value={roomFilters.floor} onValueChange={(v) => setRoomFilters((f) => ({ ...f, floor: v }))} leftIcon={<Building />} className="sm:w-auto" options={[{ value: 'All', label: t('All floors') }, ...floors.map((fl) => ({ value: String(fl), label: `${t('Floor')} ${fl}` }))]} />
              <BrandSelect value={roomFilters.occupancy} onValueChange={(v) => setRoomFilters((f) => ({ ...f, occupancy: v }))} leftIcon={<Users />} className="sm:w-auto" options={[{ value: 'All', label: t('Any occupancy') }, ...OCCUPANCY_OPTIONS.map((o) => ({ value: o, label: `${o}+ ${t('guests')}` }))]} />
              {anyFilterActive && (
                <button onClick={clearFilters} className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] cursor-pointer flex-shrink-0" title={t('Clear filters')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar — mobile (search + Filters sheet trigger + status select) */}
          <div className="sm:hidden flex flex-col gap-3 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search rooms or types...')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
            </div>
            <div className="flex gap-2">
              <MobileFilterButton count={roomFilterCount} onClick={() => setIsFilterOpen(true)} label={t('Filters')} className="flex-1" />
              <BrandSelect value={roomFilters.status} onValueChange={(v) => setRoomFilters((f) => ({ ...f, status: v as 'All' | RoomStatus }))} leftIcon={<CheckCircle />} className="flex-1" options={[{ value: 'All', label: t('All Statuses') }, { value: 'Active', label: t('Active') }, { value: 'Inactive', label: t('Inactive') }]} />
            </div>
          </div>

          {/* Mobile filter sheet */}
          <MobileFilterSheet
            open={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onClear={clearFilters}
            onApply={() => setIsFilterOpen(false)}
            title={t('Filters')}
            clearLabel={t('Clear all')}
            applyLabel={t('Show results')}
          >
            <FilterField label={t('Amenity')}>
              <MultiSelect values={roomFilters.amenity} onChange={(v) => setRoomFilters((f) => ({ ...f, amenity: v }))} options={[...AMENITIES]} placeholder={t('Any amenity')} searchPlaceholder={t('Search amenity')} leftIcon={<Layers />} className="w-full" />
            </FilterField>
            <FilterField label={t('Floor')}>
              <BrandSelect value={roomFilters.floor} onValueChange={(v) => setRoomFilters((f) => ({ ...f, floor: v }))} leftIcon={<Building />} className="w-full" options={[{ value: 'All', label: t('All floors') }, ...floors.map((fl) => ({ value: String(fl), label: `${t('Floor')} ${fl}` }))]} />
            </FilterField>
            <FilterField label={t('Occupancy')}>
              <BrandSelect value={roomFilters.occupancy} onValueChange={(v) => setRoomFilters((f) => ({ ...f, occupancy: v }))} leftIcon={<Users />} className="w-full" options={[{ value: 'All', label: t('Any occupancy') }, ...OCCUPANCY_OPTIONS.map((o) => ({ value: o, label: `${o}+ ${t('guests')}` }))]} />
            </FilterField>
          </MobileFilterSheet>
        </>
      )}

      {/* Bulk selection bar */}
      <AnimatePresence initial={false}>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -6, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
              <span className="text-sm font-medium text-[var(--brand-primary)] tabular-nums">{selected.size} {t('selected')}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white rounded-md transition-colors cursor-pointer">{t('Clear')}</button>
                <button onClick={() => setBulkDeleting(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />{t('Delete')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty: no room types at all — the guided first step. */}
      {!hasTypes ? (
        <div className="bg-white rounded-md border border-[var(--border-default)] shadow-none px-6 py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center mb-4"><Layers className="w-6 h-6" /></div>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Start by creating a room type')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-md">{t('A room type is a reusable template — it sets the price, beds and amenities. Once you have one, you can add individual rooms to it.')}</p>
          <button onClick={() => setTypeEditor(newRoomType())} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />{t('Create a room type')}
          </button>
        </div>
      ) : groups.length === 0 && orphanRooms.length === 0 ? (
        <div className="bg-white rounded-md border border-[var(--border-default)] shadow-none px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <SearchX className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('No rooms found')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{t('No rooms or types match these filters.')}</p>
            <button onClick={clearFilters} className="mt-4 text-sm font-medium text-[var(--brand-primary)] hover:underline cursor-pointer">{t('Clear filters')}</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g, gi) => {
            const ids = g.visibleRooms.map((r) => r.id);
            return (
              <RoomTypeGroup
                key={g.rt.id}
                rt={g.rt}
                rooms={g.visibleRooms}
                index={gi}
                allSelected={groupAllSelected(ids)}
                someSelected={ids.some((id) => selected.has(id))}
                isSelected={(id) => selected.has(id)}
                onToggleGroup={() => toggleGroup(ids)}
                onToggleRoom={toggleOne}
                onOpenType={() => navigate(`/hotel/room-types/${g.rt.id}`)}
                onEditType={() => setTypeEditor(g.rt)}
                onOpenRoom={(id) => navigate(`/hotel/rooms/${id}`)}
                onAddRoom={() => setRoomEditor(emptyRoomOfType(g.rt))}
                addRoomTourId={gi === 0 ? 'rooms-add-room' : undefined}
                t={t}
              />
            );
          })}

          {/* Orphan rooms whose type was deleted */}
          {orphanRooms.length > 0 && (
            <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
              <div className="px-5 py-3 border-b border-[var(--surface-subtle)] bg-[var(--surface-subtle)]/40">
                <span className="text-sm font-medium text-[var(--text-primary)]">{t('Other rooms')}</span>
                <span className="ml-2 text-xs text-[var(--text-tertiary)]">{t('No matching room type')}</span>
              </div>
              <div className="divide-y divide-[var(--surface-subtle)]">
                {orphanRooms.map((r, i) => (
                  <RoomRow key={r.id} room={r} index={i} selected={selected.has(r.id)} onToggle={() => toggleOne(r.id)} onOpen={() => navigate(`/hotel/rooms/${r.id}`)} t={t} />
                ))}
              </div>
            </div>
          )}

          {/* Footer count — the "Add room type" header button is the single create affordance. */}
          <div className="px-1 pt-1">
            <span className="text-sm text-[var(--text-secondary)] tabular-nums">{totalVisibleRooms} {totalVisibleRooms === 1 ? t('room') : t('rooms')} · {groups.length} {groups.length === 1 ? t('type') : t('types')}</span>
          </div>
        </div>
      )}

      {/* Editors */}
      <AnimatePresence>
        {roomEditor && <RoomEditor initial={roomEditor} roomTypes={roomTypes} hideBackdrop={tour.active} onClose={() => setRoomEditor(null)} onSave={(r) => { upsertRoom(r.id ? r : { ...r, id: `rm-${Date.now()}` }); setRoomEditor(null); }} />}
        {typeEditor && <RoomTypeEditor initial={typeEditor} forcePriceTab={forcePriceTab} hideBackdrop={tour.active} onClose={() => setTypeEditor(null)} onSave={(rt) => { upsertRoomType(rt); setTypeEditor(null); }} />}
      </AnimatePresence>

      {/* Bulk delete confirm */}
      <Portal>
        <AnimatePresence>
          {bulkDeleting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4" onClick={() => setBulkDeleting(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3 }} className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-[var(--surface-subtle)]"><h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Delete')} {selected.size} {selected.size === 1 ? t('room') : t('rooms')}?</h2></div>
                <div className="p-6">
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{t('This permanently removes the selected records. This action cannot be undone.')}</p>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{t('This action cannot be undone.')}</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button onClick={() => setBulkDeleting(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
                  <button onClick={confirmBulkDelete} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--danger-strong)] hover:bg-[var(--danger)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />{t('Delete')}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* Guided rooms onboarding flow */}
      {tour.node}
    </motion.div>
  );
}

/** One room-type section: header (type summary + actions) with its rooms nested beneath. Collapsible. */
function RoomTypeGroup({
  rt, rooms, index, allSelected, someSelected, isSelected, onToggleGroup, onToggleRoom, onOpenType, onEditType, onOpenRoom, onAddRoom, addRoomTourId, t,
}: {
  rt: RoomType;
  rooms: Room[];
  index: number;
  allSelected: boolean;
  someSelected: boolean;
  isSelected: (id: string) => boolean;
  onToggleGroup: () => void;
  onToggleRoom: (id: string) => void;
  onOpenType: () => void;
  onEditType: () => void;
  onOpenRoom: (id: string) => void;
  onAddRoom: () => void;
  addRoomTourId?: string;
  t: (k: string) => string;
}) {
  const [open, setOpen] = useState(true);
  const acceptsForeigners = useHotel((s) => s.property.foreignPolicy === 'Foreigners welcome');
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none"
    >
      {/* Type header */}
      <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3.5 bg-[var(--surface-subtle)]/40 ${open ? 'border-b border-[var(--surface-subtle)]' : ''}`}>
        {/* Collapse / expand toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? t('Collapse') : t('Expand')}
          className="flex items-center justify-center w-6 h-6 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
        </button>
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
          onChange={onToggleGroup}
          disabled={rooms.length === 0}
          className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={t('Select all rooms of this type')}
        />
        <button onClick={onOpenType} className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 text-left cursor-pointer group">
          <span className="hidden sm:block shrink-0"><Thumb src={rt.photos[0]} label={rt.name} size="w-11 h-11" /></span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--brand-primary)] transition-colors">{rt.name}</span>
              <span className="text-[11px] font-normal text-[var(--text-tertiary)] tabular-nums">· {rooms.length} {rooms.length === 1 ? t('room') : t('rooms')}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums leading-snug sm:truncate">
              {formatPrice(rt.regularPrice)}
              {acceptsForeigners && (rt.foreignerPrice ?? 0) > 0 && <span className="text-[var(--text-tertiary)]"> · {t('Foreigner')} {formatPrice(rt.foreignerPrice ?? 0)}</span>}
              <span className="text-[var(--text-tertiary)]"> · {totalBeds(rt)} {totalBeds(rt) === 1 ? t('bed') : t('beds')} · {rt.occupancy} {t('guests')}</span>
            </div>
          </div>
        </button>
        {/* Amenities (hidden on small) */}
        <div className="hidden lg:block shrink-0"><Amenities items={rt.amenities} /></div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onEditType} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title={t('Edit type')}>
            <Pencil className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t('Edit type')}</span>
          </button>
          <button data-tour={addRoomTourId} onClick={onAddRoom} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--brand-primary)] bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md hover:bg-[var(--brand-primary)] hover:text-white transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />{t('Add room')}
          </button>
        </div>
      </div>

      {/* Rooms of this type (collapsible) */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {rooms.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center text-center">
                <DoorOpen className="w-6 h-6 text-[var(--text-tertiary)] mb-2" strokeWidth={1.5} />
                <p className="text-sm text-[var(--text-secondary)]">{t('No rooms of this type yet.')}</p>
                <button onClick={onAddRoom} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:underline cursor-pointer">
                  <Plus className="w-4 h-4" />{t('Add the first room')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--surface-subtle)]">
                {rooms.map((r, i) => (
                  <RoomRow key={r.id} room={r} index={i} selected={isSelected(r.id)} onToggle={() => onToggleRoom(r.id)} onOpen={() => onOpenRoom(r.id)} t={t} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/** A single room row, nested under its type. Responsive: inline on desktop, stacked on mobile. */
function RoomRow({ room: r, index, selected, onToggle, onOpen, t }: { room: Room; index: number; selected: boolean; onToggle: () => void; onOpen: () => void; t: (k: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onOpen}
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
    >
      {/* Spacer matching the header's collapse chevron, so the row checkbox lines up with the type checkbox above. */}
      <span className="w-6 shrink-0" aria-hidden="true" />
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer shrink-0"
        aria-label={t('Select room')}
      />
      {/* Room identity */}
      <div className="min-w-0 flex-1 sm:flex-none sm:w-44">
        <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums truncate">{t('Room')} {r.number}</div>
        <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{t('Floor')} {r.floor}</div>
      </div>
      {/* Capacity (sm+) */}
      <div className="hidden sm:block text-sm text-[var(--text-tertiary)] tabular-nums w-40 shrink-0">{r.beds} {r.beds === 1 ? t('bed') : t('beds')} · {r.occupancy} {t('guests')}</div>
      {/* Amenities (md+) */}
      <div className="hidden md:block flex-1 min-w-0"><Amenities items={r.amenities} /></div>
      {/* Price */}
      <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums shrink-0 w-20 sm:w-24 text-right sm:text-left">{formatPrice(r.price)}</div>
      {/* Status */}
      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shrink-0 ${statusStyles(r.status)}`}>{t(r.status)}</span>
      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 hidden sm:block" />
    </motion.div>
  );
}
