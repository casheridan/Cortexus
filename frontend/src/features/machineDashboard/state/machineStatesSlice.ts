import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from '../../lineConfiguration/types';

export type MachineStatus = 'Running' | 'Idle' | 'Engineering' | 'Down' | 'Unknown';

export interface MachineState {
  name: string;
  status: MachineStatus;
  efficiency: number;
}

interface MachineStatesState {
  statesByLine: Record<UUID, Record<string, MachineState>>;
}

const initialState: MachineStatesState = {
  statesByLine: {},
};

const machineStatesSlice = createSlice({
  name: 'machineStates',
  initialState,
  reducers: {
    initializeMachineStates: (state, action: PayloadAction<{ lineId: UUID; machineNames: string[] }>) => {
      const { lineId, machineNames } = action.payload;
      state.statesByLine[lineId] = machineNames.reduce((acc, machineName) => {
        acc[machineName] = { name: machineName, status: 'Unknown', efficiency: 0 };
        return acc;
      }, {} as Record<string, MachineState>);
    },
    updateMachineStatus: (state, action: PayloadAction<{ lineId: UUID; machineName: string; status: MachineStatus }>) => {
      const { lineId, machineName, status } = action.payload;
      if (state.statesByLine[lineId] && state.statesByLine[lineId][machineName]) {
        state.statesByLine[lineId][machineName].status = status;
      }
    },
  },
});

export const { initializeMachineStates, updateMachineStatus } = machineStatesSlice.actions;
export default machineStatesSlice.reducer;
