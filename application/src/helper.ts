
export const REDIRECT_AFTER_LOGIN_STORAGE_KEY = 'redirect_after_login';
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const saveAccessTokenFromUrl = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');

    if (!accessToken) {
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    url.searchParams.delete('access_token');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

    const currentPath = localStorage.getItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY) || '/'; // Если нет записи, вернем на главную
    window.location.href = currentPath;
    localStorage.removeItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY);

    return accessToken;
}

export const strategies = [
    {
        title: 'Google',
        href: `${API_URL}/login/google`,
        icon: 'G',
    },
    {
        title: 'Yandex',
        href: `${API_URL}/login/yandex`,
        icon: 'Я',
    },
];
