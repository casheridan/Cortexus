import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LineConfig, Machine, UUID } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);

const sampleLine = (name = 'SMT Line A'): LineConfig => ({
  id: uid(),
  name,
  machines: [
    {
      id: uid(),
      name: 'Pick & Place 1',
      type: 'JUKI LX-8',
      x: 120, y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.10', port: 1883, topic: 'cfx/line-a/pnp1' },
      params: { feederCount: '8', lane: '1' },
    },
    {
      id: uid(),
      name: 'SPI',
      type: 'CyberOptics',
      x: 420, y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.11', port: 1883, topic: 'cfx/line-a/spi' },
      params: { threshold: '0.85' },
    },
    {
      id: uid(),
      name: 'Reflow',
      type: 'BTU Pyramax',
      x: 720, y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.12', port: 1883, topic: 'cfx/line-a/reflow' },
      params: { zones: '8' },
    },
    {
      id: uid(),
      name: 'AOI',
      type: 'CyberOptics AOI',
      x: 1020, y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.13', port: 1883, topic: 'cfx/line-a/aoi' },
      params: { passMark: '99.0' },
    },
  ],
  connections: [],
});

type EditorState = {
  isOpen: boolean;
  activeIndex: number | null;
  original: LineConfig | null;
  working: LineConfig | null;
  selectedMachineId: UUID | null;
};

type LineConfigState = {
  lines: LineConfig[];
  editor: EditorState;
};

const initialState: LineConfigState = {
  lines: [sampleLine('SMT Line A'), sampleLine('SMT Line B')],
  editor: {
    isOpen: false,
    activeIndex: null,
    original: null,
    working: null,
    selectedMachineId: null,
  },
};

const slice = createSlice({
  name: 'lineConfig',
  initialState,
  reducers: {
    addLine(state) {
      state.lines.push(sampleLine(`SMT Line ${String.fromCharCode(65 + state.lines.length)}`));
    },
    deleteLine(state, action: PayloadAction<number>) {
      state.lines.splice(action.payload, 1);
    },

    openEditor(state, action: PayloadAction<number>) {
      const idx = action.payload;
      state.editor.isOpen = true;
      state.editor.activeIndex = idx;
      state.editor.original = state.lines[idx];
      state.editor.working = JSON.parse(JSON.stringify(state.lines[idx]));
      state.editor.selectedMachineId = null;
    },
    closeEditor(state) {
      state.editor = { isOpen: false, activeIndex: null, original: null, working: null, selectedMachineId: null };
    },
    saveEditor(state) {
      const { activeIndex, working } = state.editor;
      if (activeIndex != null && working) {
        state.lines[activeIndex] = working;
      }
      state.editor.isOpen = false;
      state.editor.activeIndex = null;
      state.editor.original = null;
      state.editor.working = null;
      state.editor.selectedMachineId = null;
    },

    setWorking(state, action: PayloadAction<LineConfig>) {
      state.editor.working = action.payload;
    },
    selectMachine(state, action: PayloadAction<UUID | null>) {
      state.editor.selectedMachineId = action.payload;
    },

    addMachine(state) {
      if (!state.editor.working) return;
      const w = state.editor.working;
      const nx = (w.machines.length + 1) * 220;
      w.machines.push({
        id: uid(),
        name: `New Machine ${w.machines.length + 1}`,
        type: 'Custom',
        x: nx, y: 350,
        imageUrl: '',
        cfx: { host: '10.0.0.100', port: 1883, topic: 'cfx/new' },
        params: {},
      });
    },
    moveMachine(state, action: PayloadAction<{ id: UUID; dx: number; dy: number }>) {
      const w = state.editor.working;
      if (!w) return;
      const m = w.machines.find(m => m.id === action.payload.id);
      if (!m) return;
      m.x += action.payload.dx;
      m.y += action.payload.dy;
    },
    updateMachine(state, action: PayloadAction<Machine>) {
      const w = state.editor.working;
      if (!w) return;
      const i = w.machines.findIndex(m => m.id === action.payload.id);
      if (i >= 0) w.machines[i] = action.payload;
    },

    addConnection(state, action: PayloadAction<{ fromId: UUID; toId: UUID }>) {
      const w = state.editor.working;
      if (!w) return;
      w.connections.push(action.payload);
    },
    removeConnection(state, action: PayloadAction<{ fromId: UUID; toId: UUID }>) {
      const w = state.editor.working;
      if (!w) return;
      w.connections = w.connections.filter(c => !(c.fromId === action.payload.fromId && c.toId === action.payload.toId));
    },
  }
});

export const {
  addLine, deleteLine,
  openEditor, closeEditor, saveEditor,
  setWorking, selectMachine,
  addMachine, moveMachine, updateMachine,
  addConnection, removeConnection
} = slice.actions;

export default slice.reducer;
