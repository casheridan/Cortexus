import React from 'react';
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

type Props = {
  title: string;
  isDirty: boolean;
  onClose: () => void;
  onSave: () => void;
  onAdd: () => void;
  children: React.ReactNode;
};

const MachineModal: React.FC<Props> = ({ title, isDirty, onClose, onSave, onAdd, children }) => {
  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* content */}
      <div className="absolute inset-4 md:inset-8 rounded-2xl shadow-2xl overflow-hidden bg-white flex flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 h-14 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h2>

          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={onSave}
                className="inline-flex items-center gap-1 rounded-md bg-green-600 text-white text-sm px-3 py-1.5 hover:bg-green-700"
                title="Save changes"
              >
                <CheckIcon className="w-5 h-5" />
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 text-gray-700 text-sm px-3 py-1.5 hover:bg-gray-50"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
              Close
            </button>
          </div>
        </div>

        {/* main area */}
        <div className="relative flex-1 overflow-hidden">
          {children}

          {/* bottom-left add button */}
          <div className="absolute left-4 bottom-4">
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 shadow-sm px-3 py-2 text-sm hover:bg-gray-50"
              title="Add machine"
            >
              <PlusIcon className="w-5 h-5 text-gray-600" />
              Add Machine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineModal;
