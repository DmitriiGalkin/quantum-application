// src/components/MapComponent.tsx

import React, { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../requests.ts';
import './MeetMap.css';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

function addMinutes(timeStr, minutes) {
  // Парсим часы и минуты из строки
  const [hours, mins] = timeStr.split(':').map(Number);

  // Суммируем минуты
  let totalMinutes = hours * 60 + mins + minutes;

  // Высчитываем новые часы и минуты
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  // Форматируем результат с ведущими нулями
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

function extractTime(isoString) {
  // Регулярное выражение для выделения часов и минут
  const match = isoString.match(/\d\d:\d\d/);

  // Если совпадение есть, возвращаем его
  return match ? match[0] : '';
}

export function MapComponent({ lat, lng, zoom }: Props) {
  const mapRef = useRef<HTMLElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });
  console.log(places, 'places');

  useEffect(() => {
    if (!mapRef.current) return;

    const placeIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<div class="marker-pin"></div><div class="marker-text">' + 2 + '</div>',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -40],
    });

    // Создаем карту
    const map = L.map(mapRef.current).setView([lat, lng], zoom);
    mapInstance.current = map;

    // Добавляем слой плитки (карта)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = places.map(place => {
      const meetsList = place.meets
        .map(meet => `<li>${extractTime(meet.startedAt)} - ${addMinutes(extractTime(meet.startedAt), 90)}: ${meet.title}</li>`)
        .join('\n'); // Соединяем пункты списка

      const marker = L.marker([place.latitude, place.longitude], {
        icon: placeIcon,
        title: place.title,
      }).addTo(map).bindPopup(`
          <div class="place-popup">
            <h4><b>${place.title}</b></h4>
            <ul>
                ${meetsList}
            </ul>
            <p>Адрес: ${place.address}</p>
          </div>
        `);

      marker.on('click', () => {
        map.setView([place.latitude, place.longitude], 14);
      });

      return marker;
    });

    return () => map.remove(); // Очистка при размонтировании
  }, [lat, lng, zoom, places]);

  return <div ref={mapRef} style={{ width: '100vw', height: '75vh' }}></div>;
}
