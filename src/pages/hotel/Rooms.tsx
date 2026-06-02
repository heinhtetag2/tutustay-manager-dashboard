import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  BedDouble,
  CheckCircle,
  XCircle,
  Layers,
  Users,
  Building,
  Building2,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { Portal } from '@/shared/ui/portal';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MultiSelect } from '@/shared/ui/multi-select';
import { useResizableColumns, ColResizeHandle, ColLeftDivider, type ColumnDef } from '@/shared/ui/resizable-columns';
import { useHotel } from './use-hotel';
import { AMENITIES, formatPrice, totalBeds, emptyRoomType, type Room, type RoomType, type RoomStatus } from './hotel-data';
import { RoomEditor, AmenityIcon } from './room-editors';
import { RoomTypeEditor } from './RoomTypeEditor';
import { HotelSetupWizard } from './setup/HotelSetupWizard';

type View = 'rooms' | 'types';

const emptyRoomFilters = { amenity: [] as string[], status: 'All' as 'All' | RoomStatus, roomType: 'All', floor: 'All', occupancy: 'All' };
const emptyTypeFilters = { amenity: [] as string[], occupancy: 'All' };
const OCCUPANCY_OPTIONS = ['1', '2', '3', '4'];

const ROOM_COLS: ColumnDef[] = [
  { key: 'select', w: 48, min: 48, resizable: false },
  { key: 'room', w: 300, min: 220 },
  { key: 'capacity', w: 150, min: 120 },
  { key: 'amenity', w: 200, min: 140 },
  { key: 'price', w: 140, min: 110 },
  { key: 'status', w: 120, min: 100 },
];
const TYPE_COLS: ColumnDef[] = [
  { key: 'select', w: 48, min: 48, resizable: false },
  { key: 'roomType', w: 320, min: 240 },
  { key: 'pricing', w: 200, min: 160 },
  { key: 'amenity', w: 220, min: 150 },
];

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
  const { rooms, roomTypes, upsertRoom, upsertRoomType, removeRoom, removeRoomType } = useHotel();
  const roomCols = useResizableColumns(ROOM_COLS);
  const typeCols = useResizableColumns(TYPE_COLS);

  const [view, setView] = useState<View>('rooms');
  const [search, setSearch] = useState('');
  const [roomFilters, setRoomFilters] = useState(emptyRoomFilters);
  const [typeFilters, setTypeFilters] = useState(emptyTypeFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [roomEditor, setRoomEditor] = useState<Room | null>(null);
  const [typeEditor, setTypeEditor] = useState<RoomType | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const switchView = (v: View) => { setView(v); setSelected(new Set()); };

  const counts = {
    total: rooms.length,
    active: rooms.filter((r) => r.status === 'Active').length,
    inactive: rooms.filter((r) => r.status === 'Inactive').length,
    types: roomTypes.length,
  };

  const roomFilterCount = (roomFilters.amenity.length ? 1 : 0) + (roomFilters.status !== 'All' ? 1 : 0) + (roomFilters.roomType !== 'All' ? 1 : 0) + (roomFilters.floor !== 'All' ? 1 : 0) + (roomFilters.occupancy !== 'All' ? 1 : 0);
  const typeFilterCount = (typeFilters.amenity.length ? 1 : 0) + (typeFilters.occupancy !== 'All' ? 1 : 0);
  const activeFilterCount = view === 'rooms' ? roomFilterCount : typeFilterCount;
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
  const roomTypeNames = Array.from(new Set(rooms.map((r) => r.typeName))).sort();

  const q = search.trim().toLowerCase();
  const visibleRooms = rooms.filter((r) => {
    if (roomFilters.amenity.length && !roomFilters.amenity.some((a) => r.amenities.includes(a))) return false;
    if (roomFilters.status !== 'All' && r.status !== roomFilters.status) return false;
    if (roomFilters.roomType !== 'All' && r.typeName !== roomFilters.roomType) return false;
    if (roomFilters.floor !== 'All' && r.floor !== Number(roomFilters.floor)) return false;
    if (roomFilters.occupancy !== 'All' && r.occupancy < Number(roomFilters.occupancy)) return false;
    if (q && !`${r.number} ${r.typeName} ${r.floor}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const visibleTypes = roomTypes.filter((rt) => {
    if (typeFilters.amenity.length && !typeFilters.amenity.some((a) => rt.amenities.includes(a))) return false;
    if (typeFilters.occupancy !== 'All' && rt.occupancy < Number(typeFilters.occupancy)) return false;
    if (q && !rt.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const clearFilters = () => (view === 'rooms' ? setRoomFilters(emptyRoomFilters) : setTypeFilters(emptyTypeFilters));

  const visibleIds = (view === 'rooms' ? visibleRooms : visibleTypes).map((x) => x.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allSelected) visibleIds.forEach((id) => next.delete(id));
    else visibleIds.forEach((id) => next.add(id));
    return next;
  });
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const confirmBulkDelete = () => {
    selected.forEach((id) => (view === 'rooms' ? removeRoom(id) : removeRoomType(id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const stats = [
    { title: 'Total rooms', Icon: BedDouble, value: String(counts.total), subtitle: `${counts.active} ${t('active')} · ${counts.inactive} ${t('inactive')}` },
    { title: 'Active rooms', Icon: CheckCircle, value: String(counts.active), subtitle: t('Bookable now') },
    { title: 'Inactive rooms', Icon: XCircle, value: String(counts.inactive), subtitle: t('Not bookable') },
    { title: 'Room types', Icon: Layers, value: String(counts.types), subtitle: t('Pricing tiers') },
  ];

  const emptyRoom = (): Room => ({ id: '', floor: 1, number: '', typeName: roomTypes[0]?.name ?? '', beds: 1, occupancy: 2, amenities: [], price: roomTypes[0]?.regularPrice ?? 0, status: 'Active' });

  const typePhoto = (name: string) => roomTypes.find((rt) => rt.name === name)?.photos[0];
  const ROOM_LABELS: Record<string, string> = { select: '', room: t('Room'), capacity: t('Capacity'), amenity: t('Amenity'), price: t('Price'), status: t('Status') };
  const TYPE_LABELS: Record<string, string> = { select: '', roomType: t('Room Type'), pricing: t('Pricing'), amenity: t('Amenity') };

  const renderHeader = (cols: ColumnDef[], labels: Record<string, string>, onResizeStart: (k: string, e: React.PointerEvent) => void) => (
    <tr className="group/head border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium select-none">
      {cols.map((c, i) => (
        <th key={c.key} className={`group/col relative py-4 font-medium text-[11px] tracking-wider uppercase transition-colors hover:bg-[var(--surface-subtle)] ${c.key === 'select' ? 'pl-6 pr-3' : 'px-6'}`}>
          {i > 0 && <ColLeftDivider />}
          {c.key === 'select' ? (
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle" aria-label={t('Select all')} />
          ) : (
            <span className="block truncate">{labels[c.key]}</span>
          )}
          {c.resizable !== false && <ColResizeHandle onPointerDown={(e) => onResizeStart(c.key, e)} />}
        </th>
      ))}
    </tr>
  );

  const SelectCell = ({ id }: { id: string }) => (
    <td className="pl-6 pr-3 py-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={selected.has(id)} onChange={() => toggleOne(id)} className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle" aria-label={t('Select row')} />
    </td>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Rooms')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Room types, pricing and individual rooms')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSetupOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] border border-[var(--border-default)] bg-white hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
            <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
            {t('Hotel setup')}
          </button>
          <button onClick={() => (view === 'rooms' ? setRoomEditor(emptyRoom()) : setTypeEditor(emptyRoomType()))} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            {view === 'rooms' ? t('Add Room') : t('Add Room Type')}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="inline-flex p-1 bg-[var(--surface-subtle)] rounded-md">
          {(['rooms', 'types'] as const).map((v) => (
            <button key={v} onClick={() => switchView(v)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${view === v ? 'bg-white text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {v === 'rooms' ? t('Rooms') : t('Room Types')}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={view === 'rooms' ? t('Search rooms...') : t('Search room types...')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {view === 'rooms' ? (
            <>
              <MultiSelect values={roomFilters.amenity} onChange={(v) => setRoomFilters((f) => ({ ...f, amenity: v }))} options={[...AMENITIES]} placeholder={t('Any amenity')} searchPlaceholder={t('Search amenity')} leftIcon={<Layers />} className="sm:w-auto min-w-[170px]" />
              <BrandSelect value={roomFilters.status} onValueChange={(v) => setRoomFilters((f) => ({ ...f, status: v as 'All' | RoomStatus }))} leftIcon={<CheckCircle />} className="sm:w-auto" options={[{ value: 'All', label: t('All Statuses') }, { value: 'Active', label: t('Active') }, { value: 'Inactive', label: t('Inactive') }]} />
              <BrandSelect value={roomFilters.roomType} onValueChange={(v) => setRoomFilters((f) => ({ ...f, roomType: v }))} leftIcon={<BedDouble />} className="sm:w-auto" options={[{ value: 'All', label: t('All room types') }, ...roomTypeNames.map((n) => ({ value: n, label: t(n) }))]} />
              <BrandSelect value={roomFilters.floor} onValueChange={(v) => setRoomFilters((f) => ({ ...f, floor: v }))} leftIcon={<Building />} className="sm:w-auto" options={[{ value: 'All', label: t('All floors') }, ...floors.map((fl) => ({ value: String(fl), label: `${t('Floor')} ${fl}` }))]} />
              <BrandSelect value={roomFilters.occupancy} onValueChange={(v) => setRoomFilters((f) => ({ ...f, occupancy: v }))} leftIcon={<Users />} className="sm:w-auto" options={[{ value: 'All', label: t('Any occupancy') }, ...OCCUPANCY_OPTIONS.map((o) => ({ value: o, label: `${o}+ ${t('guests')}` }))]} />
            </>
          ) : (
            <>
              <MultiSelect values={typeFilters.amenity} onChange={(v) => setTypeFilters((f) => ({ ...f, amenity: v }))} options={[...AMENITIES]} placeholder={t('Any amenity')} searchPlaceholder={t('Search amenity')} leftIcon={<Layers />} className="sm:w-auto min-w-[170px]" />
              <BrandSelect value={typeFilters.occupancy} onValueChange={(v) => setTypeFilters((f) => ({ ...f, occupancy: v }))} leftIcon={<Users />} className="sm:w-auto" options={[{ value: 'All', label: t('Any occupancy') }, ...OCCUPANCY_OPTIONS.map((o) => ({ value: o, label: `${o}+ ${t('guests')}` }))]} />
            </>
          )}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] cursor-pointer flex-shrink-0" title={t('Clear filters')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          {view === 'rooms' ? (
            <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
              <colgroup>{ROOM_COLS.map((c) => <col key={c.key} style={{ width: roomCols.widths[c.key] }} />)}</colgroup>
              <thead>{renderHeader(ROOM_COLS, ROOM_LABELS, roomCols.onResizeStart)}</thead>
              <tbody className="divide-y divide-[var(--surface-subtle)]">
                {visibleRooms.length === 0 ? (
                  <tr><td colSpan={ROOM_COLS.length} className="px-6 py-12 text-center text-[var(--text-secondary)]">{t('No rooms match these filters.')}</td></tr>
                ) : visibleRooms.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.02 }} onClick={() => navigate(`/hotel/rooms/${r.id}`)} className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
                    <SelectCell id={r.id} />
                    {/* Room: photo + number + floor·type */}
                    <td className="px-6 py-4 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <Thumb src={typePhoto(r.typeName)} label={r.typeName} />
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--text-primary)] tabular-nums truncate">{t('Room')} {r.number}</div>
                          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{t('Floor')} {r.floor} · {r.typeName}</div>
                        </div>
                      </div>
                    </td>
                    {/* Capacity */}
                    <td className="px-6 py-4 text-[var(--text-tertiary)]">
                      <span className="tabular-nums">{r.beds} {r.beds === 1 ? t('bed') : t('beds')} · {r.occupancy} {t('guests')}</span>
                    </td>
                    <td className="px-6 py-4 overflow-hidden"><Amenities items={r.amenities} /></td>
                    <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums font-medium">{formatPrice(r.price)}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyles(r.status)}`}>{t(r.status)}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
              <colgroup>{TYPE_COLS.map((c) => <col key={c.key} style={{ width: typeCols.widths[c.key] }} />)}</colgroup>
              <thead>{renderHeader(TYPE_COLS, TYPE_LABELS, typeCols.onResizeStart)}</thead>
              <tbody className="divide-y divide-[var(--surface-subtle)]">
                {visibleTypes.length === 0 ? (
                  <tr><td colSpan={TYPE_COLS.length} className="px-6 py-12 text-center text-[var(--text-secondary)]">{t('No room types found.')}</td></tr>
                ) : visibleTypes.map((rt, i) => (
                  <motion.tr key={rt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.02 }} onClick={() => navigate(`/hotel/room-types/${rt.id}`)} className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
                    <SelectCell id={rt.id} />
                    {/* Room type: photo + name + beds·sleeps */}
                    <td className="px-6 py-4 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <Thumb src={rt.photos[0]} label={rt.name} size="w-11 h-11" />
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--text-primary)] truncate">{rt.name}</div>
                          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5 tabular-nums">{totalBeds(rt)} {totalBeds(rt) === 1 ? t('bed') : t('beds')} · {rt.occupancy} {t('guests')}</div>
                        </div>
                      </div>
                    </td>
                    {/* Pricing: regular + weekend/session */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--text-primary)] tabular-nums">{formatPrice(rt.regularPrice)}</div>
                      <div className="text-xs text-[var(--text-secondary)] tabular-nums mt-0.5">
                        {rt.weekendEnabled ? `${t('Wknd')} ${formatPrice(rt.weekendPrice)}` : t('No weekend')}
                        {rt.sessionEnabled ? ` · ${t('Sess')} ${formatPrice(rt.sessionPrice)}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 overflow-hidden"><Amenities items={rt.amenities} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          <span className="text-sm text-[var(--text-secondary)]">{view === 'rooms' ? `${visibleRooms.length} ${t('rooms')}` : `${visibleTypes.length} ${t('room types')}`}</span>
        </div>
      </div>

      {/* Editors */}
      <AnimatePresence>
        {roomEditor && <RoomEditor initial={roomEditor} roomTypes={roomTypes} onClose={() => setRoomEditor(null)} onSave={(r) => { upsertRoom(r.id ? r : { ...r, id: `rm-${Date.now()}` }); setRoomEditor(null); }} />}
        {typeEditor && <RoomTypeEditor initial={typeEditor} onClose={() => setTypeEditor(null)} onSave={(rt) => { upsertRoomType(rt); setTypeEditor(null); }} />}
      </AnimatePresence>

      <AnimatePresence>
        {setupOpen && <HotelSetupWizard onClose={() => setSetupOpen(false)} />}
      </AnimatePresence>

      {/* Bulk delete confirm */}
      <Portal>
        <AnimatePresence>
          {bulkDeleting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4" onClick={() => setBulkDeleting(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: 'spring', duration: 0.3 }} className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-[var(--surface-subtle)]"><h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Delete')} {selected.size} {view === 'rooms' ? t('rooms') : t('room types')}?</h2></div>
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
    </motion.div>
  );
}
