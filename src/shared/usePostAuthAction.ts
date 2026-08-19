const STORAGE_KEY = 'post_auth_action';

export type PostAuthAction<T = any> = {
    type: string;
    payload?: T;
};

export const usePostAuthAction = () => {
    const setAction = (action: PostAuthAction) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    };

    const getAction = (): PostAuthAction | null => {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

    const clearAction = () => {
        sessionStorage.removeItem(STORAGE_KEY);
    };

    return {
        setAction,
        getAction,
        clearAction,
    };
};