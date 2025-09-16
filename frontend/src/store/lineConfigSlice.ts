import { createSlice, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type UUID = string;

export type Machine = {
  id: UUID;
  name: string;
  type: string;
  imageUrl?: string;
  x: number;
  y: number;
  cfx: {
    host: string;
    port: number;
    topic: string;
  };
  params: Record<string, string>;
};

export type Connection = { fromId: UUID; toId: UUID };

export type LineConfig = {
  id: UUID;
  name: string;
  machines: Machine[];
  connections: Connection[];
};

type LineConfigState = {
  lines: LineConfig[];
  modalOpen: boolean;
  working: LineConfig | null;
  original: LineConfig | null;
  activeLineId: UUID | null;
  selectedMachineId: UUID | null;
};

const sampleLine = (name = 'SMT Line A'): LineConfig => ({
  id: nanoid(8),
  name,
  machines: [
    {
      id: nanoid(8),
      name: 'Pick & Place 1',
      type: 'JUKI LX-8',
      x: 120,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.10', port: 1883, topic: 'cfx/line-a/pnp1' },
      params: { feederCount: '8', lane: '1' },
    },
    {
      id: nanoid(8),
      name: 'SPI',
      type: 'CyberOptics',
      x: 420,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.11', port: 1883, topic: 'cfx/line-a/spi' },
      params: { threshold: '0.85' },
    },
    {
      id: nanoid(8),
      name: 'Reflow',
      type: 'BTU Pyramax',
      x: 720,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.12', port: 1883, topic: 'cfx/line-a/reflow' },
      params: { zones: '8' },
    },
    {
      id: nanoid(8),
      name: 'AOI',
      type: 'CyberOptics AOI',
      x: 1020,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.13', port: 1883, topic: 'cfx/line-a/aoi' },
      params: { passMark: '99.0' },
    },
  ],
  connections: [],
});

const initialState: LineConfigState = {
  lines: [sampleLine('SMT Line A'), sampleLine('SMT Line B')],
  modalOpen: false,
  working: null,
  original: null,
  activeLineId: null,
  selectedMachineId: null,
};

const slice = createSlice({
  name: 'lineConfig',
  initialState,
  reducers: {
    addLine(state) {
      state.lines.push(sampleLine(`SMT Line ${String.fromCharCode(65 + state.lines.length)}`));
    },
    deleteLine(state, action: PayloadAction<UUID>) {
      state.lines = state.lines.filter((l) => l.id !== action.payload);
      if (state.activeLineId === action.payload) {
        state.activeLineId = null;
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
      state.activeLineId = null;
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
      state.activeLineId = null;
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
    addConnection(state, action: PayloadAction<{ fromId: UUID; toId: UUID }>) {
      if (!state.working) return;
      state.working.connections.push(action.payload);
    },
    removeConnection(state, action: PayloadAction<{ fromId: UUID; toId: UUID }>) {
      if (!state.working) return;
      state.working.connections = state.working.connections.filter(
        (c) => !(c.fromId === action.payload.fromId && c.toId === action.payload.toId)
      );
    },
  },
});

export const {
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
  addConnection,
  removeConnection,
} = slice.actions;

export default slice.reducer;
