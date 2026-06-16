import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../requests.ts';
import { useEffect, useRef } from 'react';
import { BaseMap, type MapContext } from './BaseMap.tsx';
import type { PlaceDto } from '@shared/types';
import { createRoot } from 'react-dom/client';

export interface PlaceMapProps {
  lat: number;
  lng: number;
  zoom: number;
  onClick: (place: PlaceDto) => void;
}

export function PlaceMap({ lat, lng, zoom, onClick }: PlaceMapProps) {
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  function usePlaceLayer({ mapInstance, leafletRef, isReady }: MapContext) {
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

      places.forEach((place: PlaceDto) => {
        const marker = L.marker([Number(place.latitude), Number(place.longitude)], { icon: getPlaceIcon(place.meets.length) });

        marker.on('popupopen', e => {
          const container = document.createElement('div');
          const root = createRoot(container);

          root.render(
            <div className="place-popup">
              <h4>{place.title}</h4>
              <p>Адрес: {place.address}</p>
              <p>от: {place.priceFrom} руб/час</p>
              <button onClick={() => onClick(place)}>Выбрать</button>
            </div>,
          );

          e.popup.setContent(container);
        });

        marker.bindPopup(''); // важно: popup должен быть создан

        marker.addTo(markersRef.current!);
      });
    }, [places, isReady]);
  }

  return <BaseMap lat={lat} lng={lng} zoom={zoom} useLayer={usePlaceLayer} />;
}
