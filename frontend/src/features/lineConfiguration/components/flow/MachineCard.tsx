import React from 'react';
import type { Machine, UUID } from '../../types';
import { useDrag } from '../../hooks/useDrag';

const placeholderImg = 'https://dummyimage.com/120x72/edf2f7/8792a2.png&text=Machine';
const nodeWidth = 300;
const nodeHeight = 200;

interface MachineCardProps {
  machine: Machine;
  selected: boolean;
  onSelect: () => void;
  onDragBy: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onStartConnect?: (id: UUID, x: number, y: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  selected,
  onSelect,
  onDragBy,
  onDragEnd,
  onStartConnect,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { onMouseDown } = useDrag(onDragBy, onDragEnd);

  return (
    <div
      className={[
        'absolute rounded-xl border bg-white shadow-sm cursor-move select-none',
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300',
      ].join(' ')}
      style={{ left: machine.x, top: machine.y, width: nodeWidth, height: nodeHeight }}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Connection handle */}
      {onStartConnect && (
        <div
          className="absolute -right-5 top-[calc(50%-12px)] w-6 h-6 z-10 flex items-center justify-center"
          title="Drag to connect"
        >
          <div
            className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_4px_#2563eb88] cursor-crosshair"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartConnect(machine.id, e.clientX, e.clientY);
            }}
          />
        </div>
      )}

      {/* Machine content */}
      <div className="flex gap-3 p-3 h-full">
        <img
          src={machine.imageUrl || placeholderImg}
          alt={machine.type}
          className="w-[120px] h-[72px] object-cover rounded-md border"
          draggable={false}
        />
        <div className="flex flex-col justify-between flex-1">
          <div>
            <div className="text-sm font-semibold text-gray-900">{machine.name}</div>
            <div className="text-xs text-gray-500">{machine.type}</div>
          </div>
          <div className="inline-flex items-center gap-1 self-start rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 border border-gray-200">
            CFX: {machine.cfx.host}:{machine.cfx.port}
          </div>
        </div>
      </div>
    </div>
  );
};
