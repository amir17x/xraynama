import { Link } from "wouter";
import { Play, Download, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Content } from "@shared/schema";

interface HeroSectionProps {
  content: Content;
  onPlayClick?: () => void;
  onWatchPartyClick?: () => void;
  onFavoriteClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onPlayClick,
  onWatchPartyClick,
  onFavoriteClick
}) => {
  if (!content) return null;

  // Convert imdbRating from string to number for display
  const imdbRating = content.imdbRating ? parseFloat(content.imdbRating).toFixed(1) : null;

  return (
    <section className="relative rounded-xl overflow-hidden mb-10" style={{ height: "500px" }}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-dark-card">
        <img
          src={content.poster}
          alt={content.title}
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark via-dark-lighter/90 to-transparent p-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h2>
        
        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-primary px-2 py-1 text-xs rounded-md">{content.year}</span>
          
          {content.genres?.map((genre) => (
            <span key={genre} className="bg-dark-card px-2 py-1 text-xs rounded-md">
              {genre}
            </span>
          ))}
          
          {imdbRating && (
            <span className="flex items-center bg-dark-card px-2 py-1 text-xs rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-accent-orange ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="none"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{imdbRating} IMDB</span>
            </span>
          )}
          
          {content.duration && (
            <span className="bg-dark-card px-2 py-1 text-xs rounded-md">
              {content.duration} دقیقه
            </span>
          )}
        </div>
        
        {/* Synopsis */}
        <p className="text-sm text-text-secondary mb-4 max-w-3xl">{content.synopsis}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            className="btn-primary rounded-lg px-6 py-3 flex items-center font-medium"
            onClick={onPlayClick}
          >
            <Play className="h-5 w-5 ml-2" />
            پخش آنلاین
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-6 py-3 flex items-center font-medium"
          >
            <Link href={`/content/${content.id}?action=download`}>
              <Download className="h-5 w-5 ml-2" />
              دانلود
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-4 py-3"
            onClick={onFavoriteClick}
            aria-label="افزودن به علاقه‌مندی‌ها"
          >
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            className="bg-dark-card hover:bg-dark-border transition-colors duration-200 rounded-lg px-4 py-3"
            onClick={onWatchPartyClick}
            aria-label="تماشای گروهی"
            title="تماشای گروهی"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
