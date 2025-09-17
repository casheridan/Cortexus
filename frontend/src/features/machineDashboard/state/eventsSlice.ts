import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CFXData } from '../types';
import type { UUID } from '../../lineConfiguration/types';

interface EventsState {
  eventsByLine: Record<UUID, CFXData[]>;
  maxEvents: number;
  processedMessageIds: string[];
}

const initialState: EventsState = {
  eventsByLine: {},
  maxEvents: 100, // Limit the number of events stored in memory
  processedMessageIds: [],
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<{ lineId: UUID; event: CFXData }>) => {
      const { lineId, event } = action.payload;
      
      // Check if this message has already been processed
      if (state.processedMessageIds.includes(event.UniqueID)) {
        return;
      }
      
      if (!state.eventsByLine[lineId]) {
        state.eventsByLine[lineId] = [];
      }
      // Add to the beginning of the array and keep the list trimmed
      state.eventsByLine[lineId].unshift(event);
      if (state.eventsByLine[lineId].length > state.maxEvents) {
        state.eventsByLine[lineId].pop();
      }
      
      // Mark this message as processed
      state.processedMessageIds.push(event.UniqueID);
    },
    clearEvents: (state, action: PayloadAction<UUID>) => {
      state.eventsByLine[action.payload] = [];
    },
    clearAllEvents: (state) => {
      state.eventsByLine = {};
      state.processedMessageIds = [];
    },
  },
});

export const { addEvent, clearEvents, clearAllEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
