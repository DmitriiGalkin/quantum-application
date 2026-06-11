import { useEffect, useRef, useState } from 'react';

export function useLeafletMap(lat: number, lng: number, zoom: number) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function createMap() {
      const L = await import('leaflet');
      leafletRef.current = L;

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      mapInstance.current = map;
      setIsReady(true);
    }

    if (!mapInstance.current && mapRef.current) {
      void createMap();
    }

    return () => {
      mapInstance.current?.remove();
    };
  }, []);

  return { mapRef, mapInstance, leafletRef, isReady };
}
