
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
        const parsedData = JSON.parse(content);
        
        // Basic validation to ensure it's an UpdateStrategies object
        if (!parsedData.CustomRules || !Array.isArray(parsedData.CustomRules)) {
          throw new Error('Invalid file format');
        }
        
        onDataLoad(parsedData);
        toast.success('File loaded successfully');
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to load file. The file format is invalid.');
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
    const dataStr = JSON.stringify(data, null, 2);
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
