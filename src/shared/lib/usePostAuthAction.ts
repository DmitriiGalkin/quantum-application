import { getBrowser } from './browser.ts';
const STORAGE_KEY = 'post_auth_action';

export type PostAuthAction = {
    type: string;
    payload?: Record<string, unknown>;
};

const actions = (() => {
    const setAction = (action: PostAuthAction) => {
        getBrowser()?.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    };

    const getAction = (): PostAuthAction | null => {
        const raw = getBrowser()?.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        try {
            const value: unknown = JSON.parse(raw);
            if (typeof value !== 'object' || value === null || !('type' in value) || typeof value.type !== 'string') return null;
            return value as PostAuthAction;
        } catch {
            return null;
        }
    };

    const clearAction = () => {
        getBrowser()?.sessionStorage.removeItem(STORAGE_KEY);
    };

    return {
        setAction,
        getAction,
        clearAction,
    };
})();
export const usePostAuthAction = () => actions;
