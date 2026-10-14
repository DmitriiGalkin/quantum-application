import { useSearchParams } from 'react-router-dom';
import { type Sort, type View, type When } from 'entities';

export interface FilterProps {
  filters: { view: View; sort: Sort; when: When };
  setView: (view: View) => void;
  setSort: (sort: Sort) => void;
  setWhen: (when?: When) => void;
}

export function useFilters(options: { projects?: boolean; defaultView?: View; compactViews?: boolean } = {}): FilterProps {
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort');
  const when = params.get('when');
  const requestedView = params.get('view');
  const view = options.compactViews && requestedView !== 'table' ? 'module' : requestedView;
  const filters = {
    view: (view === 'module' || view === 'map' || view === 'group' || (options.projects && view === 'table')
      ? view : options.projects ? options.defaultView ?? 'module' : 'module') as View,
    sort: (sort === 'popular' || sort === 'nearby' ? sort : 'new') as Sort,
    when: (when === 'today' || when === 'tomorrow' ? when : undefined) as When,
  };
  const setFilter = (key: string, value?: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  });
  const setView = (view: View) => { if (view !== 'table' || options.projects) setFilter('view', view); };
  const setSort = (sort: Sort) => setFilter('sort', sort);
  const setWhen = (when?: When) => setFilter('when', when);

  return {
    filters,
    setView,
    setSort,
    setWhen,
  };
}
