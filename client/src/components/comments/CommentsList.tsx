import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, MessageCircle, Star, Filter, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import CommentItem from './CommentItem';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface CommentsListProps {
  contentId: string | number;
}

type SortOption = 'newest' | 'oldest' | 'most-liked';
type FilterOption = 'all' | 'comments' | 'reviews' | 'questions';

export function CommentsList({ contentId }: CommentsListProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  
  // Fetch comments data
  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: [`/api/content/${contentId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/content/${contentId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });
  
  // Fetch reviews data
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: [`/api/content/${contentId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/content/${contentId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
  });
  
  // Format and filter the data based on the active tab and filters
  const getFilteredData = () => {
    let combinedData: any[] = [];
    
    // Handle if data hasn't loaded yet
    if (isLoading || isReviewsLoading) return [];
    
    // Get the appropriate data for the active tab
    if (activeTab === 'reviews' || activeTab === 'all') {
      combinedData = [...combinedData, ...(reviewsData || [])];
    }
    
    if (activeTab === 'comments' || activeTab === 'all') {
      // Add comments and questions to the combined data
      const filteredComments = (commentsData || []).filter(
        (comment: any) => activeTab === 'all' || comment.type === activeTab
      );
      combinedData = [...combinedData, ...filteredComments];
    }
    
    // Apply type filter if needed
    if (filterOption !== 'all') {
      combinedData = combinedData.filter((item: any) => item.type === filterOption);
    }
    
    // Sort the data based on the selected sort option
    switch (sortOption) {
      case 'newest':
        return combinedData.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
      case 'oldest':
        return combinedData.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA.getTime() - dateB.getTime();
        });
      case 'most-liked':
        return combinedData.sort((a: any, b: any) => {
          const likesA = a.likes?.length || 0;
          const likesB = b.likes?.length || 0;
          return likesB - likesA;
        });
      default:
        return combinedData;
    }
  };
  
  const filteredData = getFilteredData();
  const commentsCount = commentsData?.length || 0;
  const reviewsCount = reviewsData?.length || 0;
  const totalCount = commentsCount + reviewsCount;
  
  // Get counts for each type
  const getCounts = () => {
    if (isLoading || isReviewsLoading) return { comments: 0, reviews: 0, questions: 0 };
    
    let comments = 0;
    let reviews = 0;
    let questions = 0;
    
    // Count regular comments
    (commentsData || []).forEach((comment: any) => {
      if (comment.type === 'comment') comments++;
      if (comment.type === 'question') questions++;
    });
    
    // Count reviews
    reviews = (reviewsData || []).length;
    
    return { comments, reviews, questions };
  };
  
  const { comments, reviews, questions } = getCounts();

  // نمایش لودینگ
  const renderLoading = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-card rounded-md p-4 border">
          <div className="flex items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 mr-3 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // نمایش خطا
  const renderError = () => (
    <div className="text-center p-6 text-muted-foreground">
      خطا در بارگذاری دیدگاه‌ها. لطفا دوباره تلاش کنید.
    </div>
  );

  // نمایش حالت خالی
  const renderEmpty = () => (
    <div className="text-center p-6 text-muted-foreground">
      هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که دیدگاه خود را ثبت می‌کند.
    </div>
  );

  // نمایش لیست نظرات
  const renderComments = () => (
    <div className="space-y-4">
      {filteredData.map((comment: any) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          contentId={contentId}
        />
      ))}
    </div>
  );

  // انتخاب محتوا بر اساس وضعیت
  const renderContent = () => {
    if (isLoading || isReviewsLoading) return renderLoading();
    if (error) return renderError();
    if (filteredData.length === 0) return renderEmpty();
    return renderComments();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          دیدگاه‌های کاربران
          {!isLoading && !isReviewsLoading && (
            <Badge variant="secondary" className="mr-2">
              {totalCount}
            </Badge>
          )}
        </h2>
        
        <div className="flex items-center mt-2 sm:mt-0 space-x-2 rtl:space-x-reverse">
          {/* گزینه‌های مرتب‌سازی */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ChevronDown className="h-4 w-4" />
                <span>
                  {sortOption === 'newest' 
                    ? 'جدیدترین' 
                    : sortOption === 'oldest' 
                      ? 'قدیمی‌ترین' 
                      : 'محبوب‌ترین'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <DropdownMenuRadioItem value="newest">جدیدترین</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">قدیمی‌ترین</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most-liked">محبوب‌ترین</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* گزینه‌های فیلتر */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>فیلتر</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup value={filterOption} onValueChange={(v) => setFilterOption(v as FilterOption)}>
                <DropdownMenuRadioItem value="all">همه ({totalCount})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="comments">نظرات ({comments})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="reviews">نقدها ({reviews})</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="questions">سوالات ({questions})</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Separator />
      
      {/* تب‌های دسته‌بندی نظرات */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>همه</span>
            {!isLoading && !isReviewsLoading && (
              <Badge variant="secondary" className="mr-1 ml-1">
                {totalCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <Star className="h-4 w-4" />
            <span>نقدها</span>
            {!isLoading && !isReviewsLoading && reviews > 0 && (
              <Badge variant="secondary" className="mr-1 ml-1">
                {reviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>نظرات</span>
            {!isLoading && !isReviewsLoading && commentsCount > 0 && (
              <Badge variant="secondary" className="mr-1 ml-1">
                {commentsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* محتوای تب‌ها */}
        <TabsContent value="all" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="comments" className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommentsList;