import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import CSVUploader from './components/CSVUploader';
import AddBoardModal from './components/AddBoardModal';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  Squares2X2Icon,
  CpuChipIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Board interface with updated fields
interface Board {
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
  machineRecipes?: Record<string, boolean>; // machineId -> hasRecipe
}

// Recipe status interface for machine checkboxes
interface MachineRecipeStatus {
  machineName: string;
  machineType: string;
  lineId: string;
  lineName: string;
  hasRecipe: boolean;
}

// Mock board data with updated structure
const mockBoards: Board[] = [
  {
    id: 'board-001',
    name: 'Main Control Board',
    internalSerialNumber: 'MCB-2024-001247',
    assemblyNumber: 'ASM-PCB-A7829',
    lastRanTime: '2024-01-15T14:23:15Z',
    linkedComponents: [
      { id: 'comp-001', description: '4.7K Ohm Resistor', internalPartNumber: 'R-4K7-SMD-0603', referenceDesignator: 'R1', quantity: 1 },
      { id: 'comp-002', description: '100nF Capacitor', internalPartNumber: 'C-100nF-X7R-0603', referenceDesignator: 'C1', quantity: 2 },
      { id: 'comp-003', description: 'STM32 Microcontroller', internalPartNumber: 'STM32F407VGT6-LQFP100', referenceDesignator: 'U1', quantity: 1 },
    ],
    machineRecipes: {
      'SMT-1': true,
      'AOI-1': true,
      'Reflow-1': false,
      'SMT-2': true,
      'SPI-1': false,
    }
  },
  {
    id: 'board-002',
    name: 'Power Management Board',
    internalSerialNumber: 'PMB-2024-001248',
    assemblyNumber: 'ASM-PCB-A7830',
    lastRanTime: '2024-01-15T14:20:00Z',
    currentStation: 'SMT-1',
    linkedComponents: [],
    machineRecipes: {
      'SMT-1': true,
      'AOI-1': false,
      'Reflow-1': true,
      'SMT-2': false,
      'SPI-1': true,
    }
  },
  {
    id: 'board-003',
    name: 'Sensor Interface Board',
    internalSerialNumber: 'SIB-2024-001249',
    assemblyNumber: 'ASM-PCB-A7831',
    lastRanTime: '2024-01-15T13:45:00Z',
    linkedComponents: [
      { id: 'comp-004', description: 'Environmental Sensor', internalPartNumber: 'BME280-LGA-2.5x2.5', referenceDesignator: 'U2', quantity: 1 },
    ],
    machineRecipes: {
      'SMT-1': false,
      'AOI-1': true,
      'Reflow-1': true,
      'SMT-2': true,
      'SPI-1': true,
    }
  }
];

// Selectors
const selectAllLines = (state: RootState) => state.lineConfig.lines;

const selectAllMachines = createSelector(
  [selectAllLines],
  (lines) => {
    const machines: MachineRecipeStatus[] = [];
    lines.forEach(line => {
      line.machines.forEach(machine => {
        machines.push({
          machineName: machine.name,
          machineType: machine.type,
          lineId: line.id,
          lineName: line.name,
          hasRecipe: Math.random() > 0.3 // Mock recipe status - replace with real data
        });
      });
    });
    return machines;
  }
);

const BoardsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>(mockBoards);
  const [componentSearchTerm, setComponentSearchTerm] = useState('');

  const allMachines = useSelector(selectAllMachines);

  const filteredBoards = useMemo(() => {
    return boards.filter(board => {
      const matchesSearch = board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           board.internalSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           board.assemblyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [boards, searchTerm]);


  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };


  const handleComponentsUploaded = (boardId: string, components: Array<{
    id: string;
    description: string;
    internalPartNumber: string;
    referenceDesignator: string;
    quantity: number;
    boardId?: string;
  }>) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? {
            ...board,
            linkedComponents: [...(board.linkedComponents || []), ...components]
          }
        : board
    ));
    
    // Update selected board if it's the one being updated
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(prev => prev ? {
        ...prev,
        linkedComponents: [...(prev.linkedComponents || []), ...components]
      } : null);
    }
    
    console.log(`Added ${components.length} components to board ${boardId}:`, components);
  };

  const handleAddBoard = (newBoardData: {
    name: string;
    internalSerialNumber: string;
    assemblyNumber: string;
    machineRecipes: Record<string, boolean>;
  }) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: newBoardData.name,
      internalSerialNumber: newBoardData.internalSerialNumber,
      assemblyNumber: newBoardData.assemblyNumber,
      lastRanTime: new Date().toISOString(),
      linkedComponents: [],
      machineRecipes: newBoardData.machineRecipes,
    };

    setBoards(prev => [...prev, newBoard]);
    setSelectedBoard(newBoard); // Auto-select the newly created board
    console.log('Added new board:', newBoard);
  };

  const handleUpdateBoard = (boardId: string, updatedData: {
    name: string;
    internalSerialNumber: string;
    assemblyNumber: string;
    machineRecipes: Record<string, boolean>;
  }) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? {
            ...board,
            ...updatedData,
            lastRanTime: new Date().toISOString(), // Update last modified time
          }
        : board
    ));
    
    // Update selected board if it's the one being edited
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(prev => prev ? { ...prev, ...updatedData } : null);
    }
    
    console.log('Updated board:', boardId, updatedData);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setShowAddModal(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Board Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage board production and components</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setEditingBoard(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Board</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by board name, serial number, or assembly number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Boards List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Boards ({filteredBoards.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredBoards.map(board => {
              return (
                <div
                  key={board.id}
                  onClick={() => setSelectedBoard(board)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedBoard?.id === board.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Squares2X2Icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{board.name}</p>
                        <p className="text-sm text-gray-500">{board.internalSerialNumber}</p>
                        <p className="text-xs text-gray-400">{board.assemblyNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatTime(board.lastRanTime)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Board Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                Board Details
              </h2>
              {selectedBoard && (
                <button
                  onClick={() => handleEditBoard(selectedBoard)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {selectedBoard ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Board Information</h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block">Board Name:</span>
                      <p className="font-medium text-lg">{selectedBoard.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block">Internal Serial Number:</span>
                      <p className="font-medium">{selectedBoard.internalSerialNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block">Assembly Number:</span>
                      <p className="font-medium">{selectedBoard.assemblyNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block">Last Ran Time:</span>
                      <p className="font-medium">{formatTime(selectedBoard.lastRanTime)}</p>
                    </div>
                    {selectedBoard.currentStation && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500 block">Current Station:</span>
                        <p className="font-medium">{selectedBoard.currentStation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Machine Recipe Status */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Machine Recipe Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allMachines.map((machine) => {
                      const hasRecipe = selectedBoard.machineRecipes?.[machine.machineName] || false;
                      return (
                        <div key={`${machine.lineId}-${machine.machineName}`} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{machine.machineName}</h4>
                              <p className="text-xs text-gray-500">{machine.lineName} • {machine.machineType}</p>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              hasRecipe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {hasRecipe ? 'Recipe Available' : 'No Recipe'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Components Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <CpuChipIcon className="w-5 h-5 mr-2" />
                      Components ({selectedBoard.linkedComponents?.length || 0})
                    </h3>
                  </div>

                  {/* Component Upload */}
                  <div className="mb-4">
                    <CSVUploader onComponentsUploaded={(components) => handleComponentsUploaded(selectedBoard.id, components)} />
                  </div>

                  {/* Component Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search components..."
                        value={componentSearchTerm}
                        onChange={(e) => setComponentSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Components List */}
                  {selectedBoard.linkedComponents && selectedBoard.linkedComponents.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                          <div className="col-span-4">Description</div>
                          <div className="col-span-3">Part Number</div>
                          <div className="col-span-3">Reference</div>
                          <div className="col-span-2">Qty</div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {selectedBoard.linkedComponents
                          .filter(component => 
                            !componentSearchTerm || 
                            component.description.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                            component.internalPartNumber.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                            component.referenceDesignator.toLowerCase().includes(componentSearchTerm.toLowerCase())
                          )
                          .map(component => (
                            <div key={component.id} className="px-4 py-3 hover:bg-gray-50">
                              <div className="grid grid-cols-12 gap-2 text-sm">
                                <div className="col-span-4">
                                  <p className="font-medium text-gray-900 truncate">{component.description}</p>
                                </div>
                                <div className="col-span-3">
                                  <p className="text-gray-600 truncate">{component.internalPartNumber}</p>
                                </div>
                                <div className="col-span-3">
                                  <p className="text-gray-600 font-mono">{component.referenceDesignator}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-900 font-medium">{component.quantity}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                      <CpuChipIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No components added yet</p>
                      <p className="text-sm">Upload a CSV file to add components to this board</p>
                    </div>
                  )}
                </div>

                {/* Future Features Placeholder */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Coming Soon</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      📊 Process History
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      🔍 Component Traceability
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      📈 Quality Trends
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      🔄 Rework History
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Squares2X2Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Select a board from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Board Modal */}
      <AddBoardModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBoard(null);
        }}
        onAddBoard={handleAddBoard}
        onUpdateBoard={handleUpdateBoard}
        editingBoard={editingBoard}
      />
    </div>
  );
};

export default BoardsPage;
