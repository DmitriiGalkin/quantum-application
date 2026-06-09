import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../requests.ts';
import './MeetMap.css';

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
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null); // Группа для маркеров
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  // Эффект №1: Создание карты (один раз)
  useEffect(() => {
    async function createMap() {
      const L = await import('leaflet');
      leafletRef.current = L;

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: zoom,
        scrollWheelZoom: false, // Опционально
        attributionControl: false,
      });

      L.control
        .attribution({
          prefix: false,
        })
        .addTo(map);

      map.attributionControl.addAttribution('© OpenStreetMap');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      mapInstance.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    if (!mapInstance.current && mapRef.current) {
      void createMap(); // Ждем завершения загрузки Leaflet
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove(); // ✅ Правильный метод уничтожения карты
      }
    };
  }, []);

  // Эффект №2: Обновление данных и камеры
  useEffect(() => {
    if (!mapInstance.current || !markersGroupRef.current || !leafletRef.current) return;

    const L = leafletRef.current;

    const getPlaceIcon = (count: number) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin${!count ? ' marker-pin-empty' : ''}"></div><div class="marker-text">${count || ''}</div>`,
        iconSize: [30, 42],
      });

    // Удаляем старые маркеры
    markersGroupRef.current.clearLayers();

    // Ставим новые
    places.forEach(place => {
      const meetsList = place.meets
        .map(
          m =>
            `<li><span>${extractTime(m.startedAt)} - ${addMinutes(extractTime(m.startedAt), 90)}</span> <a href="/project/${m.projectId}">${m.title}</a></li>`,
        )
        .join('');
      const marker = L.marker([place.latitude, place.longitude], { icon: getPlaceIcon(place.meets.length) }).bindPopup(`<div class="place-popup">
                  <h4><b>${place.title}</b></h4>
                  <ul>${meetsList}</ul>
                  <p>Адрес: ${place.address}</p>
              </div>`);

      marker.addTo(markersGroupRef.current as any);
    });

    // Перемещаемся плавно
    mapInstance.current.flyTo([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, places]);

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
