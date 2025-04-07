import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import HeroSection from "@/components/sections/hero-section";
import ContentSection from "@/components/sections/content-section";
import CategorySection from "@/components/sections/category-section";
import TagsSection from "@/components/sections/tags-section";
import LeaderboardSection from "@/components/sections/leaderboard-section";
import WatchPartySection from "@/components/sections/watch-party-section";

const HomePage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch featured content for hero section
  const { data: featuredContent } = useQuery<Content>({
    queryKey: ["/api/featured"],
    queryFn: async () => {
      try {
        // In a real implementation, this would fetch from an API endpoint
        // For now, we'll use the "contents" endpoint and take the first item
        const res = await fetch("/api/contents?limit=1");
        if (!res.ok) throw new Error("Failed to fetch featured content");
        const data = await res.json();
        return data[0];
      } catch (error) {
        console.error("Error fetching featured content:", error);
        return null;
      }
    }
  });
  
  // Fetch new releases
  const { data: newReleases = [], isLoading: loadingNewReleases } = useQuery<Content[]>({
    queryKey: ["/api/contents?limit=6"],
    queryFn: async () => {
      const res = await fetch("/api/contents?limit=6");
      if (!res.ok) throw new Error("Failed to fetch new releases");
      return await res.json();
    }
  });
  
  // Fetch popular series
  const { data: popularSeries = [], isLoading: loadingSeries } = useQuery<Content[]>({
    queryKey: ["/api/contents?type=series&limit=6"],
    queryFn: async () => {
      const res = await fetch("/api/contents?type=series&limit=6");
      if (!res.ok) throw new Error("Failed to fetch popular series");
      return await res.json();
    }
  });
  
  // Fetch featured animations
  const { data: featuredAnimations = [], isLoading: loadingAnimations } = useQuery<Content[]>({
    queryKey: ["/api/contents?type=animation&limit=6"],
    queryFn: async () => {
      const res = await fetch("/api/contents?type=animation&limit=6");
      if (!res.ok) throw new Error("Failed to fetch animations");
      return await res.json();
    }
  });
  
  // Handle hero section actions
  const handlePlayClick = () => {
    if (featuredContent) {
      navigate(`/content/${featuredContent.id}?action=play`);
    }
  };
  
  const handleWatchPartyClick = async () => {
    if (!featuredContent) return;
    
    try {
      const res = await apiRequest("POST", "/api/watch-parties", {
        contentId: featuredContent.id
      });
      const data = await res.json();
      navigate(`/watch-party/${data.partyCode}`);
    } catch (error) {
      toast({
        title: "خطا در ایجاد تماشای گروهی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };
  
  const handleFavoriteClick = async () => {
    if (!featuredContent) return;
    
    try {
      await apiRequest("POST", `/api/favorites/${featuredContent.id}`);
      toast({
        title: "به علاقه‌مندی‌ها اضافه شد",
        description: `${featuredContent.title} به لیست علاقه‌مندی‌های شما اضافه شد`,
      });
    } catch (error) {
      toast({
        title: "خطا در افزودن به علاقه‌مندی‌ها",
        description: "لطفاً دوباره تلاش کنید یا وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      {featuredContent && (
        <HeroSection
          content={featuredContent}
          onPlayClick={handlePlayClick}
          onWatchPartyClick={handleWatchPartyClick}
          onFavoriteClick={handleFavoriteClick}
        />
      )}
      
      {/* New Releases Section */}
      <ContentSection
        title="جدیدترین‌ها"
        contents={newReleases}
        viewAllLink="/category/all"
        isLoading={loadingNewReleases}
      />
      
      {/* Popular Series Section */}
      <ContentSection
        title="سریال‌های محبوب"
        contents={popularSeries}
        viewAllLink="/category/series"
        isLoading={loadingSeries}
      />
      
      {/* Category Section */}
      <CategorySection />
      
      {/* Genre Tags Section */}
      <TagsSection title="ژانرها" />
      
      {/* Featured Animation Section */}
      <ContentSection
        title="انیمیشن‌های برتر"
        contents={featuredAnimations}
        viewAllLink="/category/animation"
        isLoading={loadingAnimations}
      />
      
      {/* Game Leaderboard Section */}
      <LeaderboardSection />
      
      {/* Watch Party Feature */}
      <WatchPartySection />
    </div>
  );
};

export default HomePage;
