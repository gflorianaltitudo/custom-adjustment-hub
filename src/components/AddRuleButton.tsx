
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddRuleButtonProps {
  onClick: () => void;
  className?: string;
}

const AddRuleButton: React.FC<AddRuleButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full h-16 border-dashed border-2 bg-transparent hover:bg-primary/5 transition-all duration-300",
        "group flex items-center justify-center space-x-2",
        className
      )}
    >
      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-muted-foreground group-hover:text-primary transition-colors font-medium">
        Add Rule
      </span>
    </Button>
  );
};

export default AddRuleButton;
