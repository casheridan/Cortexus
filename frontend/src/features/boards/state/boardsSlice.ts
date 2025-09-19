import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Component {
  id: string;
  description: string;
  internalPartNumber: string;
  referenceDesignator: string;
  quantity: number;
}

export interface Board {
  id: string;
  name: string;
  internalSerialNumber: string;
  assemblyNumber: string;
  lastRanTime: string;
  currentStation?: string;
  linkedComponents: Component[];
  machineRecipes: Record<string, boolean>;
}

export interface NewBoardData {
  name: string;
  internalSerialNumber: string;
  assemblyNumber: string;
  machineRecipes: Record<string, boolean>;
}

interface BoardsState {
  boards: Board[];
  loading: boolean;
  error: string | null;
}

// Mock data service
const mockBoardsData: Board[] = [
  {
    id: 'board-001',
    name: 'Main Control Board',
    internalSerialNumber: 'MCB-2024-001247',
    assemblyNumber: 'ASM-PCB-A7829',
    lastRanTime: '2024-01-15T14:23:15Z',
    linkedComponents: [
      { id: 'comp-001', description: '4.7K Ohm Resistor', internalPartNumber: 'R-4K7-SMD-0603', referenceDesignator: 'R1', quantity: 1 },
      { id: 'comp-002', description: '100nF Capacitor', internalPartNumber: 'C-100nF-X7R-0603', referenceDesignator: 'C1', quantity: 2 },
      { id: 'comp-003', description: 'STM32 Microcontroller', internalPartNumber: 'STM32F407VGT6-LQFP100', referenceDesignator: 'U1', quantity: 1 },
    ],
    machineRecipes: {
      'SMT-1': true,
      'AOI-1': true,
      'Reflow-1': false,
      'SMT-2': true,
      'SPI-1': false,
    }
  },
  {
    id: 'board-002',
    name: 'Power Management Board',
    internalSerialNumber: 'PMB-2024-001248',
    assemblyNumber: 'ASM-PCB-A7830',
    lastRanTime: '2024-01-15T14:20:00Z',
    currentStation: 'SMT-1',
    linkedComponents: [],
    machineRecipes: {
      'SMT-1': true,
      'AOI-1': false,
      'Reflow-1': true,
      'SMT-2': false,
      'SPI-1': true,
    }
  },
  {
    id: 'board-003',
    name: 'Sensor Interface Board',
    internalSerialNumber: 'SIB-2024-001249',
    assemblyNumber: 'ASM-PCB-A7831',
    lastRanTime: '2024-01-15T13:45:00Z',
    linkedComponents: [
      { id: 'comp-004', description: 'Environmental Sensor', internalPartNumber: 'BME280-LGA-2.5x2.5', referenceDesignator: 'U2', quantity: 1 },
    ],
    machineRecipes: {
      'SMT-1': false,
      'AOI-1': true,
      'Reflow-1': true,
      'SMT-2': true,
      'SPI-1': true,
    }
  }
];

// Async thunks
export const fetchBoards = createAsyncThunk('boards/fetchBoards', async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockBoardsData;
});

export const addBoard = createAsyncThunk(
  'boards/addBoard',
  async (boardData: NewBoardData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newBoard: Board = {
      id: nanoid(),
      ...boardData,
      lastRanTime: new Date().toISOString(),
      linkedComponents: [],
    };
    
    return newBoard;
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, boardData }: { id: string; boardData: NewBoardData }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { id, boardData };
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return boardId;
  }
);

export const updateBoardComponents = createAsyncThunk(
  'boards/updateBoardComponents',
  async ({ boardId, components }: { boardId: string; components: Component[] }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    return { boardId, components };
  }
);

const initialState: BoardsState = {
  boards: mockBoardsData,
  loading: false,
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch boards';
      })
      // Add board
      .addCase(addBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.push(action.payload);
      })
      .addCase(addBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add board';
      })
      // Update board
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const { id, boardData } = action.payload;
        const index = state.boards.findIndex(board => board.id === id);
        if (index !== -1) {
          state.boards[index] = {
            ...state.boards[index],
            ...boardData,
          };
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update board';
      })
      // Delete board
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(board => board.id !== action.payload);
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete board';
      })
      // Update board components
      .addCase(updateBoardComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoardComponents.fulfilled, (state, action) => {
        state.loading = false;
        const { boardId, components } = action.payload;
        const board = state.boards.find(b => b.id === boardId);
        if (board) {
          board.linkedComponents = components;
        }
      })
      .addCase(updateBoardComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update board components';
      });
  },
});

export const { clearError } = boardsSlice.actions;
export default boardsSlice.reducer;
