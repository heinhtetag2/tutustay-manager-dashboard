import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, ChevronRight, MapPin, Star, Heart, Wifi, SignalHigh, BatteryMedium, X, Megaphone, Tag, Info, Clock, Check, SquarePen, Send } from 'lucide-react';

/* ============================================================================
   MobileDemoModal — a phone mockup that previews the TutuStay *guest* app.
   Switchable screens: "Favourites" (အကြိုက်ဆုံး), "My reviews"
   (ကျွန်ုပ်၏ သုံးသပ်ချက်များ), "FAQ" (မေးလေ့ရှိသော မေးခွန်းများ) and
   "Announcements" (အသိပေးချက်များ). Decorative demo only, opened from login.
   ============================================================================ */

const BLUE = '#1488C8';

type ScreenKey = 'favourites' | 'reviews' | 'faq' | 'announcements' | 'qa';

const SCREENS: { key: ScreenKey; label: string; title: string }[] = [
  { key: 'favourites', label: 'Favourites', title: 'အကြိုက်ဆုံး' },
  { key: 'reviews', label: 'Reviews', title: 'ကျွန်ုပ်၏ သုံးသပ်ချက်များ' },
  { key: 'faq', label: 'FAQ', title: 'မေးလေ့ရှိသော မေးခွန်းများ' },
  { key: 'announcements', label: 'Announcements', title: 'အသိပေးချက်များ' },
  { key: 'qa', label: 'Q&A', title: 'မေး & ဖြေ' },
];

type QaItem = { q: string; status: 'pending' | 'answered'; date: string; answer?: string };

const QA: QaItem[] = [
  { q: 'Is airport pickup available at Golden Bay Resort?', status: 'answered', date: '2026-06-22', answer: 'Yes — free shuttle for stays of 2+ nights. Share your flight time after booking.' },
  { q: 'Can I check in earlier than 2 PM?', status: 'answered', date: '2026-06-15', answer: 'Early check-in from 11 AM is subject to availability and may carry a small fee.' },
  { q: 'Hello', status: 'pending', date: '2026-06-10' },
];

const QA_STATUS: Record<QaItem['status'], { label: string; pill: string; icon: typeof Clock }> = {
  pending: { label: 'စောင့်ဆိုင်းဆဲ', pill: 'bg-amber-50 text-amber-600', icon: Clock },
  answered: { label: 'ဖြေဆိုပြီး', pill: 'bg-emerald-50 text-emerald-600', icon: Check },
};

type Announcement = { tag: 'Promo' | 'Update' | 'Notice'; title: string; date: string; body: string; unread?: boolean };

const ANNOUNCEMENTS: Announcement[] = [
  { tag: 'Promo', title: 'Monsoon escape — up to 30% off', date: '2026-06-24', body: 'Book a beach or lake stay before 15 July and save up to 30% on selected resorts in Ngapali and Inle.', unread: true },
  { tag: 'Update', title: 'New: Pay at property on more stays', date: '2026-06-18', body: 'You can now reserve eligible rooms without paying upfront and settle the balance at check-in.', unread: true },
  { tag: 'Notice', title: 'this is the way', date: '2026-06-10', body: 'Scheduled maintenance is complete. Thanks for your patience while we improved booking performance.' },
];

const TAG_STYLES: Record<Announcement['tag'], { tile: string; icon: typeof Megaphone }> = {
  Promo: { tile: 'bg-amber-50 text-amber-600', icon: Tag },
  Update: { tile: 'bg-[#1488C8]/[0.10] text-[#1488C8]', icon: Info },
  Notice: { tile: 'bg-neutral-100 text-neutral-500', icon: Megaphone },
};

const FAQ_CATS = ['All', 'Billing & Payment', 'Accommodation', 'Booking'];

const FAQS: { cat: string; q: string; a: string }[] = [
  { cat: 'Booking', q: 'How do I make a booking?', a: 'Browse a property, choose your dates and room type, then tap Book now. You’ll get a confirmation in-app and by email once the host approves it.' },
  { cat: 'Booking', q: 'Can I cancel or change my reservation?', a: 'Yes. Open the booking from My trips and tap Manage. Whether changes are free depends on the property’s cancellation policy, shown at checkout.' },
  { cat: 'Billing & Payment', q: 'What payment methods are accepted?', a: 'KBZPay, Wave Money and Visa / Mastercard. On eligible stays you can also choose Pay at property.' },
  { cat: 'Billing & Payment', q: 'When will I be charged?', a: 'For most stays you’re charged once the host confirms. Non-refundable rates are charged immediately at booking.' },
  { cat: 'Accommodation', q: 'How do I contact the property?', a: 'Once your booking is confirmed, the property’s phone number and address appear on the booking detail screen.' },
];

type Review = { name: string; type: string; loc: string; img: string; rating: number; time: string; text: string };

const REVIEWS: Review[] = [
  { name: 'Dori Hotel', type: 'Hotel', loc: 'Yangon', img: '/demo-room.jpg', rating: 3, time: '16 secs ago', text: 'Nice' },
  { name: 'Shwe Taung', type: 'Motel / Guest house', loc: 'Yangon', img: '/demo-hotel-3.jpg', rating: 5, time: '2 days ago', text: 'Clean rooms and the staff were very friendly. Great value for the price — would book again.' },
  { name: 'Golden Bay Resort', type: 'Resort', loc: 'Ngapali', img: '/demo-hotel-1.jpg', rating: 4, time: '1 week ago', text: 'Beautiful pool and ocean view. Breakfast could be a little better but overall a lovely stay.' },
  { name: 'Inle Lake View', type: 'Hotel', loc: 'Nyaung Shwe', img: '/demo-hotel-2.jpg', rating: 4, time: '3 weeks ago', text: 'Peaceful location with a stunning sunset over the lake. Comfortable bed and quiet rooms.' },
];

/** A 5-star row with `value` filled (gold) stars; the rest outlined. */
function Stars({ value, size = 'w-5 h-5' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < value ? 'text-amber-400' : 'text-neutral-300'}`}
          fill={i < value ? 'currentColor' : 'none'}
          strokeWidth={1.75}
        />
      ))}
    </div>
  );
}

function FavouritesScreen() {
  return (
    <div className="px-4 pt-4">
      <div className="flex gap-3">
        <img src="/demo-room.jpg" alt="Shwe Taung room" className="w-[88px] h-[88px] rounded-xl object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[12px] text-neutral-500 leading-tight">Motel / Guest house</div>
              <div className="text-[18px] font-bold text-neutral-900 leading-tight">Shwe Taung</div>
            </div>
            <Heart className="w-6 h-6 shrink-0" style={{ color: BLUE, fill: BLUE }} />
          </div>
          <div className="flex items-center gap-1 text-[12.5px] text-neutral-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Yangon, yangon, Myanmar</span>
          </div>
          <div className="text-[12.5px] text-neutral-500 leading-tight">အသုံးပြုနိုင်ပါသည်</div>
          <div className="flex items-end justify-between mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
              <span className="text-[15px] text-neutral-700">4.6</span>
            </div>
            <div className="text-[16px] font-bold text-neutral-900">MMK70,000</div>
          </div>
        </div>
      </div>
      <div className="border-b border-neutral-200 mt-4" />
    </div>
  );
}

function ReviewsScreen() {
  return (
    <div className="pb-4">
      {/* Review cards */}
      <div className="px-4 pt-4 space-y-3">
        {REVIEWS.map((r) => (
          <div key={r.name} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex gap-3">
              <img src={r.img} alt={r.name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-neutral-900 truncate leading-tight">{r.name}</div>
                    <div className="text-[11.5px] text-neutral-500 truncate">{r.type} · {r.loc}</div>
                  </div>
                  <div className="text-[11px] text-neutral-400 shrink-0 whitespace-nowrap">{r.time}</div>
                </div>
                <div className="mt-1"><Stars value={r.rating} size="w-3.5 h-3.5" /></div>
              </div>
            </div>
            <p className="text-[12.5px] text-neutral-700 leading-snug mt-2">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsScreen() {
  return (
    <div className="pb-4">
      <div className="px-4 pt-4 space-y-2.5">
        {ANNOUNCEMENTS.map((a) => {
          const { tile, icon: Icon } = TAG_STYLES[a.tag];
          return (
            <button
              key={a.title}
              className="group w-full text-left flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 active:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tile}`}>
                <Icon className="w-3 h-3" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-medium text-neutral-900 truncate">{a.title}</span>
                  {a.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#1488C8] shrink-0" aria-label="Unread" />}
                </div>
                <p className="text-[12px] text-neutral-500 truncate mt-0.5">{a.body}</p>
                <span className="text-[11px] text-neutral-400 tabular-nums">{a.date}</span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-neutral-300 group-active:text-neutral-400 mt-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QaScreen() {
  return (
    <div className="pb-4">
      <div className="px-4 pt-4 space-y-2.5">
        {QA.map((item) => {
          const s = QA_STATUS[item.status];
          const Icon = s.icon;
          return (
            <button
              key={item.q}
              className="group w-full text-left rounded-xl border border-neutral-200 bg-white px-3.5 py-3 active:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[14px] font-medium text-neutral-900 leading-snug min-w-0">{item.q}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-neutral-300 group-active:text-neutral-400 mt-0.5" />
              </div>
              {item.answer && <p className="mt-1 text-[12px] text-neutral-500 leading-snug line-clamp-2">{item.answer}</p>}
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${s.pill}`}>
                  <Icon className="w-3 h-3" strokeWidth={2.25} />
                  {s.label}
                </span>
                <span className="text-[11px] text-neutral-400 tabular-nums">{item.date}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QaComposeScreen({ onSubmit }: { onSubmit: () => void }) {
  const [text, setText] = useState('');
  const ready = text.trim().length > 0;
  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Property selector */}
      <div>
        <label className="block text-[12px] font-medium text-neutral-500 mb-1.5">
          Property <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <button className="w-full flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left active:bg-neutral-50 transition-colors cursor-pointer">
          <span className="text-[13.5px] text-neutral-400">Choose a property</span>
          <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400" />
        </button>
      </div>

      {/* Question */}
      <div>
        <label className="block text-[12px] font-medium text-neutral-500 mb-1.5">Your question</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="What would you like to ask? e.g. Is breakfast included?"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 resize-none outline-none focus:border-[#1488C8] focus:ring-2 focus:ring-[#1488C8]/20 transition-shadow"
        />
        <p className="mt-1.5 text-[11.5px] text-neutral-400">Our team usually replies within 24 hours.</p>
      </div>

      {/* Submit */}
      <button
        onClick={ready ? onSubmit : undefined}
        disabled={!ready}
        style={ready ? { background: BLUE } : undefined}
        className="w-full h-11 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" strokeWidth={2} />
        မေးခွန်းပို့မည်
      </button>
    </div>
  );
}

function FaqScreen() {
  const [cat, setCat] = useState('All');
  const [openKey, setOpenKey] = useState<string | null>(FAQS[0].q);
  const items = FAQS.filter((f) => cat === 'All' || f.cat === cat);

  return (
    <div className="pb-4">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {FAQ_CATS.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors cursor-pointer ${
                on ? 'border-[#1488C8] text-[#1488C8] bg-[#1488C8]/[0.06]' : 'border-neutral-300 text-neutral-600 bg-white'
              }`}
            >
              {c === 'All' ? 'အားလုံး' : c}
            </button>
          );
        })}
      </div>

      {/* Card accordion — each FAQ in its own bordered card */}
      <div className="flex flex-col gap-2.5 px-4">
        {items.map((f) => {
          const on = openKey === f.q;
          return (
            <div
              key={f.q}
              className={`rounded-2xl border bg-white overflow-hidden transition-colors ${
                on ? 'border-[#1488C8] shadow-sm' : 'border-neutral-200'
              }`}
            >
              <button
                onClick={() => setOpenKey(on ? null : f.q)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"
              >
                <span className="text-[14.5px] font-medium text-neutral-900 leading-snug">{f.q}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    on ? 'rotate-180 text-[#1488C8]' : 'text-neutral-400'
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p className="text-[13px] text-neutral-600 leading-relaxed px-4 pb-4 -mt-0.5">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MobileDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [screen, setScreen] = useState<ScreenKey>('favourites');
  const [composing, setComposing] = useState(false);
  const active = SCREENS.find((s) => s.key === screen)!;
  const headerTitle = composing ? 'မေးခွန်းအသစ်' : active.title;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Device frame */}
            <div className="w-[320px] rounded-[2.2rem] bg-[#0d0d12] p-2.5 shadow-2xl ring-1 ring-white/10">
              <div className="relative flex flex-col w-full overflow-hidden rounded-[1.7rem] bg-white" style={{ aspectRatio: '9 / 19' }}>
                {/* Status + app bar (blue) */}
                <div style={{ background: BLUE }} className="text-white shrink-0">
                  <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[12px] font-medium tabular-nums">
                    <span>1:49</span>
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" />
                      <SignalHigh className="w-3.5 h-3.5" />
                      <span className="flex items-center gap-0.5"><BatteryMedium className="w-4 h-4" />48%</span>
                    </span>
                  </div>
                  <div className="relative flex items-center justify-center px-10 h-12">
                    <button
                      onClick={() => composing && setComposing(false)}
                      aria-label="Back"
                      className={`absolute left-3 ${composing ? 'cursor-pointer' : 'pointer-events-none'}`}
                    >
                      <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                    <span className="text-[16px] font-semibold tracking-wide text-center leading-tight">{headerTitle}</span>
                  </div>
                </div>

                {/* Scrollable body — swaps per screen */}
                <div className="flex-1 overflow-y-auto bg-neutral-50/40 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={composing ? 'qa-compose' : screen}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                    >
                      {composing ? (
                        <QaComposeScreen onSubmit={() => setComposing(false)} />
                      ) : screen === 'favourites' ? <FavouritesScreen /> : screen === 'reviews' ? <ReviewsScreen /> : screen === 'faq' ? <FaqScreen /> : screen === 'announcements' ? <AnnouncementsScreen /> : <QaScreen />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Compose FAB — Q&A list only */}
                {screen === 'qa' && !composing && (
                  <button
                    onClick={() => setComposing(true)}
                    aria-label="Ask a question"
                    style={{ background: BLUE }}
                    className="absolute bottom-16 right-3.5 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
                  >
                    <SquarePen className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}

                {/* Android nav bar */}
                <div className="shrink-0 bg-neutral-50 border-t border-neutral-200">
                  <div className="flex items-center justify-around px-10 py-3 text-neutral-500">
                    <span className="w-3.5 h-3.5 border-2 border-current rounded-[3px]" />
                    <span className="w-4 h-4 border-2 border-current rounded-full" />
                    <span className="w-0 h-0 border-y-[7px] border-y-transparent border-r-[11px] border-r-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen switcher */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {SCREENS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setScreen(s.key); setComposing(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    screen === s.key ? 'bg-white text-[var(--text-primary)]' : 'bg-white/15 text-white/80 hover:bg-white/25'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-white/60">Guest app preview · TutuStay</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
