import { useEffect, useRef } from 'react';
import { extractTime, addMinutes } from '../../utils/time';
import type { PlaceDto } from '@shared/types';

export function useMarkers({ mapInstance, leafletRef, places, lat, lng, zoom, isReady }: any) {
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!isReady || !mapInstance.current || !leafletRef.current) return;

    const L = leafletRef.current;

    if (!markersGroupRef.current) {
      markersGroupRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    const getPlaceIcon = (count: number) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin${!count ? ' marker-pin-empty' : ''}"></div>
               <div class="marker-text">${count || ''}</div>`,
        iconSize: [30, 42],
      });

    markersGroupRef.current?.clearLayers();

    places.forEach((place: PlaceDto) => {
      const meetsList = place.meets
        .map(
          meet =>
            `<li>
              <span>${extractTime(meet.startedAt)} - ${addMinutes(extractTime(meet.startedAt), 90)}</span>
              <a href="/project/${meet.projectId}">${meet.project?.title}</a>
            </li>`,
        )
        .join('');

      const marker = L.marker([Number(place.latitude), Number(place.longitude)], { icon: getPlaceIcon(place.meets.length) }).bindPopup(`
        <div class="place-popup">
          <h4><b>${place.title}</b></h4>
          <ul>${meetsList}</ul>
          <p>Адрес: ${place.address}</p>
        </div>
      `);

      marker.addTo(markersGroupRef.current!);
    });

    mapInstance.current.flyTo([lat, lng], zoom, { animate: true });
  }, [places, lat, lng, zoom, isReady]);
}
