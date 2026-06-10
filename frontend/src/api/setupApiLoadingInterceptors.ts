import type { Store } from '@reduxjs/toolkit';
import { axios } from './http';
import { apiRequestFinished, apiRequestStarted } from '../features/apiLoadingSlice';
import type { RootState } from '../store/store';

function isTrackedApiUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return url.includes('/api/');
}

export function setupApiLoadingInterceptors(store: Store<RootState>): void {
  axios.interceptors.request.use((config) => {
    if (isTrackedApiUrl(config.url)) {
      store.dispatch(apiRequestStarted());
    }
    return config;
  });

  const finishRequest = (url: string | undefined) => {
    if (isTrackedApiUrl(url)) {
      store.dispatch(apiRequestFinished());
    }
  };

  axios.interceptors.response.use(
    (response) => {
      finishRequest(response.config.url);
      return response;
    },
    (error: { config?: { url?: string } }) => {
      finishRequest(error.config?.url);
      return Promise.reject(error);
    }
  );
}
