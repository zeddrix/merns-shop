import { describe, expect, it } from 'vitest';
import {
  apiLoadingReducer,
  apiRequestFinished,
  apiRequestStarted,
  selectIsApiInFlight
} from '../../../frontend/src/features/apiLoadingSlice';

describe('apiLoadingSlice', () => {
  it('starts_at_zero_in_flight', () => {
    const state = apiLoadingReducer(undefined, { type: 'unknown' });
    expect(state.inFlightCount).toBe(0);
    expect(selectIsApiInFlight({ apiLoading: state })).toBe(false);
  });

  it('increments_on_apiRequestStarted', () => {
    const state = apiLoadingReducer(undefined, apiRequestStarted());
    expect(state.inFlightCount).toBe(1);
    expect(selectIsApiInFlight({ apiLoading: state })).toBe(true);
  });

  it('decrements_on_apiRequestFinished', () => {
    const started = apiLoadingReducer(undefined, apiRequestStarted());
    const finished = apiLoadingReducer(started, apiRequestFinished());
    expect(finished.inFlightCount).toBe(0);
  });

  it('never_drops_below_zero', () => {
    const state = apiLoadingReducer(undefined, apiRequestFinished());
    expect(state.inFlightCount).toBe(0);
  });
});
