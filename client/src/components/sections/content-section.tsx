import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import ContentCard from "@/components/ui/content-card";
import { Content } from "@shared/schema";

interface ContentSectionProps {
  title: string;
  contents: Content[];
  viewAllLink?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  contents,
  viewAllLink,
  emptyMessage = "محتوایی برای نمایش وجود ندارد",
  isLoading = false
}) => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {viewAllLink && (
          <Link href={viewAllLink}>
            <a className="text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium flex items-center gap-1">
              <span>مشاهده همه</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        )}
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-dark-card rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-dark-lighter"></div>
            </div>
          ))}
        </div>
      ) : contents.length > 0 ? (
        // Content grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="bg-dark-card rounded-lg py-12 text-center">
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};

export default ContentSection;
