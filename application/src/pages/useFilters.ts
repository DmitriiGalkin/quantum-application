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

export function useFilters() {
  const getInitial = (): Filters => {
    const params = new URLSearchParams(window.location.search);

    // 1. сначала URL
    if (params.toString()) {
      return {
        view: (params.get('view') as Filters['view']) || 'module',
        sort: (params.get('sort') as Sort) || 'nearby',
        when: (params.get('when') as When) || undefined,
        latitude: undefined,
        longitude: undefined,
      };
    }

    // 2. потом localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    // 3. дефолт
    return {
      view: 'module',
      sort: 'nearby',
      when: undefined,
    };
  };

  const [filters, setFilters] = useState<Filters>(getInitial);

  // 🔹 sync → localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // 🔹 sync → URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.view) params.set('view', filters.view);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.when) params.set('when', filters.when);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [filters]);

  // 🔹 helpers
  const setView = (view: Filters['view']) => setFilters(f => ({ ...f, view }));

  const setSort = (sort: Sort) => setFilters(f => ({ ...f, sort }));

  const setWhen = (when?: When) => setFilters(f => ({ ...f, when }));

  const reset = () =>
    setFilters({
      view: 'module',
      sort: 'nearby',
      when: undefined,
    });

  return {
    filters,
    setFilters,
    setView,
    setSort,
    setWhen,
    reset,
    setLocation: (location: Location) => setFilters(f => ({ ...f, latitude: location.latitude, longitude: location.longitude })),
  };
}