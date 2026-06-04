// src/components/MapComponent.tsx

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../requests.ts';
import './MeetMap.css';

// Оставил интерфейс и вспомогательные функции неизменными
interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

function addMinutes(timeStr: string, minutes: number) {
  const [hours, mins] = timeStr.split(':').map(Number);
  let totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

function extractTime(isoString: string) {
  const match = isoString.match(/\d\d:\d\d/);
  return match ? match[0] : '';
}

export function MapComponent({ lat, lng, zoom }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  /* 🔥 Главное изменение */
  useEffect(() => {
    async function initMap() {
      // Динамически подгружаем Leaflet только в браузере
      const L = await import('leaflet');

      const placeIcon = L.default.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pin"></div>
          <div class="marker-text">${places.length}</div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40],
      });

      const map = L.default.map(mapRef.current!).setView([lat, lng], zoom);
      mapInstance.current = map;

      L.default
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 })
        .addTo(map);

      markersRef.current = places.map(place => {
        const meetsList = place.meets
          .map(m => `<li>${extractTime(m.startedAt)} - ${addMinutes(extractTime(m.startedAt), 90)}: ${m.title}</li>`)
          .join('');

        const marker = L.default
          .marker([place.latitude, place.longitude], {
            icon: placeIcon,
            title: place.title,
          })
          .addTo(map).bindPopup(`
              <div class="place-popup">
                  <h4><b>${place.title}</b></h4>
                  <ul>${meetsList}</ul>
                  <p>Адрес: ${place.address}</p>
              </div>
            `);

        marker.on('click', () => map.setView([place.latitude, place.longitude], 14));
        return marker;
      });
    }

    if (mapRef.current && !mapInstance.current) {
      void initMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
      }
    };
  }, [lat, lng, zoom, places]); // ⚠️ Без изменений в deps!

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '75vh',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    />
  );
}
