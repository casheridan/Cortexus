import React, { useState } from 'react';
import type { LineConfig, Machine, UUID } from '../types';
import { FlowCanvas } from './flow/FlowCanvas';
import { Inspector } from './flow/Inspector';

const gridSize = 25;

interface FlowEditorProps {
  value: LineConfig;
  onChange: (config: LineConfig) => void;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ value, onChange }) => {
  const [selectedId, setSelectedId] = useState<UUID | null>(null);

  const updateMachine = (machine: Machine) => {
    onChange({
      ...value,
      machines: value.machines.map((m) => (m.id === machine.id ? machine : m)),
    });
  };

  const moveMachine = (id: UUID, dx: number, dy: number) => {
    const machine = value.machines.find((m) => m.id === id);
    if (!machine) return;
    
    updateMachine({ ...machine, x: machine.x + dx, y: machine.y + dy });
  };

  const snapMachine = (id: UUID) => {
    const machine = value.machines.find((m) => m.id === id);
    if (!machine) return;

    const newX = Math.round(machine.x / gridSize) * gridSize;
    const newY = Math.round(machine.y / gridSize) * gridSize;

    if (machine.x !== newX || machine.y !== newY) {
      updateMachine({ ...machine, x: newX, y: newY });
    }
  };

  const createConnection = (fromId: UUID, toId: UUID) => {
    onChange({
      ...value,
      connections: [...value.connections, { fromId, toId }],
    });
  };

  return (
    <div className="relative w-full h-full flex">
      <FlowCanvas
        config={value}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onMove={moveMachine}
        onMoveEnd={snapMachine}
        onCreateConnection={createConnection}
      />
      <Inspector
        machine={value.machines.find((m) => m.id === selectedId) ?? null}
        onChange={updateMachine}
      />
    </div>
  );
};

export default FlowEditor;
