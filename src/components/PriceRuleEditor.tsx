
import React, { useState } from 'react';
import RuleCard from './RuleCard';
import AddRuleButton from './AddRuleButton';
import PriceAdjustmentToggle from './PriceAdjustmentToggle';
import ConfirmDialog from './ConfirmDialog';
import { CustomRule, UpdateStrategies, createNewRule } from '@/utils/priceRules';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, BarChart } from 'lucide-react';
import { toast } from 'sonner';

interface PriceRuleEditorProps {
  initialData: UpdateStrategies;
  onSave: (data: UpdateStrategies) => void;
}

const PriceRuleEditor: React.FC<PriceRuleEditorProps> = ({ initialData, onSave }) => {
  const [data, setData] = useState<UpdateStrategies>({ ...initialData });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
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

  const handleUpdateRule = (index: number, updatedRule: CustomRule) => {
    const newRules = [...data.CustomRules];
    newRules[index] = updatedRule;
    setData(prev => ({
      ...prev,
      CustomRules: newRules
    }));
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

  const handleSave = () => {
    onSave(data);
    setIsConfirmDialogOpen(false);
    toast.success('Settings saved successfully', {
      description: 'Your price adjustment rules have been updated.'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            disabled={data.UseCustomRules}
          >
            <SelectTrigger className={`transition-all ${!data.UseCustomRules ? 'border-primary/30' : ''}`}>
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
