import React from 'react';
import { Calendar, Clock, Award, Star, Flag, Users, FileText, Tag, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        return <Calendar className="h-3 w-3" />;
      case 'duration':
        return <Clock className="h-3 w-3" />;
      case 'award':
        return <Award className="h-3 w-3 text-yellow-500" />;
      case 'rating':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'country':
        return <Flag className="h-3 w-3" />;
      case 'director':
        return <Users className="h-3 w-3" />;
      case 'classification':
        return <FileText className="h-3 w-3" />;
      case 'genre':
        return <Tag className="h-3 w-3" />;
      case 'imdb':
        return <Globe className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1 bg-card/50 px-1.5 py-0.5 rounded text-xs whitespace-nowrap",
      className
    )}>
      {renderIcon()}
      <span>{value}</span>
    </div>
  );
};

export default ContentBadge;