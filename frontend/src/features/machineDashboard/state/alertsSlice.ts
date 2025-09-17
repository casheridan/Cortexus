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
  processedAlertIds: string[];
}

const initialState: AlertsState = {
  alertsByLine: {},
  maxAlerts: 10,
  processedAlertIds: [],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<{ lineId: UUID; alert: Alert }>) => {
      const { lineId, alert } = action.payload;
      
      // Check if this alert has already been processed
      if (state.processedAlertIds.includes(alert.id)) {
        return;
      }
      
      if (!state.alertsByLine[lineId]) {
        state.alertsByLine[lineId] = [];
      }
      state.alertsByLine[lineId].unshift(alert);
      if (state.alertsByLine[lineId].length > state.maxAlerts) {
        state.alertsByLine[lineId].pop();
      }
      
      // Mark this alert as processed
      state.processedAlertIds.push(alert.id);
    },
    clearAllAlerts: (state) => {
      state.alertsByLine = {};
      state.processedAlertIds = [];
    },
  },
});

export const { addAlert, clearAllAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
