import { useEffect } from 'react';
import { type PostAuthAction, usePostAuthAction } from './usePostAuthAction.ts';
import type { PassportExtendedDto } from 'entities';

export const useRunPostAuthAction = (passport: PassportExtendedDto | null, handler: (action: PostAuthAction) => void) => {
  const { getAction, clearAction } = usePostAuthAction();

  useEffect(() => {
    if (!passport) return;

    const action = getAction();
    if (!action) return;

    clearAction();
    handler(action);
  }, [passport, clearAction, getAction, handler]);
};
