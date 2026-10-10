import { useEffect, useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const supportedSnapshot = () => Boolean(globalThis.navigator?.geolocation);
const serverSnapshot = () => null;

type LocationState = { status: 'idle' } | { status: 'loading' } | { status: 'success'; lat: number; lng: number } | { status: 'error' };

export function useLocation(enabled: boolean) {
  const supported = useSyncExternalStore(subscribe, supportedSnapshot, serverSnapshot);
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  useEffect(() => {
    if (!enabled || supported !== true) return;

    let active = true;
    if (!globalThis.navigator?.geolocation) return;
    globalThis.navigator.geolocation.getCurrentPosition(
      pos => {
        if (!active) return;
        setState({
          status: 'success',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        if (!active) return;
        setState({ status: 'error' });
      },
    );
    return () => { active = false; };
  }, [enabled, supported]);

  if (!enabled) return { status: 'idle' } as const;
  if (supported === false) return { status: 'error' } as const;
  if (state.status === 'idle') return { status: 'loading' } as const;
  return state;
}
