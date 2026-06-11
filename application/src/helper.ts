import type { ChatTarget } from '@shared/types';

const TARGET_STORAGE_KEY = 'target';

export const useTarget = (): ChatTarget | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const url = new URL(window.location.href);
    const target = url.searchParams.get('target');

    if (!target) {
        return localStorage.getItem(TARGET_STORAGE_KEY) as ChatTarget;
    }

    localStorage.setItem(TARGET_STORAGE_KEY, target);
    url.searchParams.delete('target');

    return target as ChatTarget;
}

