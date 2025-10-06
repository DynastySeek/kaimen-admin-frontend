export const VITE_APP_TITLE = import.meta.env.VITE_APP_TITLE;
export const VITE_USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const VITE_STORAGE_PREFIX_KEY = import.meta.env.VITE_STORAGE_PREFIX_KEY;
export const VITE_BASE_REQUEST_API = import.meta.env.VITE_BASE_REQUEST_API;
export const VITE_PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH || '/';

export const isDev = import.meta.env.VITE_NODE_ENV === 'dev';
export const isProd = import.meta.env.VITE_NODE_ENV === 'prod';
export const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
