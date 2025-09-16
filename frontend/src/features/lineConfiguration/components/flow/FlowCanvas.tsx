import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LineConfig, UUID } from '../../types';
import { MachineCard } from './MachineCard';

const nodeWidth = 300;
const nodeHeight = 200;

interface FlowCanvasProps {
  config: LineConfig;
  selectedId: UUID | null;
  onSelect: (id: UUID | null) => void;
  onMove: (id: UUID, dx: number, dy: number) => void;
  onMoveEnd: (id: UUID) => void;
  onCreateConnection?: (fromId: UUID, toId: UUID) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
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
