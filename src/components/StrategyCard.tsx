import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Strategy } from '@/utils/priceRules';
import { Edit2, Save, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface StrategyCardProps {
  strategy: Strategy;
  strategyName: string;
  onUpdate: (updatedStrategy: Strategy) => void;
  onEditChange?: (isEditing: boolean) => void;
  isDefaultStrategy?: boolean;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, strategyName, onUpdate, onEditChange, isDefaultStrategy = false }) => {
const [isEditing, setIsEditing] = useState(false);
  const [editedStrategy, setEditedStrategy] = useState<Strategy>({ ...strategy });

  const handleSave = () => {
    onUpdate(editedStrategy);
    setIsEditing(false);
    if (onEditChange) onEditChange(false);
    toast.success('Strategy updated successfully');
  };

  const handleCancel = () => {
    setEditedStrategy({ ...strategy });
    setIsEditing(false);
    if (onEditChange) onEditChange(false);
  };

  const handleSetEditing = (value: boolean) => {
    setIsEditing(value);
    if (onEditChange) onEditChange(value);
  };

  const handleChange = (field: keyof Strategy, value: any) => {
    setEditedStrategy(prev => ({ ...prev, [field]: value }));
  };

  const generateStrategyDescription = (strategy: Strategy): string => {
    let description = `This strategy uses a ${strategy.TrimFraction * 100}% trim fraction for market average calculation. `;
    
    if (strategy.LowestPriceIndex) {
      description += `It positions your price at the ${getPositionText(strategy.LowestPriceIndex)} from the top. `;
    }
    
    if (strategy.PercentageAdjustment !== 0) {
      const adjustmentDirection = strategy.PercentageAdjustment < 0 ? 'decreased' : 'increased';
      const percentage = Math.abs(strategy.PercentageAdjustment * 100);
      description += `Prices are ${adjustmentDirection} by ${percentage}% from the market average. `;
    }
    
    if (strategy.FixedAdjustment !== 0) {
      const adjustmentDirection = strategy.FixedAdjustment < 0 ? 'decreased' : 'increased';
      const amount = Math.abs(strategy.FixedAdjustment);
      description += `Prices are ${adjustmentDirection} by ${amount}€ from the market average. `;
    }
    
    description += `API retries: ${strategy.MaxRetries} with ${strategy.RetryDelaySeconds}s delay.`;
    
    return description;
  };

  const getPositionText = (position: number): string => {
    if (position === 1) return '1st';
    if (position === 2) return '2nd';
    if (position === 3) return '3rd';
    return `${position}th`;
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 shadow-card hover:shadow-hover animate-fade-in glass-morphism border-0 mb-4">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-auto px-3 py-1 bg-primary/10 rounded-full mr-3">
              <span className="text-sm font-medium text-primary">{strategyName}</span>
            </div>
            <h3 className="text-lg font-medium">
              Strategy
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetEditing(true)}
                className="rounded-full h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-green-500 hover:bg-green-500/10 transition-all"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <p className="text-sm text-muted-foreground mt-2 pr-10">
            {generateStrategyDescription(strategy)}
          </p>
        )}

        {isEditing && isDefaultStrategy && (
          <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label htmlFor={`trim-fraction-${strategyName}`} className="text-sm font-medium mb-1 block">
                  Trim Fraction
                </label>
                <Input
                  id={`trim-fraction-${strategyName}`}
                  type="number"
                  value={editedStrategy.TrimFraction}
                  onChange={(e) => handleChange('TrimFraction', parseFloat(e.target.value))}
                  disabled={!isEditing}
                  step="0.01"
                  min="0"
                  max="0.5"
                  className="h-10"
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Percentage of outliers to trim (0.05 = 5%)
                </span>
              </div>

              <div>
                <label htmlFor={`market-average-${strategyName}`} className="text-sm font-medium mb-1 block">
                  Market Average Method
                </label>
                <Select
                  disabled={!isEditing}
                  value={editedStrategy.MarketAverage}
                  onValueChange={(value) => handleChange('MarketAverage', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select average method" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mean">Mean</SelectItem>
                      <SelectItem value="Median">Median</SelectItem>
                      <SelectItem value="TrimmedMean">Trimmed Mean</SelectItem>
                      <SelectItem value="MarketAverageMethod">Market Average Method</SelectItem>
                    </SelectContent>
                </Select>

                <span className="text-xs text-muted-foreground mt-1 block">
                  Type of average calculation
                </span>
              </div>

              <div>
                <label htmlFor={`lowest-price-index-${strategyName}`} className="text-sm font-medium mb-1 block">
                  Lowest Price Index
                </label>
                <Input
                  id={`lowest-price-index-${strategyName}`}
                  type="number"
                  value={editedStrategy.LowestPriceIndex || 0}
                  onChange={(e) => handleChange('LowestPriceIndex', parseInt(e.target.value))}
                  disabled={!isEditing}
                  min="0"
                  step="1"
                  className="h-10"
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Position in the price list (0 to disable)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor={`percentage-adjustment-${strategyName}`} className="text-sm font-medium mb-1 block">
                  Percentage Adjustment
                </label>
                <Input
                  id={`percentage-adjustment-${strategyName}`}
                  type="number"
                  value={editedStrategy.PercentageAdjustment}
                  onChange={(e) => handleChange('PercentageAdjustment', parseFloat(e.target.value))}
                  disabled={!isEditing}
                  step="0.01"
                  className="h-10"
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Negative for discount, positive for markup (e.g., -0.1 = -10%)
                </span>
              </div>

              <div>
                <label htmlFor={`fixed-adjustment-${strategyName}`} className="text-sm font-medium mb-1 block">
                  Fixed Adjustment (€)
                </label>
                <Input
                  id={`fixed-adjustment-${strategyName}`}
                  type="number"
                  value={editedStrategy.FixedAdjustment}
                  onChange={(e) => handleChange('FixedAdjustment', parseFloat(e.target.value))}
                  disabled={!isEditing}
                  step="0.01"
                  className="h-10"
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Negative for discount, positive for markup
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`max-retries-${strategyName}`} className="text-sm font-medium mb-1 block">
                    Max Retries
                  </label>
                  <Input
                    id={`max-retries-${strategyName}`}
                    type="number"
                    value={editedStrategy.MaxRetries}
                    onChange={(e) => handleChange('MaxRetries', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    step="1"
                    className="h-10"
                  />
                </div>
                <div>
                  <label htmlFor={`retry-delay-${strategyName}`} className="text-sm font-medium mb-1 block">
                    Retry Delay (s)
                  </label>
                  <Input
                    id={`retry-delay-${strategyName}`}
                    type="number"
                    value={editedStrategy.RetryDelaySeconds}
                    onChange={(e) => handleChange('RetryDelaySeconds', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    step="1"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StrategyCard;
