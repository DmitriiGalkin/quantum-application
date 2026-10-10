import { useLeafletMap } from './useLeafletMap.ts';
import './BaseMap.css';
import 'leaflet/dist/leaflet.css';
import type { ReactNode } from 'react';

interface BaseMapProps {
  lat: number;
  lng: number;
  zoom: number;
  children: (ctx: MapContext) => ReactNode;
}

export type MapContext = {
  mapInstance: React.MutableRefObject<L.Map | null>;
  leafletRef: React.MutableRefObject<typeof import('leaflet') | null>;
  isReady: boolean;
};

export function BaseMap({ lat, lng, zoom, children }: BaseMapProps) {
  const { mapRef, mapInstance, leafletRef, isReady } = useLeafletMap(lat, lng, zoom);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '75vh',
        borderRadius: '1rem',
      }}
    >
      {children({ mapInstance, leafletRef, isReady })}
    </div>
  );
}
