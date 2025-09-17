import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LineConfig, Machine, UUID } from '../types';
import mockLineConfigs from '../../../data/mockLineConfig.json';

export const fetchLineConfigs = createAsyncThunk('lineConfig/fetchLineConfigs', async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockLineConfigs as LineConfig[];
});

type LineConfigState = {
  lines: LineConfig[];
  activeLineId: UUID | null;
  modalOpen: boolean;
  working: LineConfig | null;
  original: LineConfig | null;
  selectedMachineId: UUID | null;
};

const initialState: LineConfigState = {
  lines: [],
  activeLineId: null,
  modalOpen: false,
  working: null,
  original: null,
  selectedMachineId: null,
};

const slice = createSlice({
  name: 'lineConfig',
  initialState,
  reducers: {
    setActiveLine(state, action: PayloadAction<UUID>) {
      state.activeLineId = action.payload;
    },
    addLine(state) {
      const newLine: LineConfig = {
        id: nanoid(8),
        name: `SMT Line ${String.fromCharCode(65 + state.lines.length)}`,
        machines: [],
        connections: [],
      };
      state.lines.push(newLine);
    },
    deleteLine(state, action: PayloadAction<UUID>) {
      state.lines = state.lines.filter((l) => l.id !== action.payload);
      if (state.activeLineId === action.payload) {
        state.activeLineId = state.lines.length > 0 ? state.lines[0].id : null;
        state.modalOpen = false;
        state.working = null;
        state.original = null;
      }
    },
    openEditor(state, action: PayloadAction<UUID>) {
      const line = state.lines.find((l) => l.id === action.payload);
      if (!line) return;
      state.activeLineId = line.id;
      state.original = line;
      state.working = JSON.parse(JSON.stringify(line));
      state.modalOpen = true;
      state.selectedMachineId = null;
    },
    closeEditor(state) {
      state.modalOpen = false;
      // Keep activeLineId, don't reset it
      state.working = null;
      state.original = null;
      state.selectedMachineId = null;
    },
    saveEditor(state) {
      if (!state.working) return;
      state.lines = state.lines.map((l) => (l.id === state.working!.id ? state.working! : l));
      state.modalOpen = false;
      state.original = null;
      state.working = null;
      state.selectedMachineId = null;
    },
    setWorking(state, action: PayloadAction<LineConfig>) {
      state.working = action.payload;
    },
    selectMachine(state, action: PayloadAction<UUID | null>) {
      state.selectedMachineId = action.payload;
    },
    moveMachine(state, action: PayloadAction<{ id: UUID; dx: number; dy: number }>) {
      if (!state.working) return;
      const m = state.working.machines.find((x) => x.id === action.payload.id);
      if (!m) return;
      m.x += action.payload.dx;
      m.y += action.payload.dy;
    },
    updateMachine(state, action: PayloadAction<Machine>) {
      if (!state.working) return;
      state.working.machines = state.working.machines.map((m) =>
        m.id === action.payload.id ? action.payload : m
      );
    },
    addMachine(state) {
      if (!state.working) return;
      state.working.machines.push({
        id: nanoid(8),
        name: `New Machine ${state.working.machines.length + 1}`,
        type: 'Custom',
        x: (state.working.machines.length + 1) * 220,
        y: 350,
        imageUrl: '',
        cfx: { host: '10.0.0.100', port: 1883, topic: 'cfx/new' },
        params: {},
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchLineConfigs.fulfilled,
      (state, action: PayloadAction<LineConfig[]>) => {
        state.lines = action.payload;
        if (state.lines.length > 0 && !state.activeLineId) {
          state.activeLineId = state.lines[0].id;
        }
      }
    );
  },
});

export const {
  setActiveLine,
  addLine,
  deleteLine,
  openEditor,
  closeEditor,
  saveEditor,
  setWorking,
  selectMachine,
  moveMachine,
  updateMachine,
  addMachine,
} = slice.actions;

export default slice.reducer;
