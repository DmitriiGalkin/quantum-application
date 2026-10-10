import { getBrowser } from '../../shared/lib/browser.ts';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../requests.ts';
import { useEffect } from 'react';
import { BaseMap, type MapContext } from './BaseMap.tsx';
import type { PlaceDto } from 'entities';
import { createRoot, type Root } from 'react-dom/client';

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

  if (!places.length) return <div>Загрузка мест...</div>;

  return (
    <BaseMap lat={lat} lng={lng} zoom={zoom}>
      {context => <PlaceLayer {...context} places={places} onClick={onClick} />}
    </BaseMap>
  );
}

{
  /*<PlaceMap lat={55.75} lng={37.62} zoom={12} onClick={handlePlaceSelect} />*/
}

function PlaceLayer({ mapInstance, leafletRef, isReady, places, onClick }: MapContext & { places: PlaceDto[]; onClick: (place: PlaceDto) => void }) {
  useEffect(() => {
    if (!isReady || !mapInstance.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const roots = new Set<Root>();

    const markers = L.layerGroup().addTo(mapInstance.current);

    const getPlaceIcon = (count: number) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin${!count ? ' marker-pin-empty' : ''}"></div>
               <div class="marker-text">${count || ''}</div>`,
        iconSize: [30, 42],
      });

    places.forEach(place => {
      const marker = L.marker([Number(place.latitude), Number(place.longitude)], { icon: getPlaceIcon(place.meets?.length || 0) });

      let popupRoot: Root | undefined;
      marker.on('popupopen', e => {
        const container = getBrowser()!.document.createElement('div');
        const root = createRoot(container);
        popupRoot = root;
        roots.add(root);

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

      marker.on('popupclose', () => {
        popupRoot?.unmount();
        if (popupRoot) roots.delete(popupRoot);
        popupRoot = undefined;
      });
      marker.bindPopup(''); // важно: popup должен быть создан

      marker.addTo(markers);
    });
    return () => {
      markers.remove();
      roots.forEach(root => root.unmount());
    };
  }, [places, isReady, mapInstance, leafletRef, onClick]);
  return null;
}
