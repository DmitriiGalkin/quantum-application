import { useEffect, useRef } from 'react';
import { BaseMap, type MapContext } from '../BaseMap.tsx';
import type { PlaceDto } from 'entities';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
  places: PlaceDto[];
}

function Markers({ mapInstance, leafletRef, isReady, places }: MapContext & { places: PlaceDto[] }) {
  const group = useRef<L.LayerGroup | null>(null);
  useEffect(() => {
    const map = mapInstance.current;
    const leaflet = leafletRef.current;
    if (!isReady || !map || !leaflet) return;
    const markers = leaflet.layerGroup().addTo(map);
    group.current = markers;
    for (const place of places) {
      const count = place.meets?.length ?? 0;
      const icon = leaflet.divIcon({
        className: 'custom-map-marker',
        html: '<div class="marker-pin' + (!count ? ' marker-pin-empty' : '') + '"></div><div class="marker-text">' + (count || '') + '</div>',
        iconSize: [30, 42],
      });
      const popup = globalThis.document.createElement('div');
      popup.className = 'place-popup';
      const title = globalThis.document.createElement('h4');
      title.textContent = place.title;
      const address = globalThis.document.createElement('p');
      address.textContent = 'Адрес: ' + place.address;
      popup.append(title, address);
      leaflet
        .marker([Number(place.latitude), Number(place.longitude)], { icon })
        .bindPopup(popup)
        .addTo(markers);
    }
    return () => {
      markers.remove();
      group.current = null;
    };
  }, [places, isReady, mapInstance, leafletRef]);
  return null;
}

export function PlaceMap({ lat, lng, zoom, places }: Props) {
  return (
    <BaseMap lat={lat} lng={lng} zoom={zoom}>
      {context => <Markers {...context} places={places} />}
    </BaseMap>
  );
}
