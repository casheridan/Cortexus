import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CFXData } from '../types';

interface CFXDataState {
  data: CFXData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CFXDataState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchCfxData = createAsyncThunk('cfxData/fetchCfxData', async () => {
  const response = await fetch('http://localhost:3001/api/cfx-data');
  const data = await response.json();
  return data as CFXData[];
});

const cfxDataSlice = createSlice({
  name: 'cfxData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCfxData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCfxData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCfxData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch CFX data';
      });
  },
});

export default cfxDataSlice.reducer;
