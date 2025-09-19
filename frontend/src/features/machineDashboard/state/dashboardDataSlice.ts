import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';

export interface MachineStatus {
  name: string;
  status: 'Running' | 'Idle' | 'Error' | 'Maintenance';
  efficiency: number;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface AlertData {
  time: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
}

interface DashboardDataState {
  machineStatuses: MachineStatus[];
  kpiData: KPIData[];
  alerts: AlertData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Mock data
const mockMachineStatuses: MachineStatus[] = [
  { name: 'Pick & Place 1', status: 'Running', efficiency: 98 },
  { name: 'Pick & Place 2', status: 'Running', efficiency: 95 },
  { name: 'Reflow Oven', status: 'Idle', efficiency: 0 },
  { name: 'AOI Station', status: 'Running', efficiency: 92 },
];

const mockKPIData: KPIData[] = [
  { 
    title: "OEE", 
    value: "85%", 
    change: "2%", 
    changeType: "increase" as const,
  },
  { 
    title: "Units Produced", 
    value: "10,482", 
    change: "150", 
    changeType: "increase" as const,
  },
  { 
    title: "Downtime", 
    value: "27 mins", 
    change: "5 mins", 
    changeType: "decrease" as const,
  },
  { 
    title: "Quality", 
    value: "99.7%", 
    change: "0.1%", 
    changeType: "increase" as const,
  },
  { 
    title: "First Pass Yield", 
    value: "99.2%", 
    change: "0.1%", 
    changeType: "decrease" as const,
  }
];

const mockAlertsData: AlertData[] = [
  { time: '2 mins ago', message: 'Pick & Place 2 efficiency below threshold', type: 'warning' },
  { time: '15 mins ago', message: 'Reflow Oven temperature stabilized', type: 'info' },
  { time: '1 hour ago', message: 'Shift change completed successfully', type: 'success' },
];

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboardData/fetchDashboardData',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      machineStatuses: mockMachineStatuses,
      kpiData: mockKPIData,
      alerts: mockAlertsData,
    };
  }
);

export const refreshDashboardData = createAsyncThunk(
  'dashboardData/refreshDashboardData',
  async () => {
    // Simulate API call with slight variations in data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add some randomization to simulate live data
    const updatedMachineStatuses = mockMachineStatuses.map(machine => ({
      ...machine,
      efficiency: Math.max(0, machine.efficiency + (Math.random() - 0.5) * 10),
    }));
    
    const updatedKPIData = mockKPIData.map(kpi => {
      if (kpi.title === 'Units Produced') {
        const currentValue = parseInt(kpi.value.replace(',', ''));
        const newValue = currentValue + Math.floor(Math.random() * 5);
        return {
          ...kpi,
          value: newValue.toLocaleString(),
          change: (newValue - currentValue).toString(),
        };
      }
      return kpi;
    });
    
    return {
      machineStatuses: updatedMachineStatuses,
      kpiData: updatedKPIData,
      alerts: mockAlertsData,
    };
  }
);

const initialState: DashboardDataState = {
  machineStatuses: mockMachineStatuses,
  kpiData: mockKPIData,
  alerts: mockAlertsData,
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardDataSlice = createSlice({
  name: 'dashboardData',
  initialState,
  reducers: {
    clearError: (state: DashboardDataState) => {
      state.error = null;
    },
    addAlert: (state: DashboardDataState, action: PayloadAction<AlertData>) => {
      state.alerts.unshift(action.payload);
      // Keep only the latest 10 alerts
      state.alerts = state.alerts.slice(0, 10);
    },
    removeAlert: (state: DashboardDataState, action: PayloadAction<number>) => {
      state.alerts.splice(action.payload, 1);
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<DashboardDataState>) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state: DashboardDataState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state: DashboardDataState, action: any) => {
        state.loading = false;
        state.machineStatuses = action.payload.machineStatuses;
        state.kpiData = action.payload.kpiData;
        state.alerts = action.payload.alerts;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state: DashboardDataState, action: any) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      })
      // Refresh dashboard data
      .addCase(refreshDashboardData.pending, (state: DashboardDataState) => {
        // Don't set loading to true for refresh to avoid UI flicker
        state.error = null;
      })
      .addCase(refreshDashboardData.fulfilled, (state: DashboardDataState, action: any) => {
        state.machineStatuses = action.payload.machineStatuses;
        state.kpiData = action.payload.kpiData;
        state.alerts = action.payload.alerts;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshDashboardData.rejected, (state: DashboardDataState, action: any) => {
        state.error = action.error.message || 'Failed to refresh dashboard data';
      });
  },
});

export const { clearError, addAlert, removeAlert } = dashboardDataSlice.actions;
export default dashboardDataSlice.reducer;
