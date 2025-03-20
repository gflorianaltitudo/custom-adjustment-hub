
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateStrategies, defaultUpdateStrategies } from '@/utils/priceRules';

interface FileActionsProps {
  data: UpdateStrategies;
  onDataLoad: (data: UpdateStrategies) => void;
}

const FileActions: React.FC<FileActionsProps> = ({ data, onDataLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Handle different file structures:
        // 1. Complex structure: { "UpdateStrategies": { ... }, "ApiSettings": { ... }, ... }
        // 2. Simple structure: { "UpdateStrategies": { ... } }
        // 3. Direct structure: { ... } (just the UpdateStrategies content)
        let parsedData: UpdateStrategies;
        
        if (jsonData.UpdateStrategies) {
          // Either complex or simple structure with UpdateStrategies key
          parsedData = jsonData.UpdateStrategies;
        } else if (jsonData.UseCustomRules !== undefined && jsonData.CustomRules) {
          // Direct structure (contains UpdateStrategies properties directly)
          parsedData = jsonData;
        } else {
          throw new Error('No UpdateStrategies found in file');
        }
        
        // Basic validation to ensure it's an UpdateStrategies object
        if (!parsedData.CustomRules || !Array.isArray(parsedData.CustomRules)) {
          throw new Error('Invalid file format: CustomRules missing or not an array');
        }
        
        onDataLoad(parsedData);
        toast.success('File loaded successfully');
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error(`Failed to load file: ${error instanceof Error ? error.message : 'Invalid format'}`);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
    };

    reader.readAsText(file);
    
    // Reset the input to allow opening the same file again
    event.target.value = '';
  };

  const handleCreateNew = () => {
    onDataLoad(defaultUpdateStrategies);
    toast.success('New configuration created');
  };

  const handleDownload = () => {
    // Create a file with the same complex structure, but only with our UpdateStrategies data
    // This preserves the overall structure while updating only our part
    const completeData = {
      UpdateStrategies: data,
      // Include empty placeholders for other sections to maintain the structure
      ApiSettings: {},
      Logging: {
        LogLevel: {
          Default: "Information"
        }
      }
    };
    
    const dataStr = JSON.stringify(completeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price-rules.json';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success('File downloaded successfully');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenFile}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Open</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateNew}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        <span>New</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span>Download</span>
      </Button>
    </div>
  );
};

export default FileActions;
