
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateStrategies, defaultUpdateStrategies, CustomRule } from '@/utils/priceRules';

interface FileActionsProps {
  data: UpdateStrategies;
  onDataLoad: (data: UpdateStrategies) => void;
  onExtractJWT?: (token: string) => void;
}

const FileActions: React.FC<FileActionsProps> = ({ data, onDataLoad, onExtractJWT }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  // Normalize property names from camelCase to PascalCase if needed
  const normalizeCustomRule = (rule: any): CustomRule => {
    // Preserve the original MarketAverage value if present, or use camelCase version, or default
    const marketAverage = (rule.MarketAverage || rule.marketAverage || 'TrimmedMean') as 'Mean' | 'Median' | 'TrimmedMean';
    console.log("Normalizing MarketAverage:", marketAverage);
    
    const normalizedRule: CustomRule = {
      MinPriceRange: rule.MinPriceRange ?? rule.minPriceRange ?? 0,
      MaxPriceRange: rule.MaxPriceRange ?? rule.maxPriceRange ?? 10,
      PriceAdjustmentType: rule.PriceAdjustmentType ?? rule.priceAdjustmentType ?? 'LowestPriceIndex',
      LowestPriceIndex: rule.LowestPriceIndex ?? rule.lowestPriceIndex,
      AdjustmentPercentage: rule.AdjustmentPercentage ?? rule.adjustmentPercentage,
      FixedAdjustment: rule.FixedAdjustment ?? rule.fixedAdjustment,
      MinAllowedPrice: rule.MinAllowedPrice ?? rule.minAllowedPrice ?? 0.1,
      TrimFraction: rule.TrimFraction ?? rule.trimFraction,
      MarketAverage: marketAverage
    };
    
    console.log("Normalized rule with MarketAverage:", normalizedRule.MarketAverage);
    
    return normalizedRule;
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
          
          // Extract JWT token if available and callback is provided
          if (onExtractJWT && jsonData.ApiSettings?.CardTrader?.JWTToken) {
            onExtractJWT(jsonData.ApiSettings.CardTrader.JWTToken);
          }
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
        
        // Normalize custom rules to handle camelCase vs PascalCase properties
        parsedData.CustomRules = parsedData.CustomRules.map(normalizeCustomRule);
        
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
    // Start with minimal structure when creating a new file
    const minimalConfig: UpdateStrategies = {
      UseCustomRules: true,
      PriceAdjustmentStrategy: "Moderate",
      PriceAdjustmentType: "LowestPriceIndex",
      MarketAverage: "TrimmedMean",
      CustomRules: [],
      Strategies: defaultUpdateStrategies.Strategies
    };
    
    onDataLoad(minimalConfig);
    if (onExtractJWT) {
      onExtractJWT("");
    }
    toast.success('New configuration created');
  };

  const handleDownload = () => {
    // Get the current JWT token by looking for the element in the DOM
    const jwtTokenElement = document.getElementById('jwt-token') as HTMLInputElement;
    const jwtToken = jwtTokenElement ? jwtTokenElement.value : "";
    
    // Create a file with the same complex structure, but only with our UpdateStrategies data
    // This preserves the overall structure while updating only our part
    const completeData = {
      UpdateStrategies: data,
      // Include ApiSettings with the JWT token
      ApiSettings: {
        CardTrader: {
          JWTToken: jwtToken
        }
      },
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
