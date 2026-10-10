import type { PlaceDto } from 'entities';
import { useEffect } from 'react';
import { BaseMap, type MapContext } from './BaseMap.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../requests.ts';
import { addMinutes, extractTime } from '../../utils/time.ts';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

export function MeetMap({ lat, lng, zoom }: Props) {
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  return (
    <BaseMap lat={lat} lng={lng} zoom={zoom}>
      {context => <MeetLayer {...context} places={places} />}
    </BaseMap>
  );
}

function MeetLayer({ mapInstance, leafletRef, isReady, places }: MapContext & { places: PlaceDto[] }) {
  useEffect(() => {
    if (!isReady || !mapInstance.current || !leafletRef.current) {
      return;
    }

    const L = leafletRef.current;
    const map = mapInstance.current;

    const markers = L.layerGroup().addTo(map);

    const getPlaceIcon = (count: number) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div class="marker-pin${!count ? ' marker-pin-empty' : ''}"></div>
            <div class="marker-text">
              ${count || ''}
            </div>
          `,
        iconSize: [30, 42],
      });

    places.forEach(place => {
      const meetsList = (place.meets || [])
        .map(
          meet => `
              <li>
                <span>
                  ${extractTime(meet.startedAt)}
                  -
                  ${addMinutes(extractTime(meet.startedAt), 90)}
                </span>
                <a href="/project/${meet.projectId}">
                  Уточнить надо
                </a>
              </li>
            `,
        )
        .join('');

      const marker = L.marker([Number(place.latitude), Number(place.longitude)], {
        icon: getPlaceIcon(place.meets?.length || 0),
      }).bindPopup(`
          <div class="place-popup">
            <h4>
              <b>${place.title}</b>
            </h4>

            <ul>
              ${meetsList}
            </ul>

            <p>
              Адрес: ${place.address}
            </p>
          </div>
        `);

      marker.addTo(markers);
    });

    return () => {
      markers.remove();
    };
  }, [places, isReady, mapInstance, leafletRef]);
  return null;
}
