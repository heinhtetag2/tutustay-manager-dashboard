import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocateFixed, Loader2, MapPin } from 'lucide-react';

/**
 * Real interactive map via Leaflet + OpenStreetMap tiles. No API key required
 * (loaded from CDN on first use). Click or drag the pin to set the location;
 * the chosen point is reported back as lat/lng.
 */

const DEFAULT = { lat: 16.8409, lng: 96.1735 }; // Yangon

// Brand-coloured teardrop marker (matches the design system).
const PIN_HTML = `
<svg width="30" height="38" viewBox="0 0 30 38" style="filter:drop-shadow(0 3px 4px rgba(44,38,39,.35))">
  <path d="M15 0C6.716 0 0 6.716 0 15c0 9.5 12 21 14.1 22.96a1.3 1.3 0 0 0 1.8 0C18 36 30 24.5 30 15 30 6.716 23.284 0 15 0Z" fill="var(--brand-primary)"/>
  <circle cx="15" cy="15" r="5.5" fill="#fff"/>
</svg>`;

// Restyle Leaflet's default controls to match the design system (once).
function injectMapStyles() {
  if (typeof document === 'undefined' || document.querySelector('style[data-map-picker]')) return;
  const s = document.createElement('style');
  s.setAttribute('data-map-picker', '');
  s.textContent = `
    .leaflet-control-zoom { border:none !important; box-shadow:0 1px 4px rgba(44,38,39,.14) !important; border-radius:10px !important; overflow:hidden; margin:12px !important; }
    .leaflet-control-zoom a { width:30px; height:30px; line-height:30px; color:var(--text-secondary); border:none !important; background:#fff; font-weight:400; }
    .leaflet-control-zoom a:first-child { border-bottom:1px solid var(--surface-subtle) !important; }
    .leaflet-control-zoom a:hover { background:var(--surface-subtle); color:var(--text-primary); }
    .leaflet-bar { border:none !important; }
    .leaflet-control-attribution { font-size:10px; background:rgba(255,255,255,.82); border-radius:6px 0 0 0; }
  `;
  document.head.appendChild(s);
}

let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet', '');
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const { t } = useTranslation();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const hasPin = lat != null && lng != null;

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Init once.
  useEffect(() => {
    injectMapStyles();
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !elRef.current || mapRef.current) return;
        const start: [number, number] = hasPin ? [lat!, lng!] : [DEFAULT.lat, DEFAULT.lng];
        const map = L.map(elRef.current, { center: start, zoom: 14, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        const icon = L.divIcon({
          html: PIN_HTML,
          className: 'border-0 bg-transparent',
          iconSize: [30, 38],
          iconAnchor: [15, 38],
        });
        const marker = L.marker(start, { draggable: true, icon }).addTo(map);
        marker.on('dragend', () => {
          const p = marker.getLatLng();
          onChangeRef.current(Number(p.lat.toFixed(5)), Number(p.lng.toFixed(5)));
        });
        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          onChangeRef.current(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
        });
        mapRef.current = map;
        markerRef.current = marker;
        setTimeout(() => map.invalidateSize(), 0);
        // Seed a value if none was set yet so the field is valid.
        if (!hasPin) onChangeRef.current(DEFAULT.lat, DEFAULT.lng);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (Use my location / Reset) onto the map.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return;
    const cur = markerRef.current.getLatLng();
    if (Math.abs(cur.lat - lat) > 1e-6 || Math.abs(cur.lng - lng) > 1e-6) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 15), { duration: 0.6 });
    }
  }, [lat, lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t('Location is not available on this device.'));
      return;
    }
    setGeoError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        onChangeRef.current(Number(p.coords.latitude.toFixed(5)), Number(p.coords.longitude.toFixed(5)));
        setLocating(false);
      },
      () => {
        setGeoError(t('Could not get your location. Allow location access and try again.'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <div
          ref={elRef}
          className="h-64 w-full rounded-xl overflow-hidden border border-[var(--border-default)] z-0"
          role="application"
          aria-label={t('Location map')}
        />
        {/* Prominent "use my location" control, overlaid on the map */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--text-primary)] bg-white rounded-lg border border-[var(--border-default)] shadow-sm hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
          {locating ? t('Locating…') : t('Use my location')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          {hasPin ? (
            <span className="tabular-nums text-[var(--text-primary)] font-medium">{lat!.toFixed(5)}, {lng!.toFixed(5)}</span>
          ) : (
            t('Click the map to drop a pin')
          )}
        </span>
        {geoError && <span className="text-xs text-[var(--danger,#d4493f)]">{geoError}</span>}
      </div>
    </div>
  );
}
