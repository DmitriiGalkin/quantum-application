import { useEffect } from 'react';
import { usePostAuthAction, type PostAuthAction } from './usePostAuthAction.ts';

export const useRunPostAuthAction = (passport: any, handler: (action: PostAuthAction) => void) => {
  const { getAction, clearAction } = usePostAuthAction();

  useEffect(() => {
    if (!passport) return;

    const action = getAction();
    if (!action) return;

    handler(action);
    clearAction();
  }, [passport]);
};
