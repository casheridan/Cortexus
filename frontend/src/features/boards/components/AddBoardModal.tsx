import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface NewBoard {
  name: string;
  internalSerialNumber: string;
  assemblyNumber: string;
  machineRecipes: Record<string, boolean>;
}

interface ExistingBoard {
  id: string;
  name: string;
  internalSerialNumber: string;
  assemblyNumber: string;
  lastRanTime: string;
  currentStation?: string;
  linkedComponents?: Array<{
    id: string;
    description: string;
    internalPartNumber: string;
    referenceDesignator: string;
    quantity: number;
  }>;
  machineRecipes?: Record<string, boolean>;
}

interface AddBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBoard: (board: NewBoard) => void;
  onUpdateBoard?: (boardId: string, board: NewBoard) => void;
  editingBoard?: ExistingBoard | null;
}

// Selectors
const selectAllLines = (state: RootState) => state.lineConfig.lines;

const selectAllMachines = createSelector(
  [selectAllLines],
  (lines) => {
    const machines: Array<{
      machineName: string;
      machineType: string;
      lineId: string;
      lineName: string;
    }> = [];
    lines.forEach(line => {
      line.machines.forEach(machine => {
        machines.push({
          machineName: machine.name,
          machineType: machine.type,
          lineId: line.id,
          lineName: line.name,
        });
      });
    });
    return machines;
  }
);

const AddBoardModal: React.FC<AddBoardModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddBoard, 
  onUpdateBoard,
  editingBoard 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    internalSerialNumber: '',
    assemblyNumber: '',
  });
  const [machineRecipes, setMachineRecipes] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allMachines = useSelector(selectAllMachines);

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen && allMachines.length > 0) {
      if (editingBoard) {
        // Populate form with existing board data
        setFormData({
          name: editingBoard.name,
          internalSerialNumber: editingBoard.internalSerialNumber,
          assemblyNumber: editingBoard.assemblyNumber,
        });
        
        // Set machine recipes from existing board or default to false
        const initialRecipes: Record<string, boolean> = {};
        allMachines.forEach(machine => {
          initialRecipes[machine.machineName] = editingBoard.machineRecipes?.[machine.machineName] || false;
        });
        setMachineRecipes(initialRecipes);
      } else {
        // Reset form for new board
        setFormData({
          name: '',
          internalSerialNumber: '',
          assemblyNumber: '',
        });
        
        const initialRecipes: Record<string, boolean> = {};
        allMachines.forEach(machine => {
          initialRecipes[machine.machineName] = false;
        });
        setMachineRecipes(initialRecipes);
      }
    }
  }, [isOpen, allMachines, editingBoard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMachineRecipeChange = (machineName: string, hasRecipe: boolean) => {
    setMachineRecipes(prev => ({ ...prev, [machineName]: hasRecipe }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required';
    }

    if (!formData.internalSerialNumber.trim()) {
      newErrors.internalSerialNumber = 'Internal serial number is required';
    }

    if (!formData.assemblyNumber.trim()) {
      newErrors.assemblyNumber = 'Assembly number is required';
    }

    // Check for duplicate serial numbers (in real app, this would be a server-side check)
    if (formData.internalSerialNumber.trim()) {
      // Mock validation - in real app, check against existing boards
      const existingSerials = ['MCB-2024-001247', 'PMB-2024-001248', 'SIB-2024-001249'];
      // Skip duplicate check if editing the same board
      const isEditingCurrentSerial = editingBoard?.internalSerialNumber === formData.internalSerialNumber.trim();
      if (!isEditingCurrentSerial && existingSerials.includes(formData.internalSerialNumber.trim())) {
        newErrors.internalSerialNumber = 'This serial number already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const boardData: NewBoard = {
      ...formData,
      machineRecipes,
    };

    if (editingBoard && onUpdateBoard) {
      onUpdateBoard(editingBoard.id, boardData);
    } else {
      onAddBoard(boardData);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      internalSerialNumber: '',
      assemblyNumber: '',
    });
    setMachineRecipes({});
    setErrors({});
    onClose();
  };

  const handleSelectAllMachines = () => {
    const allSelected = Object.values(machineRecipes).every(Boolean);
    const newState = !allSelected;
    const updatedRecipes: Record<string, boolean> = {};
    Object.keys(machineRecipes).forEach(machine => {
      updatedRecipes[machine] = newState;
    });
    setMachineRecipes(updatedRecipes);
  };

  const selectedCount = Object.values(machineRecipes).filter(Boolean).length;
  const totalCount = Object.keys(machineRecipes).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBoard ? 'Edit Board' : 'Add New Board'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Board Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Board Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Main Control Board"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="internalSerialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Serial Number *
                  </label>
                  <input
                    type="text"
                    id="internalSerialNumber"
                    name="internalSerialNumber"
                    value={formData.internalSerialNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.internalSerialNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., MCB-2024-001250"
                  />
                  {errors.internalSerialNumber && <p className="text-red-600 text-sm mt-1">{errors.internalSerialNumber}</p>}
                </div>

                <div>
                  <label htmlFor="assemblyNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Assembly Number *
                  </label>
                  <input
                    type="text"
                    id="assemblyNumber"
                    name="assemblyNumber"
                    value={formData.assemblyNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.assemblyNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., ASM-PCB-A7832"
                  />
                  {errors.assemblyNumber && <p className="text-red-600 text-sm mt-1">{errors.assemblyNumber}</p>}
                </div>
              </div>
            </div>

            {/* Machine Recipe Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Machine Recipe Configuration</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedCount} of {totalCount} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllMachines}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
              
              {allMachines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {allMachines.map((machine) => (
                    <div key={`${machine.lineId}-${machine.machineName}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{machine.machineName}</h4>
                          <p className="text-xs text-gray-500">{machine.lineName} • {machine.machineType}</p>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={machineRecipes[machine.machineName] || false}
                            onChange={(e) => handleMachineRecipeChange(machine.machineName, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            Has Recipe
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No machines configured. Please configure machines in Line Configuration first.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{editingBoard ? 'Update Board' : 'Add Board'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoardModal;
