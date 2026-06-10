import { createSlice } from '@reduxjs/toolkit';

export interface ApiLoadingState {
  inFlightCount: number;
}

const initialState: ApiLoadingState = {
  inFlightCount: 0
};

const apiLoadingSlice = createSlice({
  name: 'apiLoading',
  initialState,
  reducers: {
    apiRequestStarted: (state) => {
      state.inFlightCount += 1;
    },
    apiRequestFinished: (state) => {
      state.inFlightCount = Math.max(0, state.inFlightCount - 1);
    }
  }
});

export const { apiRequestStarted, apiRequestFinished } = apiLoadingSlice.actions;
export const apiLoadingReducer = apiLoadingSlice.reducer;

export const selectIsApiInFlight = (state: { apiLoading: ApiLoadingState }): boolean =>
  state.apiLoading.inFlightCount > 0;
