export const machineStatusData = [
  { name: 'Pick & Place 1', status: 'Running', efficiency: 98 },
  { name: 'Pick & Place 2', status: 'Running', efficiency: 95 },
  { name: 'Reflow Oven', status: 'Idle', efficiency: 0 },
  { name: 'AOI Station', status: 'Running', efficiency: 92 },
];

export const kpiData = [
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

export const alertsData = [
  { time: '2 mins ago', message: 'Pick & Place 2 efficiency below threshold', type: 'warning' },
  { time: '15 mins ago', message: 'Reflow Oven temperature stabilized', type: 'info' },
  { time: '1 hour ago', message: 'Shift change completed successfully', type: 'success' },
];
