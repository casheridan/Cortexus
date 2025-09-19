import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import AddBoardModal from './components/AddBoardModal';
import CSVUploader from './components/CSVUploader';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  Squares2X2Icon,
  CpuChipIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { 
  fetchBoards, 
  addBoard, 
  updateBoard, 
  updateBoardComponents,
  clearError,
  type Board,
  type NewBoardData,
  type Component
} from './state/boardsSlice';

// Recipe status interface for machine checkboxes
interface MachineRecipeStatus {
  machineName: string;
  machineType: string;
  lineId: string;
  lineName: string;
  hasRecipe: boolean;
}

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
  const dispatch = useDispatch();
  
  // Redux state
  const { boards, loading, error } = useSelector((state: RootState) => state.boards);
  const allMachines = useSelector(selectAllMachines);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [componentSearchTerm, setComponentSearchTerm] = useState('');

  // Load boards on component mount (but only if we don't have data already)
  useEffect(() => {
    if (boards.length === 0) {
      dispatch(fetchBoards() as any);
    }
  }, [dispatch, boards.length]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

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
    description: string;
    internalPartNumber: string;
    referenceDesignator: string;
    quantity: number;
  }>) => {
    const formattedComponents: Component[] = components.map(comp => ({
      id: `comp-${Date.now()}-${Math.random()}`,
      ...comp
    }));
    
    dispatch(updateBoardComponents({ boardId, components: formattedComponents }) as any);
    
    // Update selected board if it's the one being updated
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(prev => prev ? {
        ...prev,
        linkedComponents: [...(prev.linkedComponents || []), ...formattedComponents]
      } : null);
    }
    
    console.log(`Added ${components.length} components to board ${boardId}:`, components);
  };

  const handleAddBoard = (newBoardData: NewBoardData) => {
    dispatch(addBoard(newBoardData) as any);
  };

  const handleUpdateBoard = (boardId: string, updatedData: NewBoardData) => {
    dispatch(updateBoard({ id: boardId, boardData: updatedData }) as any);
    
    // Update selected board if it's the one being edited
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(prev => prev ? { ...prev, ...updatedData } : null);
    }
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setShowAddModal(true);
  };

  // Show loading state
  if (loading && boards.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading boards</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(fetchBoards() as any)}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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