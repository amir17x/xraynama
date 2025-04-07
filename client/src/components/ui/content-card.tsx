import { Link } from "wouter";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, className }) => {
  // Map content types to Persian labels
  const typeLabels: Record<string, string> = {
    movie: "فیلم",
    series: "سریال",
    animation: "انیمیشن",
    documentary: "مستند"
  };

  return (
    <Link href={`/content/${content.id}`}>
      <a className={cn(
        "content-card bg-dark-card rounded-lg overflow-hidden block transition-all duration-300 hover:scale-102 hover:shadow-lg",
        className
      )}>
        <div className="relative aspect-[2/3]">
          <img 
            src={content.poster}
            alt={content.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="card-overlay absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-dark/90 via-dark/50 to-transparent opacity-70 hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-medium text-sm line-clamp-1">{content.title}</h3>
            <div className="flex items-center mt-1">
              {content.imdbRating && (
                <div className="flex items-center text-accent-orange">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs mr-1">{content.imdbRating}</span>
                </div>
              )}
              <span className="text-xs text-text-secondary mx-2">{content.year}</span>
              <span className="text-xs bg-dark px-1.5 py-0.5 rounded">
                {typeLabels[content.type] || content.type}
              </span>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ContentCard;
