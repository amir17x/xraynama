import React from "react";
import { ContentType } from "@/types";
import ContentDetailCard from "./ContentDetailCard";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Award, Star, Calendar } from "lucide-react";

interface FeaturedContentSectionProps {
  title: string;
  subtitle?: string;
  content: ContentType[];
  isLoading?: boolean;
  icon?: "award" | "star" | "calendar" | null;
}

const FeaturedContentSection: React.FC<FeaturedContentSectionProps> = ({
  title,
  subtitle,
  content,
  isLoading = false,
  icon = null,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToFavorites = async (contentId: number) => {
    if (!user) {
      toast({
        title: "خطا",
        description: "برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest(`/api/favorites`, {
        method: "POST",
        data: { contentId }
      } as any);

      toast({
        title: "افزودن به علاقه‌مندی‌ها",
        description: "محتوا با موفقیت به لیست علاقه‌مندی‌های شما اضافه شد",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content', contentId] });
    } catch (error) {
      toast({
        title: "خطا",
        description: "در افزودن به علاقه‌مندی‌ها مشکلی پیش آمد",
        variant: "destructive"
      });
    }
  };

  const handleAddToWatchlist = async (contentId: number) => {
    if (!user) {
      toast({
        title: "خطا",
        description: "برای افزودن به لیست تماشا ابتدا وارد شوید",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest(`/api/watchlist`, {
        method: "POST",
        data: { contentId }
      } as any);

      toast({
        title: "افزودن به لیست تماشا",
        description: "محتوا با موفقیت به لیست تماشای شما اضافه شد",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content', contentId] });
    } catch (error) {
      toast({
        title: "خطا",
        description: "در افزودن به لیست تماشا مشکلی پیش آمد",
        variant: "destructive"
      });
    }
  };

  // Render skeletons for loading state
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 animate-pulse">
            <div className="h-8 bg-dark-card w-1/3 rounded-md"></div>
            <div className="h-4 bg-dark-card w-1/2 rounded-md mt-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-dark rounded-lg overflow-hidden shadow-lg animate-pulse">
                <div className="h-[300px] bg-dark-card"></div>
                <div className="p-4">
                  <div className="h-6 bg-dark-card w-3/4 rounded-md mb-3"></div>
                  <div className="h-4 bg-dark-card w-full rounded-md mb-2"></div>
                  <div className="h-4 bg-dark-card w-full rounded-md mb-2"></div>
                  <div className="h-4 bg-dark-card w-3/4 rounded-md mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-dark-card rounded-md flex-1"></div>
                    <div className="h-10 bg-dark-card rounded-md flex-1"></div>
                    <div className="h-10 bg-dark-card rounded-md flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no content, don't render the section
  if (!content || content.length === 0) {
    return null;
  }

  const renderIcon = () => {
    switch (icon) {
      case "award":
        return <Award className="ml-2 h-6 w-6 text-yellow-500" />;
      case "star":
        return <Star className="ml-2 h-6 w-6 text-yellow-500" />;
      case "calendar":
        return <Calendar className="ml-2 h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-8 bg-dark">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {renderIcon()}
            {title}
          </h2>
          {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.slice(0, 6).map((item) => (
            <ContentDetailCard
              key={item.id}
              id={item.id.toString()}
              title={item.title}
              description={item.description}
              thumbnailUrl={item.poster}
              releaseDate={item.year?.toString()}
              duration={`${item.duration} دقیقه`}
              imdb={item.imdbRating}
              onAddToFavorites={() => handleAddToFavorites(item.id)}
              onAddToWatchlist={() => handleAddToWatchlist(item.id)}
              // در اینجا می‌توانید به اطلاعات بیشتری از ContentWithDetails دسترسی داشته باشید
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedContentSection;