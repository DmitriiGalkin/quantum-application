import { useSearchParams } from 'react-router-dom';
import { type Sort, type View, type When } from 'entities';

export interface FilterProps {
  filters: { view: View; sort: Sort; when: When };
  setView: (view: View) => void;
  setSort: (sort: Sort) => void;
  setWhen: (when?: When) => void;
}

export function useFilters(): FilterProps {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort');
  const when = params.get('when');
  const view = params.get('view');
  const filters = {
    view: (view === 'map' || view === 'group' ? view : 'module') as View,
    sort: (sort === 'popular' || sort === 'nearby' ? sort : 'new') as Sort,
    when: (when === 'today' || when === 'tomorrow' ? when : undefined) as When,
  };
  const setFilter = (key: string, value?: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  });
  const setView = (view: View) => setFilter('view', view);
  const setSort = (sort: Sort) => setFilter('sort', sort);
  const setWhen = (when?: When) => setFilter('when', when);

  return {
    filters,
    setView,
    setSort,
    setWhen,
  };
}
