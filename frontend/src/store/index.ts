import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import lineConfigReducer from '../features/lineConfiguration/state/lineConfigSlice';
import uiReducer from '../components/ui/uiSlice';
import cfxDataReducer from '../features/machineDashboard/state/cfxDataSlice';
import eventsReducer from '../features/machineDashboard/state/eventsSlice';
import machineStatesReducer from '../features/machineDashboard/state/machineStatesSlice';
import alertsReducer from '../features/machineDashboard/state/alertsSlice';

export const store = configureStore({
  reducer: {
    lineConfig: lineConfigReducer,
    ui: uiReducer,
    cfxData: cfxDataReducer,
    events: eventsReducer,
    machineStates: machineStatesReducer,
    alerts: alertsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['lineConfig/setWorking', 'lineConfig/openEditor'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'lineConfig.working', 
          'lineConfig.original'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
