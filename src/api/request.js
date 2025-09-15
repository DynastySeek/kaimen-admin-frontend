import axios from 'axios';
import { VITE_BASE_REQUEST_API } from '@/config/env';
import { setupInterceptors } from './interceptors';

export function createAxios(options = {}) {
  const defaultOptions = {
    baseURL: VITE_BASE_REQUEST_API,
    timeout: 12000,
  };
  const service = axios.create({
    ...defaultOptions,
    ...options,
  });
  setupInterceptors(service);
  return service;
}

export const request = createAxios();

export const mockRequest = createAxios({
  baseURL: '/mock-api',
});
