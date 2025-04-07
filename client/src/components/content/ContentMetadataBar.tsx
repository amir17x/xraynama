import React from "react";
import ContentBadge from "./ContentBadge";

interface ContentMetadataBarProps {
  releaseDate?: string;
  country?: string;
  genre?: string;
  director?: string;
  rating?: number | string;
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
    <div className="flex flex-wrap items-center gap-1 text-xs text-gray-300 mb-2">
      {releaseDate && (
        <ContentBadge type="release" value={releaseDate} />
      )}
      
      {country && (
        <ContentBadge type="country" value={country} />
      )}
      
      {genre && (
        <ContentBadge type="genre" value={genre} />
      )}
      
      {director && (
        <ContentBadge type="director" value={director} />
      )}
      
      {rating && (
        <ContentBadge 
          type="rating" 
          value={typeof rating === 'number' ? rating.toString() : rating} 
          className="bg-yellow-500/10" 
        />
      )}
      
      {duration && (
        <ContentBadge type="duration" value={duration} />
      )}
      
      {classification && (
        <ContentBadge type="classification" value={classification} />
      )}
      
      {awards && (
        <ContentBadge 
          type="award" 
          value={awards} 
          className="bg-yellow-500/10" 
        />
      )}
      
      {imdb && (
        <ContentBadge 
          type="imdb" 
          value={`IMDb: ${imdb}`} 
          className="bg-blue-500/10" 
        />
      )}
    </div>
  );
};

export default ContentMetadataBar;