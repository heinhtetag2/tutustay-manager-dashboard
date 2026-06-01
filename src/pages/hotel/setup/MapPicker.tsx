import { useEffect, useRef } from 'react';
import { LocateFixed } from 'lucide-react';

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
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const hasPin = lat != null && lng != null;

  // Init once.
  useEffect(() => {
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
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div ref={elRef} className="h-60 w-full rounded-lg overflow-hidden border border-[var(--border-default)] z-0" role="application" aria-label="Location map" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          {hasPin ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : 'Click the map to place your hotel'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((p) =>
              onChangeRef.current(Number(p.coords.latitude.toFixed(5)), Number(p.coords.longitude.toFixed(5))),
            );
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          Use my location
        </button>
      </div>
    </div>
  );
}
