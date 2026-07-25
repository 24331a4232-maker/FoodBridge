import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const userIcon = L.divIcon({
  html: '<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #2563eb"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

const donorIcon = L.divIcon({
  html: '<div style="background:#16a34a;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #16a34a"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
});

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  popup?: string;
  type?: 'user' | 'donor' | 'default';
}

interface LeafletMapProps {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
  showRoute?: boolean;
  routeCoords?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
}

export function LeafletMap({
  points = [],
  center = [12.9716, 77.5946],
  zoom = 12,
  className = '',
  height = 'h-64',
  showRoute = false,
  routeCoords = [],
  onMapClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((p) => {
      const icon = p.type === 'user' ? userIcon : p.type === 'donor' ? donorIcon : defaultIcon;
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      if (p.popup) marker.bindPopup(p.popup);
      else if (p.label) marker.bindPopup(p.label);
      markersRef.current.push(marker);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
    }
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }
    if (showRoute && routeCoords.length >= 2) {
      routeRef.current = L.polyline(routeCoords, {
        color: '#16a34a',
        weight: 4,
        opacity: 0.7,
        dashArray: '8,8',
      }).addTo(map);
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
    }
  }, [showRoute, routeCoords]);

  return <div ref={containerRef} className={`rounded-2xl overflow-hidden z-0 ${height} ${className}`} />;
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
