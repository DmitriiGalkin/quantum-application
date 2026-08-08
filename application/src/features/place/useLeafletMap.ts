import { useEffect, useRef, useState } from 'react';

export function useLeafletMap(lat: number, lng: number, zoom: number) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      const L = await import('leaflet');

      if (cancelled || !mapRef.current) {
        return;
      }

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      mapInstance.current = map;

      // Leaflet может получить некорректный размер
      // контейнера во время первоначального layout.
      requestAnimationFrame(() => {
        if (!cancelled) {
          map.invalidateSize();
        }
      });

      setIsReady(true);
    }

    void createMap();

    return () => {
      cancelled = true;

      mapInstance.current?.remove();
      mapInstance.current = null;
      leafletRef.current = null;
      setIsReady(false);
    };
  }, [lat, lng, zoom]);

  useEffect(() => {
    if (!isReady || !mapInstance.current || !mapRef.current) {
      return;
    }

    const map = mapInstance.current;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]);

  return {
    mapRef,
    mapInstance,
    leafletRef,
    isReady,
  };
}
