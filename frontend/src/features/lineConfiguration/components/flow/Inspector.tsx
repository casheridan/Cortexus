import React, { useEffect, useState } from 'react';
import type { Machine } from '../../types';

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

interface InspectorProps {
  machine: Machine | null;
  onChange: (machine: Machine) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ machine, onChange }) => {
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
