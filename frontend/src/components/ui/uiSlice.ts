import { createSlice } from '@reduxjs/toolkit';

type UIState = {
  // put global UI toggles here later (toasts, theme, etc.)
};

const initialState: UIState = {};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {}
});

export default uiSlice.reducer;
