import { useLeafletMap } from './useLeafletMap.ts';
import './BaseMap.css';
import 'leaflet/dist/leaflet.css';

interface BaseMapProps {
  lat: number;
  lng: number;
  zoom: number;
  useLayer: (ctx: MapContext) => void;
}

export type MapContext = {
  mapInstance: React.MutableRefObject<L.Map | null>;
  leafletRef: React.MutableRefObject<typeof import('leaflet') | null>;
  isReady: boolean;
};

export function BaseMap({ lat, lng, zoom, useLayer }: BaseMapProps) {
  const { mapRef, mapInstance, leafletRef, isReady } = useLeafletMap(lat, lng, zoom);

  useLayer({
    mapInstance,
    leafletRef,
    isReady,
  });

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '75vh',
        borderRadius: '1rem',
      }}
    />
  );
}
