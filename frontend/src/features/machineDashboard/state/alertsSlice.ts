import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from '../../lineConfiguration/types';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
}

interface AlertsState {
  alertsByLine: Record<UUID, Alert[]>;
  maxAlerts: number;
}

const initialState: AlertsState = {
  alertsByLine: {},
  maxAlerts: 10,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<{ lineId: UUID; alert: Alert }>) => {
      const { lineId, alert } = action.payload;
      if (!state.alertsByLine[lineId]) {
        state.alertsByLine[lineId] = [];
      }
      state.alertsByLine[lineId].unshift(alert);
      if (state.alertsByLine[lineId].length > state.maxAlerts) {
        state.alertsByLine[lineId].pop();
      }
    },
  },
});

export const { addAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
