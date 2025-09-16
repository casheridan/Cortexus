import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LineConfig, Machine, UUID } from '../types';

const placeholderImg =
  'https://dummyimage.com/120x72/edf2f7/8792a2.png&text=Machine'; // swap with real images as you have them

type FlowEditorProps = {
  value: LineConfig;
  onChange: (v: LineConfig) => void;
};

const nodeWidth = 200;
const nodeHeight = 120;

function useDrag(
  onDrag: (dx: number, dy: number) => void,
  onEnd?: () => void
) {
  const draggingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    draggingRef.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).closest('div')?.setPointerCapture?.((e as any).pointerId);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current || !lastPos.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      onDrag(dx, dy);
    },
    [onDrag]
  );

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

const MachineCard: React.FC<{
  machine: Machine;
  selected: boolean;
  onSelect: () => void;
  onDragBy: (dx: number, dy: number) => void;
}> = ({ machine, selected, onSelect, onDragBy }) => {
  const { onMouseDown } = useDrag(onDragBy);
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
    >
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

const Inspector: React.FC<{
  machine: Machine | null;
  onChange: (m: Machine) => void;
}> = ({ machine, onChange }) => {
  const [local, setLocal] = useState<Machine | null>(machine);

  useEffect(() => setLocal(machine), [machine]);

  if (!local) {
    return (
      <div className="w-80 border-l bg-white p-4 hidden lg:block">
        <div className="text-sm text-gray-500">Select a machine to edit.</div>
      </div>
    );
  }

  const update = <K extends keyof Machine>(key: K, v: Machine[K]) =>
    setLocal({ ...local, [key]: v });

  const updateCFX = (k: keyof Machine['cfx'], v: string) =>
    setLocal({ ...local, cfx: { ...local.cfx, [k]: k === 'port' ? Number(v) : v as any } });

  const updateParam = (k: string, v: string) =>
    setLocal({ ...local, params: { ...local.params, [k]: v } });

  const commit = () => onChange(local);

  return (
    <div className="w-80 border-l bg-white p-4 hidden lg:flex lg:flex-col gap-4">
      <div>
        <div className="text-xs font-semibold text-gray-500">GENERAL</div>
        <label className="block mt-2 text-sm">
          <span className="text-gray-700">Name</span>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            value={local.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={commit}
          />
        </label>
        <label className="block mt-2 text-sm">
          <span className="text-gray-700">Type</span>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            value={local.type}
            onChange={(e) => update('type', e.target.value)}
            onBlur={commit}
          />
        </label>
        <label className="block mt-2 text-sm">
          <span className="text-gray-700">Image URL</span>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            value={local.imageUrl ?? ''}
            onChange={(e) => update('imageUrl', e.target.value)}
            onBlur={commit}
            placeholder="https://…"
          />
        </label>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-500">CFX CONNECTION</div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <label className="text-sm">
            <span className="text-gray-700">Host</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.host}
              onChange={(e) => updateCFX('host', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-700">Port</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.port}
              onChange={(e) => updateCFX('port', e.target.value)}
              onBlur={commit}
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-700">Topic</span>
            <input
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
              value={local.cfx.topic}
              onChange={(e) => updateCFX('topic', e.target.value)}
              onBlur={commit}
            />
          </label>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-500">PARAMETERS</div>
        <div className="mt-2 space-y-2">
          {Object.entries(local.params).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <input
                className="w-32 rounded-md border px-2 py-1 text-sm"
                value={k}
                readOnly
              />
              <input
                className="flex-1 rounded-md border px-2 py-1 text-sm"
                value={v}
                onChange={(e) => updateParam(k, e.target.value)}
                onBlur={commit}
              />
            </div>
          ))}
          {/* quick adder */}
          <ParamAdder
            onAdd={(key, val) => {
              updateParam(key, val);
              commit();
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ParamAdder: React.FC<{ onAdd: (k: string, v: string) => void }> = ({ onAdd }) => {
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        className="w-32 rounded-md border px-2 py-1 text-sm"
        placeholder="param key"
        value={k}
        onChange={(e) => setK(e.target.value)}
      />
      <input
        className="flex-1 rounded-md border px-2 py-1 text-sm"
        placeholder="value"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <button
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
        onClick={() => {
          if (!k) return;
          onAdd(k, v);
          setK('');
          setV('');
        }}
      >
        Add
      </button>
    </div>
  );
};

const FlowCanvas: React.FC<{
  config: LineConfig;
  selectedId: UUID | null;
  onSelect: (id: UUID | null) => void;
  onMove: (id: UUID, dx: number, dy: number) => void;
}> = ({ config, selectedId, onSelect, onMove }) => {
  // expand SVG to full area behind nodes
  const svgRef = useRef<SVGSVGElement>(null);
  const bounds = useMemo(() => {
    // Simple bounds; could be smarter to cover all nodes
    return { width: 3000, height: 2000 };
  }, []);

  const machineById = useMemo(
    () => new Map(config.machines.map((m) => [m.id, m] as const)),
    [config.machines]
  );

  return (
    <div
      className="relative flex-1 bg-[linear-gradient(0deg,transparent_24px,rgba(0,0,0,0.04)_25px),linear-gradient(90deg,transparent_24px,rgba(0,0,0,0.04)_25px)] bg-[size:25px_25px]"
      onClick={() => onSelect(null)}
    >
      {/* connectors */}
      <svg
        ref={svgRef}
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        preserveAspectRatio="none"
      >
        {config.connections.map((c, i) => {
          const a = machineById.get(c.fromId);
          const b = machineById.get(c.toId);
          if (!a || !b) return null;
          const ax = a.x + nodeWidth;
          const ay = a.y + nodeHeight / 2;
          const bx = b.x;
          const by = b.y + nodeHeight / 2;
          const mx = (ax + bx) / 2;
          return (
            <path
              key={i}
              d={`M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>

      {/* nodes */}
      {config.machines.map((m) => (
        <MachineCard
          key={m.id}
          machine={m}
          selected={selectedId === m.id}
          onSelect={() => onSelect(m.id)}
          onDragBy={(dx, dy) => onMove(m.id, dx, dy)}
        />
      ))}
    </div>
  );
};

const FlowEditor: React.FC<FlowEditorProps> = ({ value, onChange }) => {
  const [selected, setSelected] = useState<UUID | null>(null);

  const updateMachine = (m: Machine) => {
    onChange({
      ...value,
      machines: value.machines.map((x) => (x.id === m.id ? m : x)),
    });
  };

  const moveMachine = (id: UUID, dx: number, dy: number) => {
    const m = value.machines.find((x) => x.id === id);
    if (!m) return;
    updateMachine({ ...m, x: m.x + dx, y: m.y + dy });
  };

  return (
    <div className="relative w-full h-full flex">
      <FlowCanvas
        config={value}
        selectedId={selected}
        onSelect={setSelected}
        onMove={moveMachine}
      />

      <Inspector
        machine={value.machines.find((m) => m.id === selected) ?? null}
        onChange={updateMachine}
      />
    </div>
  );
};

export default FlowEditor;
