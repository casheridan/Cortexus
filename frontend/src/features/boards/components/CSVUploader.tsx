import React, { useRef, useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CSVComponent {
  id: string;
  description: string;
  internalPartNumber: string;
  referenceDesignator: string;
  quantity: number;
  boardId?: string;
}

interface CSVUploaderProps {
  onComponentsUploaded: (components: CSVComponent[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onComponentsUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const parseCSV = (csvText: string): CSVComponent[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['description', 'internalpartnumber', 'referencedesignator', 'quantity'];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const components: CSVComponent[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const component: CSVComponent = {
        id: `comp-${Date.now()}-${i}`,
        description: '',
        internalPartNumber: '',
        referenceDesignator: '',
        quantity: 0,
      };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'description':
            component.description = value;
            break;
          case 'internalpartnumber':
            component.internalPartNumber = value;
            break;
          case 'referencedesignator':
            component.referenceDesignator = value;
            break;
          case 'quantity':
            component.quantity = parseInt(value) || 0;
            break;
          case 'boardid':
            component.boardId = value;
            break;
        }
      });

      if (component.description && component.internalPartNumber && component.referenceDesignator) {
        components.push(component);
      }
    }

    return components;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a CSV file');
      return;
    }

    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const text = await file.text();
      const components = parseCSV(text);
      
      setUploadedCount(components.length);
      setUploadStatus('success');
      onComponentsUploaded(components);
      
      // Reset and collapse after 2 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadedCount(0);
        setIsExpanded(false);
      }, 2000);
      
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse CSV file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Processing CSV...';
      case 'success':
        return `Successfully uploaded ${uploadedCount} components`;
      case 'error':
        return errorMessage;
      default:
        return 'Upload CSV file with component data';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!isExpanded ? (
        /* Compact Button */
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-gray-700"
        >
          <CloudArrowUpIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Upload from File</span>
        </button>
      ) : (
        /* Expanded Upload Interface */
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Upload Component CSV</h4>
            <button
              onClick={() => {
                setIsExpanded(false);
                setUploadStatus('idle');
                setErrorMessage('');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                {getStatusIcon()}
                
                <div>
                  <p className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </p>
                  
                  {uploadStatus === 'idle' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Choose CSV File
                    </button>
                  )}
                  
                  {uploadStatus === 'error' && (
                    <button
                      onClick={() => {
                        setUploadStatus('idle');
                        setErrorMessage('');
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Format Example */}
            {uploadStatus === 'idle' && (
              <div className="text-left">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Required CSV format:</h5>
                <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-600">
                  description,internalPartNumber,referenceDesignator,quantity<br/>
                  4.7K Ohm Resistor,R-4K7-SMD-0603,R1,1<br/>
                  100nF Capacitor,C-100nF-X7R-0603,C1,2
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
