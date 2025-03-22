
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomRule, generateRuleDescription } from '@/utils/priceRules';
import { Trash2, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface RuleCardProps {
  rule: CustomRule;
  onUpdate: (updatedRule: CustomRule) => void;
  onDelete: () => void;
  index: number;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onUpdate, onDelete, index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState<CustomRule>({ ...rule });

  const handleSave = () => {
    if (editedRule.MinPriceRange >= editedRule.MaxPriceRange) {
      toast.error('Min price must be less than max price');
      return;
    }
    onUpdate(editedRule);
    setIsEditing(false);
    toast.success('Rule updated successfully');
  };

  const handleCancel = () => {
    setEditedRule({ ...rule });
    setIsEditing(false);
  };

  const handleChange = (field: keyof CustomRule, value: any) => {
    setEditedRule(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 shadow-card hover:shadow-hover animate-fade-in glass-morphism border-0 mb-4">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-7 h-7 bg-primary/10 rounded-full mr-3">
              <span className="text-sm font-medium text-primary">{index + 1}</span>
            </div>
            <h3 className="text-lg font-medium">
              {rule.MinPriceRange}€ - {rule.MaxPriceRange}€
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="rounded-full h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
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
            {generateRuleDescription(rule)}
          </p>
        )}

        {isEditing && (
          <div className={`mt-4 grid gap-4 ${isEditing ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} animate-fade-in`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`min-price-${index}`} className="text-sm font-medium mb-1 block">
                    Min Price (€)
                  </label>
                  <Input
                    id={`min-price-${index}`}
                    type="number"
                    value={editedRule.MinPriceRange}
                    onChange={(e) => handleChange('MinPriceRange', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    step="0.01"
                    min="0"
                    className="h-10"
                  />
                </div>
                <div>
                  <label htmlFor={`max-price-${index}`} className="text-sm font-medium mb-1 block">
                    Max Price (€)
                  </label>
                  <Input
                    id={`max-price-${index}`}
                    type="number"
                    value={editedRule.MaxPriceRange}
                    onChange={(e) => handleChange('MaxPriceRange', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    step="0.01"
                    min="0"
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`adjustment-type-${index}`} className="text-sm font-medium mb-1 block">
                  Adjustment Type
                </label>
                <Select
                  disabled={!isEditing}
                  value={editedRule.PriceAdjustmentType}
                  onValueChange={(value) => handleChange('PriceAdjustmentType', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LowestPriceIndex">Lowest Price Index</SelectItem>
                    <SelectItem value="PercentageAdjustment">Percentage Adjustment</SelectItem>
                    <SelectItem value="FixedAdjustment">Fixed Adjustment</SelectItem>
                    <SelectItem value="MarketAverageMethod">Market Average Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor={`market-average-${index}`} className="text-sm font-medium mb-1 block">
                  Market Average Method
                </label>
                <Select
                  disabled={!isEditing}
                  value={editedRule.MarketAverage || 'Mean'}
                  onValueChange={(value) => handleChange('MarketAverage', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select market average method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mean">Mean</SelectItem>
                    <SelectItem value="Median">Median</SelectItem>
                    <SelectItem value="TrimmedMean">Trimmed Mean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {editedRule.PriceAdjustmentType === 'LowestPriceIndex' && (
                <div>
                  <label htmlFor={`lowest-price-index-${index}`} className="text-sm font-medium mb-1 block">
                    Lowest Price Index
                  </label>
                  <Input
                    id={`lowest-price-index-${index}`}
                    type="number"
                    value={editedRule.LowestPriceIndex || 1}
                    onChange={(e) => handleChange('LowestPriceIndex', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    step="1"
                    className="h-10"
                  />
                </div>
              )}

              {editedRule.PriceAdjustmentType === 'PercentageAdjustment' && (
                <div>
                  <label htmlFor={`adjustment-percentage-${index}`} className="text-sm font-medium mb-1 block">
                    Adjustment Percentage
                  </label>
                  <Input
                    id={`adjustment-percentage-${index}`}
                    type="number"
                    value={editedRule.AdjustmentPercentage || 0}
                    onChange={(e) => handleChange('AdjustmentPercentage', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    step="0.01"
                    className="h-10"
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Negative for discount, positive for markup
                  </span>
                </div>
              )}

              {editedRule.PriceAdjustmentType === 'FixedAdjustment' && (
                <div>
                  <label htmlFor={`fixed-adjustment-${index}`} className="text-sm font-medium mb-1 block">
                    Fixed Adjustment (€)
                  </label>
                  <Input
                    id={`fixed-adjustment-${index}`}
                    type="number"
                    value={editedRule.FixedAdjustment || 0}
                    onChange={(e) => handleChange('FixedAdjustment', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    step="0.01"
                    className="h-10"
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Negative for discount, positive for markup
                  </span>
                </div>
              )}

              {editedRule.PriceAdjustmentType === 'MarketAverageMethod' && editedRule.MarketAverage === 'TrimmedMean' && (
                <div>
                  <label htmlFor={`trim-fraction-${index}`} className="text-sm font-medium mb-1 block">
                    Trim Fraction
                  </label>
                  <Input
                    id={`trim-fraction-${index}`}
                    type="number"
                    value={editedRule.TrimFraction || 0.1}
                    onChange={(e) => handleChange('TrimFraction', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    step="0.01"
                    min="0"
                    max="0.5"
                    className="h-10"
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Fraction of values to trim from each end (0-0.5)
                  </span>
                </div>
              )}

              <div>
                <label htmlFor={`min-allowed-price-${index}`} className="text-sm font-medium mb-1 block">
                  Min Allowed Price (€)
                </label>
                <Input
                  id={`min-allowed-price-${index}`}
                  type="number"
                  value={editedRule.MinAllowedPrice}
                  onChange={(e) => handleChange('MinAllowedPrice', parseFloat(e.target.value))}
                  disabled={!isEditing}
                  step="0.01"
                  min="0"
                  className="h-10"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RuleCard;
