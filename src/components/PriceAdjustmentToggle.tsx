
import React from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PriceAdjustmentToggleProps {
  useCustomRules: boolean;
  onChange: (value: boolean) => void;
}

const PriceAdjustmentToggle: React.FC<PriceAdjustmentToggleProps> = ({
  useCustomRules,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 mb-6 glass-morphism rounded-xl shadow-card transition-all duration-300">
      <div className="flex flex-col items-start">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "h-2 w-2 rounded-full transition-colors",
            useCustomRules ? "bg-green-500" : "bg-gray-300"
          )} />
          <Label 
            htmlFor="custom-rules" 
            className="text-lg font-medium tracking-tight"
          >
            Custom Rules
          </Label>
        </div>
        <p className="text-sm text-muted-foreground mt-1 pl-4">
          {useCustomRules 
            ? "Applying price rules based on custom configurations" 
            : "Using standard pricing strategy"
          }
        </p>
      </div>
      <Switch
        id="custom-rules"
        checked={useCustomRules}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};

export default PriceAdjustmentToggle;
