import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LineConfig, Machine, UUID } from '../types';

// Constants for layout and styling
const placeholderImg = 'https://dummyimage.com/120x72/edf2f7/8792a2.png&text=Machine';
const nodeWidth = 300;
const nodeHeight = 200;
const gridSize = 25;

// Custom hook for handling drag operations
function useDrag(onDrag: (dx: number, dy: number) => void, onEnd?: () => void) {
  const draggingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    draggingRef.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.((e as any).pointerId);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onDrag(dx, dy);
  }, [onDrag]);

  const onMouseUp = useCallback(() => {
    if (draggingRef.current) {
      draggingRef.current = false;
      lastPos.current = null;
      onEnd?.();
    }
  }, [onEnd]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return { onMouseDown };
}

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

const MachineCard: React.FC<MachineCardProps> = ({
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

interface FlowCanvasProps {
  config: LineConfig;
  selectedId: UUID | null;
  onSelect: (id: UUID | null) => void;
  onMove: (id: UUID, dx: number, dy: number) => void;
  onMoveEnd: (id: UUID) => void;
  onCreateConnection?: (fromId: UUID, toId: UUID) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  config,
  selectedId,
  onSelect,
  onMove,
  onMoveEnd,
  onCreateConnection,
}) => {
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);

  // Connection state
  const [connecting, setConnecting] = useState<{ fromId: UUID; x: number; y: number } | null>(null);
  const [hoverMachine, setHoverMachine] = useState<UUID | null>(null);

  // Mouse wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom(z => Math.max(0.2, Math.min(2, z + delta)));
  }, []);

  // Canvas dragging (right mouse)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 2) return; // right click only
    setIsDraggingCanvas(true);
    lastPanPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    if (!isDraggingCanvas) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!lastPanPos.current) return;
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const onMouseUp = () => {
      setIsDraggingCanvas(false);
      lastPanPos.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingCanvas]);

  // Connection dragging
  useEffect(() => {
    if (!connecting) return;

    const onMouseMove = (e: MouseEvent) => {
      setConnecting(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
    };

    const onMouseUp = () => {
      if (hoverMachine && connecting && hoverMachine !== connecting.fromId) {
        onCreateConnection?.(connecting.fromId, hoverMachine);
      }
      setConnecting(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [connecting, hoverMachine, onCreateConnection]);

  // Prevent context menu on right click
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Zoom buttons
  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.2, z - 0.1));
  
  // Canvas bounds
  const bounds = useMemo(() => ({ width: 3000, height: 2000 }), []);
  
  // Machine lookup map
  const machineById = useMemo(
    () => new Map(config.machines.map(m => [m.id, m] as const)),
    [config.machines]
  );

  const getTransformedMousePos = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  };

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 bg-[linear-gradient(0deg,transparent_24px,rgba(0,0,0,0.04)_25px),linear-gradient(90deg,transparent_24px,rgba(0,0,0,0.04)_25px)] bg-[size:25px_25px]"
      onClick={() => onSelect(null)}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{ overflow: 'hidden' }}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 bg-white/80 backdrop-blur rounded p-1 shadow-sm">
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          -
        </button>
        <span className="px-2 py-1 select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="px-2 py-1 rounded border hover:bg-gray-50"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          +
        </button>
      </div>

      <div
        style={{
          width: bounds.width,
          height: bounds.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        {/* Drag-to-connect temp line */}
        {connecting && (() => {
          const endPos = getTransformedMousePos(connecting.x, connecting.y);
          return (
            <svg
              width={bounds.width}
              height={bounds.height}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 10 }}
            >
              <line
                x1={((machineById.get(connecting.fromId)?.x ?? 0) + nodeWidth)}
                y1={((machineById.get(connecting.fromId)?.y ?? 0) + nodeHeight / 2)}
                x2={endPos.x}
                y2={endPos.y}
                stroke="#2563eb"
                strokeWidth={3}
                strokeDasharray="6 4"
              />
            </svg>
          );
        })()}

        {/* Connection lines */}
        <svg
          width={bounds.width}
          height={bounds.height}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#2563eb" />
            </marker>
          </defs>

          {config.connections.map((conn, i) => {
            const from = machineById.get(conn.fromId);
            const to = machineById.get(conn.toId);
            if (!from || !to) return null;

            const fromX = from.x + nodeWidth;
            const fromY = from.y + nodeHeight / 2;
            const toX = to.x;
            const toY = to.y + nodeHeight / 2;
            const midX = (fromX + toX) / 2;

            const pathId = `flow-path-${i}`;
            const pathD = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

            return (
              <g key={i}>
                <path
                  d={pathD}
                  id={pathId}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                />
                <circle r="4" fill="white">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    rotate="auto"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Machine nodes */}
        {config.machines.map((m) => (
          <MachineCard
            key={m.id}
            machine={m}
            selected={selectedId === m.id}
            onSelect={() => onSelect(m.id)}
            onDragBy={(dx, dy) => onMove(m.id, dx / zoom, dy / zoom)}
            onDragEnd={() => onMoveEnd(m.id)}
            onStartConnect={onCreateConnection ? (id, x, y) => setConnecting({ fromId: id, x, y }) : undefined}
            onMouseEnter={() => setHoverMachine(m.id)}
            onMouseLeave={() => setHoverMachine(null)}
          />
        ))}
      </div>
    </div>
  );
};

interface InspectorProps {
  machine: Machine | null;
  onChange: (machine: Machine) => void;
}

const Inspector: React.FC<InspectorProps> = ({ machine, onChange }) => {
  const [local, setLocal] = useState<Machine | null>(machine);

  useEffect(() => {
    setLocal(machine);
  }, [machine]);

  if (!local) {
    return (
      <div className="w-80 border-l bg-white p-4 hidden lg:block">
        <div className="text-sm text-gray-500">
          Select a machine to edit its properties.
        </div>
      </div>
    );
  }

  const update = <K extends keyof Machine>(key: K, value: Machine[K]) => {
    setLocal({ ...local, [key]: value });
  };

  const updateCfx = (key: keyof Machine['cfx'], value: string | number) => {
    setLocal({
      ...local,
      cfx: { ...local.cfx, [key]: key === 'port' ? Number(value) : value },
    });
  };

  const updateParam = (key: string, value: string) => {
    setLocal({
      ...local,
      params: { ...local.params, [key]: value },
    });
  };

  const commit = () => {
    if (local) onChange(local);
  };

  return (
    <div className="w-80 border-l bg-white p-4 hidden lg:flex lg:flex-col gap-4">
      <section>
        <div className="text-xs font-semibold text-gray-500 mb-2">GENERAL</div>
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm text-gray-700">Name</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.name}
              onChange={(e) => update('name', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Type</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.type}
              onChange={(e) => update('type', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Image URL</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.imageUrl ?? ''}
              onChange={(e) => update('imageUrl', e.target.value)}
              onBlur={commit}
              placeholder="https://..."
            />
          </label>
        </div>
      </section>

      <section>
        <div className="text-xs font-semibold text-gray-500 mb-2">CFX CONNECTION</div>
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm text-gray-700">Host</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.host}
              onChange={(e) => updateCfx('host', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Port</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.port}
              onChange={(e) => updateCfx('port', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Topic</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.topic}
              onChange={(e) => updateCfx('topic', e.target.value)}
              onBlur={commit}
            />
          </label>
        </div>
      </section>

      <section>
        <div className="text-xs font-semibold text-gray-500 mb-2">PARAMETERS</div>
        <div className="space-y-2">
          {Object.entries(local.params).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                className="w-32 rounded-md border px-2 py-1 text-sm"
                value={key}
                readOnly
              />
              <input
                className="flex-1 rounded-md border px-2 py-1 text-sm"
                value={value}
                onChange={(e) => updateParam(key, e.target.value)}
                onBlur={commit}
              />
            </div>
          ))}
          <ParamAdder
            onAdd={(key, value) => {
              updateParam(key, value);
              commit();
            }}
          />
        </div>
      </section>
    </div>
  );
};

interface ParamAdderProps {
  onAdd: (key: string, value: string) => void;
}

const ParamAdder: React.FC<ParamAdderProps> = ({ onAdd }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!key) return;
    onAdd(key, value);
    setKey('');
    setValue('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="w-32 rounded-md border px-2 py-1 text-sm"
        placeholder="Parameter name"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <input
        className="flex-1 rounded-md border px-2 py-1 text-sm"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
        }}
      />
      <button
        className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
        onClick={handleAdd}
      >
        Add
      </button>
    </div>
  );
};

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
