import React from 'react';
import { MessageSquare, Star, MessageCircle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type CommentType = 'comment' | 'review' | 'question';

interface CommentTypeSelectorProps {
  value: CommentType;
  onValueChange: (value: CommentType) => void;
}

export function CommentTypeSelector({ value, onValueChange }: CommentTypeSelectorProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(val) => val && onValueChange(val as CommentType)}
      className="justify-start border rounded-md p-0.5 bg-muted/20"
    >
      <ToggleGroupItem 
        value="comment" 
        aria-label="نظر" 
        className="flex items-center gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs">نظر</span>
      </ToggleGroupItem>
      
      <ToggleGroupItem 
        value="review" 
        aria-label="نقد" 
        className="flex items-center gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <Star className="h-4 w-4" />
        <span className="text-xs">نقد</span>
      </ToggleGroupItem>
      
      <ToggleGroupItem 
        value="question" 
        aria-label="سوال" 
        className="flex items-center gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs">سوال</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default CommentTypeSelector;