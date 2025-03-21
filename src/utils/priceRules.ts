
export interface CustomRule {
  MinPriceRange: number;
  MaxPriceRange: number;
  PriceAdjustmentType: 'LowestPriceIndex' | 'PercentageAdjustment' | 'FixedAdjustment';
  LowestPriceIndex?: number;
  AdjustmentPercentage?: number;
  FixedAdjustment?: number;
  MinAllowedPrice: number;
  TrimFraction?: number;
}

export interface Strategy {
  TrimFraction: number;
  MaxRetries: number;
  RetryDelaySeconds: number;
  LowestPriceIndex?: number;
  MarketAverage: string;
  PercentageAdjustment: number;
  FixedAdjustment: number;
}

export interface UpdateStrategies {
  UseCustomRules: boolean;
  PriceAdjustmentStrategy: string;
  PriceAdjustmentType: string;
  MarketAverage: string;
  CustomRules: CustomRule[];
  Strategies: {
    Aggressive: Strategy;
    Moderate: Strategy;
    Conservative: Strategy;
  };
}

export const defaultUpdateStrategies: UpdateStrategies = {
  UseCustomRules: false,
  PriceAdjustmentStrategy: "Moderate",
  PriceAdjustmentType: "LowestPriceIndex",
  MarketAverage: "TrimmedMean",
  CustomRules: [
    {
      MinPriceRange: 0,
      MaxPriceRange: 1,
      PriceAdjustmentType: "LowestPriceIndex",
      LowestPriceIndex: 2,
      MinAllowedPrice: 0.1,
    },
    {
      MinPriceRange: 1,
      MaxPriceRange: 5,
      PriceAdjustmentType: "LowestPriceIndex",
      LowestPriceIndex: 3,
      MinAllowedPrice: 0.1,
    },
    {
      MinPriceRange: 5,
      MaxPriceRange: 10,
      PriceAdjustmentType: "LowestPriceIndex",
      AdjustmentPercentage: -0.1,
      LowestPriceIndex: 1,
      MinAllowedPrice: 5,
    },
    {
      MinPriceRange: 10,
      MaxPriceRange: 20,
      PriceAdjustmentType: "LowestPriceIndex",
      AdjustmentPercentage: -0.1,
      MinAllowedPrice: 10,
      LowestPriceIndex: 2,
      TrimFraction: 0.1,
    }
  ],
  Strategies: {
    Aggressive: {
      TrimFraction: 0.05,
      MaxRetries: 3,
      RetryDelaySeconds: 1,
      LowestPriceIndex: 1,
      MarketAverage: "Median",
      PercentageAdjustment: -0.1,
      FixedAdjustment: 0
    },
    Moderate: {
      TrimFraction: 0.1,
      MaxRetries: 5,
      RetryDelaySeconds: 2,
      LowestPriceIndex: 5,
      MarketAverage: "Median",
      PercentageAdjustment: 0,
      FixedAdjustment: 0
    },
    Conservative: {
      TrimFraction: 0.2,
      MaxRetries: 7,
      RetryDelaySeconds: 3,
      MarketAverage: "Median",
      PercentageAdjustment: 0,
      FixedAdjustment: -0.5
    }
  }
};

export const generateRuleDescription = (rule: CustomRule): string => {
  let description = `Products between ${rule.MinPriceRange}€ and ${rule.MaxPriceRange}€ will `;
  
  if (rule.PriceAdjustmentType === 'LowestPriceIndex' && rule.LowestPriceIndex) {
    description += `have a positional price, meaning that you will be the ${getPositionText(rule.LowestPriceIndex)} vendor from the top. `;
    
    if (rule.AdjustmentPercentage && rule.AdjustmentPercentage < 0) {
      const percentage = Math.abs(rule.AdjustmentPercentage * 100);
      description += `An additional ${percentage}% will be subtracted from the price. `;
    }
  } else if (rule.PriceAdjustmentType === 'PercentageAdjustment' && rule.AdjustmentPercentage) {
    const adjustmentDirection = rule.AdjustmentPercentage < 0 ? 'decreased' : 'increased';
    const percentage = Math.abs(rule.AdjustmentPercentage * 100);
    description += `be ${adjustmentDirection} by ${percentage}% from the market average. `;
  } else if (rule.PriceAdjustmentType === 'FixedAdjustment' && rule.FixedAdjustment !== undefined) {
    const adjustmentDirection = rule.FixedAdjustment < 0 ? 'decreased' : 'increased';
    const amount = Math.abs(rule.FixedAdjustment);
    description += `be ${adjustmentDirection} by ${amount}€ from the market average. `;
  }

  description += `The price will never be less than ${rule.MinAllowedPrice}€.`;
  
  return description;
};

const getPositionText = (position: number): string => {
  if (position === 1) return '1st';
  if (position === 2) return '2nd';
  if (position === 3) return '3rd';
  return `${position}th`;
};

export const createNewRule = (): CustomRule => ({
  MinPriceRange: 0,
  MaxPriceRange: 10,
  PriceAdjustmentType: 'LowestPriceIndex',
  LowestPriceIndex: 1,
  MinAllowedPrice: 0.1
});
