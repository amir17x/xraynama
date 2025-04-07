import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CalendarIcon, 
  ClockIcon, 
  AwardIcon, 
  StarIcon, 
  FlagIcon, 
  UsersIcon, 
  FileTextIcon, 
  TagIcon, 
  GlobeIcon 
} from '@/components/icons/RoundedIcons';

type BadgeType = 'release' | 'duration' | 'award' | 'rating' | 'country' | 'director' | 'classification' | 'genre' | 'imdb';

interface ContentBadgeProps {
  type: BadgeType;
  value: string;
  className?: string;
}

const ContentBadge: React.FC<ContentBadgeProps> = ({ type, value, className }) => {
  const renderIcon = () => {
    switch (type) {
      case 'release':
        return <CalendarIcon className="h-3 w-3" />;
      case 'duration':
        return <ClockIcon className="h-3 w-3" />;
      case 'award':
        return <AwardIcon className="h-3 w-3" />;
      case 'rating':
        return <StarIcon className="h-3 w-3" />;
      case 'country':
        return <FlagIcon className="h-3 w-3" />;
      case 'director':
        return <UsersIcon className="h-3 w-3" />;
      case 'classification':
        return <FileTextIcon className="h-3 w-3" />;
      case 'genre':
        return <TagIcon className="h-3 w-3" />;
      case 'imdb':
        return <GlobeIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs whitespace-nowrap",
      className
    )}>
      {renderIcon()}
      <span>{value}</span>
    </div>
  );
};

export default ContentBadge;