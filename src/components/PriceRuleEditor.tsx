
import React, { useState, useEffect } from 'react';
import RuleCard from './RuleCard';
import StrategyCard from './StrategyCard';
import AddRuleButton from './AddRuleButton';
import PriceAdjustmentToggle from './PriceAdjustmentToggle';
import ConfirmDialog from './ConfirmDialog';
import { CustomRule, Strategy, UpdateStrategies, createNewRule } from '@/utils/priceRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BarChart, Edit, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PriceRuleEditorProps {
  initialData: UpdateStrategies;
  onSave: (data: UpdateStrategies) => void;
  jwtToken: string;
  onJWTUpdate: (token: string) => void;
}

const PriceRuleEditor: React.FC<PriceRuleEditorProps> = ({ initialData, onSave, jwtToken, onJWTUpdate }) => {
  // Initialize with deep copy to avoid direct mutations of initialData
  const [data, setData] = useState<UpdateStrategies>(() => {
    // Ensure all custom rules have a MarketAverage value on initial load
    const validatedInitialData = {
      ...initialData,
      CustomRules: initialData.CustomRules.map(rule => ({
        ...rule,
        MarketAverage: rule.MarketAverage || 'TrimmedMean'
      }))
    };
    return validatedInitialData;
  });
  
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditingJWT, setIsEditingJWT] = useState<boolean>(false);
  const [tempJWT, setTempJWT] = useState<string>(jwtToken);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);

  const handleToggleCustomRules = (value: boolean) => {
    setData(prev => ({ ...prev, UseCustomRules: value }));
    toast(value ? 'Custom rules enabled' : 'Custom rules disabled');
  };

  const handleAddRule = () => {
    const newRule = createNewRule();
    setData(prev => ({
      ...prev,
      CustomRules: [...prev.CustomRules, newRule]
    }));
    toast.success('New rule added');
  };

  // Ensure MarketAverage is consistently set
  useEffect(() => {
    if (data.CustomRules.some(rule => !rule.MarketAverage)) {
      const updatedRules = data.CustomRules.map(rule => ({
        ...rule,
        MarketAverage: rule.MarketAverage || 'TrimmedMean'
      }));
      
      setData(prev => ({
        ...prev,
        CustomRules: updatedRules
      }));
      
      console.log("Fixed missing MarketAverage values in rules");
    }
  }, [data.CustomRules]);

  const handleUpdateRule = (index: number, updatedRule: CustomRule) => {
    // Ensure MarketAverage is explicitly set before updating
    const validatedRule = {
      ...updatedRule,
      MarketAverage: updatedRule.MarketAverage || 'TrimmedMean'
    };
    
    console.log("Updating rule at index", index, "with MarketAverage:", validatedRule.MarketAverage);
    
    const newRules = [...data.CustomRules];
    newRules[index] = validatedRule;
    
    setData(prev => ({
      ...prev,
      CustomRules: newRules
    }));
  };

  const handleUpdateStrategy = (strategyName: string, updatedStrategy: Strategy) => {
    setData(prev => ({
      ...prev,
      Strategies: {
        ...prev.Strategies,
        [strategyName]: updatedStrategy
      }
    }));
  };

  const handleStrategyEditChange = (strategyName: string, isEditing: boolean) => {
    setEditingStrategy(isEditing ? strategyName : null);
  };

  const handleDeleteRule = (index: number) => {
    const newRules = [...data.CustomRules];
    newRules.splice(index, 1);
    setData(prev => ({
      ...prev,
      CustomRules: newRules
    }));
    toast.success('Rule deleted');
  };

  const handleStrategyChange = (value: string) => {
    setData(prev => ({
      ...prev,
      PriceAdjustmentStrategy: value
    }));
    toast(`Strategy changed to ${value}`);
  };

  const handleEditJWT = () => {
    setIsEditingJWT(true);
    setTempJWT(jwtToken);
  };

  const handleSaveJWT = () => {
    onJWTUpdate(tempJWT);
    setIsEditingJWT(false);
    toast.success('JWT Token updated');
  };

  const handleSave = () => {
    // Final validation before saving to ensure all rules have MarketAverage
    const validatedData = {
      ...data,
      CustomRules: data.CustomRules.map(rule => ({
        ...rule,
        MarketAverage: rule.MarketAverage || 'TrimmedMean'
      }))
    };
    
    console.log("Saving data with validated MarketAverage values:", validatedData);
    onSave(validatedData);
    setIsConfirmDialogOpen(false);
    toast.success('Settings saved successfully', {
      description: 'Your price adjustment rules have been updated.'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm p-4">
        <Label htmlFor="jwt-token" className="text-sm font-medium text-left mb-2">
          JWT Token for API Authentication
        </Label>
        
        {isEditingJWT ? (
          <div className="flex flex-col gap-2">
            <Input
              id="jwt-token"
              value={tempJWT}
              onChange={(e) => setTempJWT(e.target.value)}
              className="font-mono text-xs"
            />
            <div className="flex justify-end gap-2 mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditingJWT(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveJWT}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded border p-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono text-left">
              {jwtToken || "No JWT token set"}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleEditJWT}
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <PriceAdjustmentToggle 
        useCustomRules={data.UseCustomRules} 
        onChange={handleToggleCustomRules} 
      />
      
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <BarChart className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Default Strategy</h2>
        </div>
        <div className="w-48">
          <Select 
            value={data.PriceAdjustmentStrategy}
            onValueChange={handleStrategyChange}
          >
            <SelectTrigger className="transition-all">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aggressive">Aggressive</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Conservative">Conservative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        {editingStrategy === data.PriceAdjustmentStrategy && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Strategy Settings</h2>
            <span className="text-sm text-muted-foreground">
              Edit predefined strategies
            </span>
          </div>
        )}
        
        {Object.entries(data.Strategies).map(([strategyName, strategy]) => (
          <StrategyCard
            key={strategyName}
            strategyName={strategyName}
            strategy={strategy}
            onUpdate={(updatedStrategy) => handleUpdateStrategy(strategyName, updatedStrategy)}
            onEditChange={(isEditing) => handleStrategyEditChange(strategyName, isEditing)}
            isDefaultStrategy={true}
          />
        ))}
      </div>

      <div className={`space-y-4 transition-all duration-300 ${data.UseCustomRules ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Custom Rules</h2>
          <span className="text-sm text-muted-foreground">
            {data.CustomRules.length} {data.CustomRules.length === 1 ? 'rule' : 'rules'}
          </span>
        </div>

        {data.CustomRules.map((rule, index) => (
          <RuleCard
            key={index}
            rule={rule}
            index={index}
            onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
            onDelete={() => handleDeleteRule(index)}
          />
        ))}

        <AddRuleButton onClick={handleAddRule} className="mt-6" />
      </div>

      <div className="mt-10 flex justify-end">
        <Button 
          onClick={() => setIsConfirmDialogOpen(true)}
          className="px-6 py-2 h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleSave}
        title="Save Changes"
        description="Are you sure you want to save these price adjustment settings? This will apply to all future price updates."
        confirmText="Save"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PriceRuleEditor;
