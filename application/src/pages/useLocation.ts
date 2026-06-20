import { useEffect, useState } from 'react';

type LocationState = { status: 'idle' } | { status: 'loading' } | { status: 'success'; lat: number; lng: number } | { status: 'error' };

export function useLocation(enabled: boolean) {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  useEffect(() => {
    if (!enabled) return;

    setState({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          status: 'success',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setState({ status: 'error' });
      },
    );
  }, [enabled]);

  return state;
}
