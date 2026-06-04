// src/components/MapComponent.tsx

import React, { useEffect, useRef } from 'react';
import L, { Map as LeafletMap } from 'leaflet';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

export function MapComponent({ lat, lng, zoom }: Props) {
  const mapRef = useRef<HTMLElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Создаем карту
    const map = L.map(mapRef.current).setView([lat, lng], zoom);
    mapInstance.current = map;

    // Добавляем слой плитки (карта)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => map.remove(); // Очистка при размонтировании
  }, [lat, lng, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>;
}
