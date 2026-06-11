import { useEffect, useRef } from 'react';
import { BaseMap, type MapContext } from './BaseMap.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../requests.ts';
import type { PlaceDto } from '@shared/types';
import { addMinutes, extractTime } from '../../utils/time.ts';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

export function MeetMap({ lat, lng, zoom }: Props) {
  const { data: meets = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  function useMeetLayer({ mapInstance, leafletRef, isReady }: MapContext) {
    const markersRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
      if (!isReady || !mapInstance.current || !leafletRef.current) return;

      const L = leafletRef.current;

      if (!markersRef.current) {
        markersRef.current = L.layerGroup().addTo(mapInstance.current);
      }

      const getPlaceIcon = (count: number) =>
        L.divIcon({
          className: 'custom-map-marker',
          html: `<div class="marker-pin${!count ? ' marker-pin-empty' : ''}"></div>
               <div class="marker-text">${count || ''}</div>`,
          iconSize: [30, 42],
        });

      markersRef.current.clearLayers();

      meets.forEach((place: PlaceDto) => {
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

        marker.addTo(markersRef.current!);
      });
    }, [meets, isReady]);
  }

  return <BaseMap lat={lat} lng={lng} zoom={zoom} useLayer={useMeetLayer} />;
}
