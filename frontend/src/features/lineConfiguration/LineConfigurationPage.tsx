import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import MachineModal from './components/MachineModal';
import FlowEditor from './components/FlowEditor';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addLine, deleteLine,
  openEditor, closeEditor, saveEditor,
  setWorking
} from './state/lineConfigSlice';
import type { LineConfig, Machine } from './types';

const LineConfigurationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(s => s.lineConfig.lines);
  const editor = useAppSelector(s => s.lineConfig.editor);

  const isDirty =
    editor.working && editor.original
      ? JSON.stringify(editor.working) !== JSON.stringify(editor.original)
      : false;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Line Configuration</h1>
                <p className="text-sm text-gray-500">Define SMT production lines, stations, and display order.</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => dispatch(addLine())}
              >
                + New Line
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Configured Lines</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Line Name</th>
                      <th className="px-6 py-3 font-semibold">Stations (order)</th>
                      <th className="px-6 py-3 font-semibold">Is Active</th>
                      <th className="px-6 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line: LineConfig, idx: number) => (
                      <tr key={line.id} className="text-gray-900">
                        <td className="px-6 py-3">{line.name}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-2">
                            {line.machines.map((s: Machine, i: number) => (
                              <span key={s.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                                {i + 1}. {s.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs hover:bg-gray-50"
                              onClick={() => dispatch(openEditor(idx))}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => dispatch(deleteLine(idx))}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
                Tip: Drag machines in the flow editor to rearrange layout. Use Save to persist.
              </div>
            </div>
          </div>
        </main>
      </div>

      {editor.isOpen && editor.working && (
        <MachineModal
          title={`${editor.working.name} — Flow Editor`}
          isDirty={!!isDirty}
          onClose={() => dispatch(closeEditor())}
          onSave={() => dispatch(saveEditor())}
          onAdd={() => {
            // Keep 'add machine' logic in slice
            // dispatch(addMachine()) – we’ll do this inside FlowEditor toolbar or pass a callback
            // For now we’ll just reuse the old approach by modifying working directly:
            const w = editor.working!;
            const nx = (w.machines.length + 1) * 220;
            const newM = {
              id: Math.random().toString(36).slice(2, 10),
              name: `New Machine ${w.machines.length + 1}`,
              type: 'Custom',
              x: nx, y: 350,
              imageUrl: '',
              cfx: { host: '10.0.0.100', port: 1883, topic: 'cfx/new' },
              params: {},
            };
            const updated = { ...w, machines: [...w.machines, newM] };
            dispatch(setWorking(updated));
          }}
        >
          <FlowEditor
            value={editor.working}
            onChange={(v) => dispatch(setWorking(v))}
          />
        </MachineModal>
      )}
    </div>
  );
};

export default LineConfigurationPage;
