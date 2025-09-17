import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CFXData } from '../types';
import type { UUID } from '../../lineConfiguration/types';

interface EventsState {
  eventsByLine: Record<UUID, CFXData[]>;
  maxEvents: number;
}

const initialState: EventsState = {
  eventsByLine: {},
  maxEvents: 100, // Limit the number of events stored in memory
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<{ lineId: UUID; event: CFXData }>) => {
      const { lineId, event } = action.payload;
      if (!state.eventsByLine[lineId]) {
        state.eventsByLine[lineId] = [];
      }
      // Add to the beginning of the array and keep the list trimmed
      state.eventsByLine[lineId].unshift(event);
      if (state.eventsByLine[lineId].length > state.maxEvents) {
        state.eventsByLine[lineId].pop();
      }
    },
    clearEvents: (state, action: PayloadAction<UUID>) => {
      state.eventsByLine[action.payload] = [];
    },
  },
});

export const { addEvent, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
