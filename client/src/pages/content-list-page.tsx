import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { ContentCard } from '@/components/common/ContentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ContentType } from '@/types';

interface ContentListPageProps {
  title: string;
  contentType?: 'movie' | 'series' | 'animation' | 'documentary';
  showAll?: boolean;
}

const ContentListPage: React.FC<ContentListPageProps> = ({ title, contentType, showAll = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const itemsPerPage = 24;
  
  // Fetch content based on type or all content
  const { data: allContents, isLoading } = useQuery<ContentType[]>({
    queryKey: [contentType ? `/api/content/type/${contentType}` : '/api/content'],
    retry: false,
  });
  
  // Filter content based on search term
  const filteredContents = allContents?.filter(content => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      content.title.toLowerCase().includes(searchLower) ||
      content.englishTitle.toLowerCase().includes(searchLower) ||
      content.description.toLowerCase().includes(searchLower) ||
      (content.genres && typeof content.genres === 'object' && 
        Array.isArray(content.genres) && 
        content.genres.some(genre => 
          typeof genre === 'string' && genre.toLowerCase().includes(searchLower)
        )
      )
    );
  });
  
  // Sort content
  const sortedContents = React.useMemo(() => {
    if (!filteredContents) return [];
    
    return [...filteredContents].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.year - a.year;
        case 'oldest':
          return a.year - b.year;
        case 'highest-rating':
          return b.imdbRating - a.imdbRating;
        case 'lowest-rating':
          return a.imdbRating - b.imdbRating;
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [filteredContents, sortBy]);
  
  // Paginate content
  const totalPages = Math.ceil((sortedContents?.length || 0) / itemsPerPage);
  const currentContents = sortedContents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);
  
  // Prepare breadcrumb items based on content type
  const contentTypeName = {
    'movie': 'فیلم‌ها',
    'series': 'سریال‌ها',
    'animation': 'انیمیشن‌ها',
    'documentary': 'مستندها'
  }[contentType || 'movie'];
  
  const breadcrumbItems = [
    { label: "خانه", href: "/" },
    { label: contentTypeName || title }
  ];

  return (
    <AppLayout>
      <Breadcrumb items={breadcrumbItems} />
      <main className="min-h-screen bg-[#111827] bg-gradient-to-b from-black/70 to-gray-900/70">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">{title}</h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو..."
                className="bg-black/20 border-gray-700 pr-4 pl-10 text-white placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-black/20 border-gray-700 text-white">
                  <SelectValue placeholder="مرتب‌سازی بر اساس" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="newest">جدیدترین</SelectItem>
                  <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                  <SelectItem value="highest-rating">بیشترین امتیاز</SelectItem>
                  <SelectItem value="lowest-rating">کمترین امتیاز</SelectItem>
                  <SelectItem value="a-z">حروف الفبا (الف تا ی)</SelectItem>
                  <SelectItem value="z-a">حروف الفبا (ی تا الف)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2 bg-black/20 border-gray-700 text-white hover:bg-gray-700">
                <Filter className="h-4 w-4" />
                فیلتر
              </Button>
            </div>
          </div>
          
          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="relative bg-black/20 rounded-lg overflow-hidden">
                  <Skeleton className="w-full aspect-[2/3]" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContents?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">محتوایی یافت نشد.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-black/20 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show current page, first, last, and at most 2 pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page 
                            ? "bg-primary" 
                            : "bg-black/20 border-gray-700 text-white hover:bg-gray-700"}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === 2 ||
                      page === totalPages - 1
                    ) {
                      return <span key={page} className="text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-black/20 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default ContentListPage;