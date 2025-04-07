import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import ContentSection from "@/components/sections/content-section";
import TagsSection from "@/components/sections/tags-section";
import { Content } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film, SortAsc, Filter } from "lucide-react";

interface CategoryPageProps {}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { type } = useParams();
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  // Map category types to Persian titles
  const categoryTitles: Record<string, string> = {
    all: "همه محتواها",
    movie: "فیلم‌ها",
    series: "سریال‌ها",
    animation: "انیمیشن‌ها",
    documentary: "مستندها"
  };
  
  // Map category types to icons
  const categoryIcons: Record<string, React.ReactNode> = {
    all: <Film className="h-6 w-6 ml-2" />,
    movie: <Film className="h-6 w-6 ml-2" />,
    series: <Film className="h-6 w-6 ml-2" />,
    animation: <Film className="h-6 w-6 ml-2" />,
    documentary: <Film className="h-6 w-6 ml-2" />
  };
  
  // Format API request type parameter
  const apiType = type === "all" ? undefined : type;
  
  // Fetch contents for the specified category
  const { 
    data: contents = [],
    isLoading,
    error
  } = useQuery<Content[]>({
    queryKey: ["/api/contents", apiType],
    queryFn: async () => {
      const url = apiType 
        ? `/api/contents?type=${apiType}` 
        : "/api/contents";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch contents");
      return await res.json();
    }
  });
  
  // Handle genre tag click
  const handleGenreTagClick = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };
  
  // Filter and sort contents
  const filteredContents = contents
    // Filter by selected genres if any
    .filter(content => {
      if (selectedGenres.length === 0) return true;
      return content.genres?.some(genre => selectedGenres.includes(genre));
    })
    // Sort based on selected sort option
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating-high":
          const ratingA = a.imdbRating ? parseFloat(a.imdbRating) : 0;
          const ratingB = b.imdbRating ? parseFloat(b.imdbRating) : 0;
          return ratingB - ratingA;
        case "rating-low":
          const ratingC = a.imdbRating ? parseFloat(a.imdbRating) : 0;
          const ratingD = b.imdbRating ? parseFloat(b.imdbRating) : 0;
          return ratingC - ratingD;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        {categoryIcons[type] || <Film className="h-6 w-6 ml-2" />}
        <h1 className="text-3xl font-bold">{categoryTitles[type] || "محتواها"}</h1>
      </div>
      
      {/* Filter and Sort Section */}
      <div className="bg-dark-card rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-medium">فیلترها</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">مرتب‌سازی:</span>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-40 bg-dark flex items-center">
                <SortAsc className="h-4 w-4 ml-2" />
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                <SelectItem value="rating-high">بیشترین امتیاز</SelectItem>
                <SelectItem value="rating-low">کمترین امتیاز</SelectItem>
                <SelectItem value="title">بر اساس نام</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Genres Filter Section */}
        <div className="mt-4">
          <TagsSection
            title="ژانرها"
            onTagClick={handleGenreTagClick}
            selectedTags={selectedGenres}
          />
        </div>
      </div>
      
      {/* Content Results */}
      <ContentSection
        title={`${categoryTitles[type] || "محتواها"} (${filteredContents.length})`}
        contents={filteredContents}
        isLoading={isLoading}
        emptyMessage={
          selectedGenres.length > 0
            ? "هیچ محتوایی با فیلترهای انتخاب شده یافت نشد"
            : "هیچ محتوایی در این دسته‌بندی یافت نشد"
        }
      />
    </div>
  );
};

export default CategoryPage;
