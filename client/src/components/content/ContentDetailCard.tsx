import React from "react";
import { Link } from "wouter";
import { PlayCircle, Heart, Star, Info, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentMetadataBar from "./ContentMetadataBar";
import { useAuth } from "@/hooks/use-auth";

interface ContentDetailCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  releaseDate?: string;
  country?: string;
  genre?: string;
  director?: string;
  rating?: number;
  duration?: string;
  classification?: string;
  awards?: string;
  imdb?: string;
  onAddToFavorites?: () => void;
  onAddToWatchlist?: () => void;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
}

const ContentDetailCard: React.FC<ContentDetailCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  releaseDate,
  country,
  genre,
  director,
  rating,
  duration,
  classification,
  awards,
  imdb,
  onAddToFavorites,
  onAddToWatchlist,
  isFavorite = false,
  isInWatchlist = false,
}) => {
  const { user } = useAuth();

  return (
    <div className="bg-dark rounded-lg overflow-hidden shadow-lg">
      <div className="relative">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          
          <ContentMetadataBar 
            releaseDate={releaseDate}
            country={country}
            genre={genre}
            director={director}
            rating={rating}
            duration={duration}
            classification={classification}
            awards={awards}
            imdb={imdb}
          />
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-300 mb-4 line-clamp-3">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-white" variant="default">
            <Link href={`/watch/${id}`}>
              <div className="flex items-center justify-center">
                <PlayCircle className="ml-2 h-5 w-5" />
                <span>تماشا</span>
              </div>
            </Link>
          </Button>
          
          {user && (
            <>
              <Button 
                onClick={onAddToFavorites}
                variant={isFavorite ? "secondary" : "outline"}
                className={`flex-1 ${isFavorite ? "bg-primary/20" : ""}`}
              >
                <Heart className={`ml-2 h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                <span>{isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}</span>
              </Button>
              
              <Button 
                onClick={onAddToWatchlist}
                variant={isInWatchlist ? "secondary" : "outline"}
                className={`flex-1 ${isInWatchlist ? "bg-primary/20" : ""}`}
              >
                <List className="ml-2 h-5 w-5" />
                <span>{isInWatchlist ? "حذف از لیست تماشا" : "افزودن به لیست تماشا"}</span>
              </Button>
            </>
          )}
          
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/content/${id}`}>
              <div className="flex items-center justify-center">
                <Info className="ml-2 h-5 w-5" />
                <span>جزئیات بیشتر</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailCard;