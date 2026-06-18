import { useEffect, useState } from 'react';
import type { Sort, When } from '@shared/types';

interface Filters {
  view: 'module' | 'map';
  sort: Sort;
  when: When;
  latitude?: number;
  longitude?: number;
}

interface Location {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = 'ideaFilters';

const defaultFilters: Filters = {
  view: 'module',
  sort: 'nearby',
  when: undefined,
  latitude: undefined,
  longitude: undefined,
};

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isHydrated, setIsHydrated] = useState(false);

  // 🔹 hydration (ТОЛЬКО клиент)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      let next: Filters = { ...defaultFilters };

      // 1. URL приоритет
      if (params.toString()) {
        next = {
          ...next,
          view: (params.get('view') as Filters['view']) || 'module',
          sort: (params.get('sort') as Sort) || 'nearby',
          when: (params.get('when') as When) || undefined,
        };
      } else {
        // 2. localStorage fallback
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          next = JSON.parse(saved);
        }
      }

      setFilters(next);
    } catch (e) {
      console.error('Failed to init filters', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 🔹 sync → localStorage
  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters, isHydrated]);

  // 🔹 sync → URL (без координат)
  useEffect(() => {
    if (!isHydrated) return;

    const params = new URLSearchParams();

    if (filters.view) params.set('view', filters.view);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.when) params.set('when', filters.when);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [filters.view, filters.sort, filters.when, isHydrated]);

  // 🔹 helpers
  const setView = (view: Filters['view']) => setFilters(f => ({ ...f, view }));

  const setSort = (sort: Sort) => setFilters(f => ({ ...f, sort }));

  const setWhen = (when?: When) => setFilters(f => ({ ...f, when }));

  const setLocation = (location: Location) =>
    setFilters(f => ({
      ...f,
      latitude: location.latitude,
      longitude: location.longitude,
    }));

  const reset = () => setFilters(defaultFilters);

  return {
    filters,
    setFilters,
    setView,
    setSort,
    setWhen,
    setLocation,
    reset,
    isHydrated, // 👈 важно для SSR
  };
}
