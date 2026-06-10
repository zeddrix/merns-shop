import { describe, expect, it, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { axios } from '../../../frontend/src/api/http';
import {
  apiLoadingReducer,
  apiRequestFinished,
  apiRequestStarted
} from '../../../frontend/src/features/apiLoadingSlice';
import { setupApiLoadingInterceptors } from '../../../frontend/src/api/setupApiLoadingInterceptors';

describe('setupApiLoadingInterceptors', () => {
  beforeEach(() => {
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    axios.defaults.adapter = vi.fn(async (config: { url?: string }) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    }));
  });

  it('dispatches_started_and_finished_for_api_requests', async () => {
    const store = configureStore({
      reducer: { apiLoading: apiLoadingReducer }
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    setupApiLoadingInterceptors(store);

    await axios.get('/api/orders');

    expect(dispatchSpy).toHaveBeenCalledWith(apiRequestStarted());
    expect(dispatchSpy).toHaveBeenCalledWith(apiRequestFinished());
    expect(store.getState().apiLoading.inFlightCount).toBe(0);
  });

  it('dispatches_finished_when_request_fails', async () => {
    const store = configureStore({
      reducer: { apiLoading: apiLoadingReducer }
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    setupApiLoadingInterceptors(store);

    axios.defaults.adapter = vi.fn(async (config: { url?: string }) => {
      const error = new Error('Network error') as Error & { config: { url?: string } };
      error.config = config;
      throw error;
    });

    await expect(axios.get('/api/products')).rejects.toThrow('Network error');
    expect(dispatchSpy).toHaveBeenCalledWith(apiRequestFinished());
    expect(store.getState().apiLoading.inFlightCount).toBe(0);
  });

  it('ignores_non_api_urls', async () => {
    const store = configureStore({
      reducer: { apiLoading: apiLoadingReducer }
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    setupApiLoadingInterceptors(store);

    await axios.get('/health');

    expect(dispatchSpy).not.toHaveBeenCalledWith(apiRequestStarted());
    expect(store.getState().apiLoading.inFlightCount).toBe(0);
  });
});
