import { useLeafletMap } from './useLeafletMap';
import { useMarkers } from './useMarkers';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../../requests';

interface Props {
  lat: number;
  lng: number;
  zoom: number;
}

export function MapComponent({ lat, lng, zoom }: Props) {
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  const { mapRef, mapInstance, leafletRef, isReady } = useLeafletMap(lat, lng, zoom);

  useMarkers({
    mapInstance,
    leafletRef,
    places,
    lat,
    lng,
    zoom,
    isReady,
  });

  return <div ref={mapRef} style={{ width: '100%', height: '75vh' }} />;
}
