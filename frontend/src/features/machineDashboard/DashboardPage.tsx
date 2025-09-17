import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchCfxData } from './state/cfxDataSlice';
import { addEvent } from './state/eventsSlice';
import { updateMachineStatus } from './state/machineStatesSlice';
import type { MachineStatus } from './state/machineStatesSlice';
import { addAlert } from './state/alertsSlice';
import DashboardCard from './components/DashboardCard';
import LiveEventFeed from './components/LiveEventFeed';
import { BoltIcon, CubeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { kpiData } from '../../data/machineData';
import type { UUID } from '../lineConfiguration/types';
import LineSelector from '../lineConfiguration/components/LineSelector';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: cfxData, status } = useSelector((state: RootState) => state.cfxData);
  const { lines, activeLineId } = useSelector((state: RootState) => state.lineConfig);
  
  const machineStates = useSelector((state: RootState) => 
    activeLineId ? state.machineStates.statesByLine[activeLineId] : {}
  );

  const events = useSelector((state: RootState) => 
    activeLineId ? state.events.eventsByLine[activeLineId] || [] : []
  );

  const alerts = useSelector((state: RootState) =>
    activeLineId ? state.alerts.alertsByLine[activeLineId] || [] : []
  );

  const machineToLineMap = useMemo(() => {
    const map: Record<string, UUID> = {};
    lines.forEach(line => {
      line.machines.forEach(machine => {
        map[machine.name] = line.id;
      });
    });
    return map;
  }, [lines]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCfxData());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && cfxData.length > 0) {
      const processedIds = new Set<string>();

      cfxData.forEach(msg => {
        if (processedIds.has(msg.UniqueID)) return;
        processedIds.add(msg.UniqueID);

        const machineName = msg.Source;
        const lineId = machineToLineMap[machineName];

        if (!lineId) return;

        // Add to event feed
        dispatch(addEvent({ lineId, event: msg }));

        // Update machine status
        if (msg.MessageName === 'CFX.ResourcePerformance.StationStateChanged') {
          const state = msg.MessageBody.NewState;
          let newStatus: MachineStatus = 'Unknown';

          // Mapping based on SEMI E58 state codes
          const stateCode = parseInt(state);
          if (stateCode >= 1000 && stateCode <= 1999) {
            // Productive Time (1000-1999)
            newStatus = 'Running';
          } else if (stateCode === 2100) {
            // Standby Time (2100)
            newStatus = 'Idle';
          } else if (stateCode >= 3000 && stateCode <= 3999) {
            // Engineering Time (3000-3999)
            newStatus = 'Engineering';
          } else if (stateCode >= 4100 && stateCode <= 4900) {
            // Scheduled Downtime (4100-4900)
            newStatus = 'Down';
          } else if (stateCode === 5000) {
            // Unscheduled Downtime (5000)
            newStatus = 'Down';
          } else {
            newStatus = 'Unknown';
          }
          
          dispatch(updateMachineStatus({ lineId, machineName, status: newStatus }));
        }

        // Add alerts for faults
        if (msg.MessageName === 'CFX.ResourcePerformance.FaultOccurred') {
          dispatch(addAlert({
            lineId,
            alert: {
              id: msg.UniqueID,
              type: 'error',
              message: `Fault on ${msg.Source}: ${msg.MessageBody.Fault.FaultCode}`,
              time: new Date(msg.TimeStamp).toLocaleString(),
            }
          }));
        }
      });
    }
  }, [cfxData, status, dispatch, machineToLineMap]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <LineSelector />
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <DashboardCard 
            key={index}
            title={kpi.title} 
            value={kpi.value} 
            change={kpi.change} 
            changeType={kpi.changeType} 
            icon={kpi.title === "OEE" ? BoltIcon : kpi.title === "Units Produced" ? CubeIcon : kpi.title === "Downtime" ? ClockIcon : CheckCircleIcon} 
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production History Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Production History</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">24H</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">7D</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">30D</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be integrated here</p>
          </div>
        </div>

        {/* Machine Status */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Machine Status</h2>
          <div className="space-y-4">
            {machineStates && Object.values(machineStates).map(machine => (
              <div key={machine.name} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{machine.name}</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  machine.status === 'Running' ? 'bg-green-100 text-green-800' :
                  machine.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                  machine.status === 'Engineering' ? 'bg-blue-100 text-blue-800' :
                  machine.status === 'Down' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {machine.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg flex items-start space-x-3 ${
                alert.type === 'error' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>{alert.message}</p>
                  <p className={`text-xs ${
                    alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Feed */}
        <LiveEventFeed events={events} />
      </div>
    </div>
  );
};

export default DashboardPage;