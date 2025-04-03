
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

  const normalizeCustomRule = (rule: any): CustomRule => {
    let marketAverage: 'Mean' | 'Median' | 'TrimmedMean' = 'Mean';
    
    // Safely determine the MarketAverage value while maintaining the exact user selection
    if (rule.MarketAverage === 'Mean' || rule.MarketAverage === 'Median' || rule.MarketAverage === 'TrimmedMean') {
      marketAverage = rule.MarketAverage;
    } else if (rule.marketAverage === 'Mean' || rule.marketAverage === 'Median' || rule.marketAverage === 'TrimmedMean') {
      marketAverage = rule.marketAverage;
    }
    
    console.log("[FileActions] normalizeCustomRule - Original MarketAverage:", rule.MarketAverage || rule.marketAverage, "normalized to:", marketAverage);
    
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
        
        let parsedData: UpdateStrategies;
        
        if (jsonData.UpdateStrategies) {
          parsedData = jsonData.UpdateStrategies;
          
          if (onExtractJWT && jsonData.ApiSettings?.CardTrader?.JWTToken) {
            onExtractJWT(jsonData.ApiSettings.CardTrader.JWTToken);
          }
        } else if (jsonData.UseCustomRules !== undefined && jsonData.CustomRules) {
          parsedData = jsonData;
        } else {
          throw new Error('No UpdateStrategies found in file');
        }
        
        if (!parsedData.CustomRules || !Array.isArray(parsedData.CustomRules)) {
          throw new Error('Invalid file format: CustomRules missing or not an array');
        }
        
        parsedData.CustomRules = parsedData.CustomRules.map(normalizeCustomRule);
        
        console.log("[FileActions] Loaded file with CustomRules MarketAverage values:", 
          parsedData.CustomRules.map((r, i) => `Rule ${i}: ${r.MarketAverage}`));
        
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
    
    event.target.value = '';
  };

  const handleCreateNew = () => {
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
    const jwtTokenElement = document.getElementById('jwt-token') as HTMLInputElement;
    const jwtToken = jwtTokenElement ? jwtTokenElement.value : "";
    
    // Create a deep copy to avoid reference issues
    const dataToDownload = JSON.parse(JSON.stringify(data));
    
    console.log("[FileActions] Download - Original MarketAverage values:", 
      dataToDownload.CustomRules.map((r: CustomRule, i: number) => `Rule ${i}: ${r.MarketAverage}`));
    
    // Ensure each rule's MarketAverage is kept as the actual selected value
    dataToDownload.CustomRules.forEach((rule: any, index: number) => {
      console.log(`[FileActions] Rule ${index} MarketAverage before preparation:`, rule.MarketAverage);
    });
    
    const completeData = {
      UpdateStrategies: dataToDownload,
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
    
    console.log("[FileActions] Final download data CustomRules MarketAverage values:", 
      completeData.UpdateStrategies.CustomRules.map((r: CustomRule, i: number) => `Rule ${i}: ${r.MarketAverage}`));
    
    const dataStr = JSON.stringify(completeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price-rules.json';
    document.body.appendChild(link);
    link.click();
    
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
