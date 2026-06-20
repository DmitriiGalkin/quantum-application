import { useState } from 'react';
import { type Sort, type View, type When } from '@shared/types';

export function useFilters() {
  const [filters, setFilters] = useState({
    view: 'module' as View,
    sort: 'nearby' as Sort,
    when: undefined as When,
  });

  const setView = (view: View) => setFilters(f => ({ ...f, view }));

  const setSort = (sort: Sort) =>
    setFilters(f => ({ ...f, sort }));

  const setWhen = (when?: When) =>
    setFilters(f => ({ ...f, when }));

  return {
    filters,
    setView,
    setSort,
    setWhen,
  };
}