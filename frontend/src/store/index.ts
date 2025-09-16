import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import lineConfigReducer from '../features/lineConfiguration/state/lineConfigSlice';
import uiReducer from '../components/ui/uiSlice';

export const store = configureStore({
  reducer: {
    lineConfig: lineConfigReducer,
    ui: uiReducer,
  },
 
}); // middleware: (gDM) => gDM().concat() // add custom middleware here

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
