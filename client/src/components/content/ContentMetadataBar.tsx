import React from "react";
import {
  Calendar,
  Globe,
  Flag,
  Users,
  Star,
  Clock,
  Tag,
  Award,
  FileText,
} from "lucide-react";

interface ContentMetadataBarProps {
  releaseDate?: string;
  country?: string;
  genre?: string;
  director?: string;
  rating?: number;
  duration?: string;
  classification?: string;
  awards?: string;
  imdb?: string;
}

const ContentMetadataBar: React.FC<ContentMetadataBarProps> = ({
  releaseDate,
  country,
  genre,
  director,
  rating,
  duration,
  classification,
  awards,
  imdb,
}) => {
  return (
    <div className="bg-dark-lighter py-2 px-4 rounded-md flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 mb-4">
      {releaseDate && (
        <div className="flex items-center gap-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{releaseDate}</span>
        </div>
      )}
      
      {country && (
        <div className="flex items-center gap-x-1">
          <Flag className="h-4 w-4 text-gray-400" />
          <span>{country}</span>
        </div>
      )}
      
      {genre && (
        <div className="flex items-center gap-x-1">
          <Tag className="h-4 w-4 text-gray-400" />
          <span>{genre}</span>
        </div>
      )}
      
      {director && (
        <div className="flex items-center gap-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{director}</span>
        </div>
      )}
      
      {rating && (
        <div className="flex items-center gap-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{rating}</span>
        </div>
      )}
      
      {duration && (
        <div className="flex items-center gap-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{duration}</span>
        </div>
      )}
      
      {classification && (
        <div className="flex items-center gap-x-1">
          <FileText className="h-4 w-4 text-gray-400" />
          <span>{classification}</span>
        </div>
      )}
      
      {awards && (
        <div className="flex items-center gap-x-1">
          <Award className="h-4 w-4 text-yellow-500" />
          <span>{awards}</span>
        </div>
      )}
      
      {imdb && (
        <div className="flex items-center gap-x-1">
          <Globe className="h-4 w-4 text-gray-400" />
          <span>IMDb: {imdb}</span>
        </div>
      )}
    </div>
  );
};

export default ContentMetadataBar;