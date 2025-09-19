import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface TimeFilter {
  id: string;
  label: string;
  value: number;
}

export interface PreviousBoard {
  name: string;
  serialNumber: string;
  completedAt: string;
}

export interface RecentUnit {
  id: string;
  boardId: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'failed';
}

export interface UnitsProduced {
  total: number;
  today: number;
  currentShift: number;
  recentUnits: RecentUnit[];
}

export interface LineData {
  previousBoards: PreviousBoard[];
  unitsProduced: UnitsProduced;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface CurrentRecipe {
  name: string;
  version: string;
  startTime: string;
}

export interface CycleTimes {
  current: number;
  average: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Downtime {
  today: number;
  thisWeek: number;
  lastIncident: string;
}

export interface Efficiency {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface MachineData {
  alerts: Alert[];
  currentRecipe: CurrentRecipe;
  cycleTimes: CycleTimes;
  downtime: Downtime;
  efficiency: Efficiency;
}

interface ProductionDataState {
  timeFilters: TimeFilter[];
  selectedTimeFilter: string;
  lineData: LineData | null;
  machineData: Record<string, MachineData>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Mock data
const mockTimeFilters: TimeFilter[] = [
  { id: '1h', label: '1 Hour', value: 1 },
  { id: '4h', label: '4 Hours', value: 4 },
  { id: '8h', label: '8 Hours', value: 8 },
  { id: '24h', label: '24 Hours', value: 24 },
  { id: '7d', label: '7 Days', value: 168 },
];

const mockLineData: LineData = {
  previousBoards: [
    { name: "Main Control Board", serialNumber: "MCB-2024-001246", completedAt: "2024-01-15T14:15:30Z" },
    { name: "Power Management Board", serialNumber: "PMB-2024-001247", completedAt: "2024-01-15T13:45:15Z" },
    { name: "Sensor Interface Board", serialNumber: "SIB-2024-001248", completedAt: "2024-01-15T13:20:45Z" },
  ],
  unitsProduced: {
    total: 1247,
    today: 89,
    currentShift: 34,
    recentUnits: [
      { id: "UNIT-2024-001247", boardId: "PCB-A7829", timestamp: "2024-01-15T14:23:15Z", status: "completed" },
      { id: "UNIT-2024-001246", boardId: "PCB-A7828", timestamp: "2024-01-15T14:21:45Z", status: "completed" },
      { id: "UNIT-2024-001245", boardId: "PCB-A7827", timestamp: "2024-01-15T14:20:12Z", status: "completed" },
      { id: "UNIT-2024-001244", boardId: "PCB-A7826", timestamp: "2024-01-15T14:18:33Z", status: "in-progress" },
    ]
  }
};

// Mock machine data generator
const generateMockMachineData = (machineName: string, machineType: string): MachineData => {
  const baseData: MachineData = {
    alerts: [],
    currentRecipe: {
      name: `${machineType}_Recipe_V1.0`,
      version: "1.0.0",
      startTime: "2024-01-15T08:30:00Z"
    },
    cycleTimes: {
      current: 45.0,
      average: 43.0,
      target: 42.0,
      trend: "stable" as const
    },
    downtime: {
      today: 15,
      thisWeek: 120,
      lastIncident: "2024-01-15T10:30:00Z"
    },
    efficiency: {
      oee: 85.0,
      availability: 95.0,
      performance: 90.0,
      quality: 99.5
    }
  };

  // Customize based on machine type
  switch (machineType) {
    case 'Placement':
      return {
        ...baseData,
        alerts: [
          { id: "alert-1", type: "warning" as const, message: "Nozzle pressure low", timestamp: "2024-01-15T14:20:00Z" }
        ],
        currentRecipe: {
          name: "SMT_PickPlace_Recipe_V1.3",
          version: "1.3.2",
          startTime: "2024-01-15T08:30:00Z"
        },
        cycleTimes: { current: 45.2, average: 43.8, target: 42.0, trend: "up" as const },
        efficiency: { oee: 87.5, availability: 94.2, performance: 92.8, quality: 99.9 }
      };
    
    case 'Oven':
      return {
        ...baseData,
        alerts: [
          { id: "alert-2", type: "error" as const, message: "Temperature zone 3 out of range", timestamp: "2024-01-15T14:15:00Z" }
        ],
        currentRecipe: {
          name: "Reflow_Profile_LeadFree_V2.0",
          version: "2.0.1",
          startTime: "2024-01-15T08:35:00Z"
        },
        cycleTimes: { current: 180.5, average: 175.2, target: 170.0, trend: "stable" as const },
        downtime: { today: 45, thisWeek: 234, lastIncident: "2024-01-15T14:15:00Z" },
        efficiency: { oee: 78.3, availability: 89.1, performance: 87.9, quality: 99.9 }
      };
    
    case 'Inspection':
      return {
        ...baseData,
        currentRecipe: {
          name: "AOI_Inspection_Standard_V1.1",
          version: "1.1.0",
          startTime: "2024-01-15T08:32:00Z"
        },
        cycleTimes: { current: 25.8, average: 24.2, target: 22.0, trend: "stable" as const },
        downtime: { today: 5, thisWeek: 67, lastIncident: "2024-01-14T16:20:00Z" },
        efficiency: { oee: 94.1, availability: 98.3, performance: 95.7, quality: 99.9 }
      };
    
    default:
      return baseData;
  }
};

// Async thunks
export const fetchProductionData = createAsyncThunk(
  'productionData/fetchProductionData',
  async (timeFilterId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      lineData: mockLineData,
      timeFilterId,
    };
  }
);

export const fetchMachineData = createAsyncThunk(
  'productionData/fetchMachineData',
  async ({ machineName, machineType }: { machineName: string; machineType: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const machineData = generateMockMachineData(machineName, machineType);
    
    return {
      machineName,
      machineData,
    };
  }
);

export const refreshProductionData = createAsyncThunk(
  'productionData/refreshProductionData',
  async (timeFilterId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Add some variation to simulate live data
    const updatedLineData: LineData = {
      ...mockLineData,
      unitsProduced: {
        ...mockLineData.unitsProduced,
        total: mockLineData.unitsProduced.total + Math.floor(Math.random() * 3),
        today: mockLineData.unitsProduced.today + Math.floor(Math.random() * 2),
        currentShift: mockLineData.unitsProduced.currentShift + Math.floor(Math.random() * 2),
      }
    };
    
    return {
      lineData: updatedLineData,
      timeFilterId,
    };
  }
);

const initialState: ProductionDataState = {
  timeFilters: mockTimeFilters,
  selectedTimeFilter: '24h',
  lineData: mockLineData,
  machineData: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

const productionDataSlice = createSlice({
  name: 'productionData',
  initialState,
  reducers: {
    setTimeFilter: (state, action: PayloadAction<string>) => {
      state.selectedTimeFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMachineData: (state, action: PayloadAction<string>) => {
      delete state.machineData[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch production data
      .addCase(fetchProductionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionData.fulfilled, (state, action) => {
        state.loading = false;
        state.lineData = action.payload.lineData;
        state.selectedTimeFilter = action.payload.timeFilterId;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProductionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch production data';
      })
      // Fetch machine data
      .addCase(fetchMachineData.pending, (state) => {
        // Don't set global loading for individual machine data
      })
      .addCase(fetchMachineData.fulfilled, (state, action) => {
        const { machineName, machineData } = action.payload;
        state.machineData[machineName] = machineData;
      })
      .addCase(fetchMachineData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch machine data';
      })
      // Refresh production data
      .addCase(refreshProductionData.pending, (state) => {
        // Don't set loading to true for refresh to avoid UI flicker
        state.error = null;
      })
      .addCase(refreshProductionData.fulfilled, (state, action) => {
        state.lineData = action.payload.lineData;
        state.selectedTimeFilter = action.payload.timeFilterId;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshProductionData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to refresh production data';
      });
  },
});

export const { setTimeFilter, clearError, clearMachineData } = productionDataSlice.actions;
export default productionDataSlice.reducer;
