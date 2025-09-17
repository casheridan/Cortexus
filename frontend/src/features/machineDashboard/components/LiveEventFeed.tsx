import React from 'react';
import type { CFXData } from '../types';

interface LiveEventFeedProps {
  events: CFXData[];
}

const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events }) => {
  const getEventColor = (eventName: string) => {
    if (eventName.includes('Fault')) return 'text-red-500';
    if (eventName.includes('StateChange') || eventName.includes('StationStateChanged')) return 'text-yellow-500';
    if (eventName.includes('Work')) return 'text-green-500';
    if (eventName.includes('Recipe')) return 'text-blue-500';
    if (eventName.includes('Connected') || eventName.includes('ShuttingDown')) return 'text-purple-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Live Event Feed ({events.length} events)</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events to display</p>
        ) : (
          events.map((event: CFXData) => (
          <div key={event.UniqueID} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className={`font-bold text-xs ${getEventColor(event.MessageName)}`}>CFX</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${getEventColor(event.MessageName)}`}>{event.MessageName}</p>
              <p className="text-xs text-gray-500">
                Source: {event.Source} - {new Date(event.TimeStamp).toLocaleString()}
              </p>
              <pre className="text-xs text-gray-400 mt-1 bg-gray-100 p-2 rounded">
                {JSON.stringify(event.MessageBody, null, 2)}
              </pre>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveEventFeed;
