import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Star, ChevronLeft } from 'lucide-react';

import { Header } from '../components/layout/Header';
import { ContentCard } from '../components/common/ContentCard';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

interface Content {
  id: string;
  title: string;
  englishTitle: string;
  type: 'movie' | 'series' | 'animation' | 'documentary';
  year: number;
  duration: number;
  poster: string;
  imdbRating: number;
  description: string;
  genres?: string[];
  hasPersianDubbing?: boolean;
  hasPersianSubtitle?: boolean;
}

// Component to show a content section with title
const ContentSection: React.FC<{
  title: string;
  linkTo: string;
  contents: Content[];
  isLoading: boolean;
}> = ({ title, linkTo, contents, isLoading }) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            {title}
          </h2>
          <Link href={linkTo} className="flex items-center text-primary hover:underline text-sm">
            مشاهده همه
            <ChevronLeft className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative bg-black/20 rounded-lg overflow-hidden">
                <Skeleton className="w-full aspect-[2/3]" />
                <div className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const IndexPage: React.FC = () => {
  // Fetch movies (type: movie)
  const { data: movies, isLoading: moviesLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/type/movie'],
    retry: false,
  });

  // Fetch series (type: series)
  const { data: series, isLoading: seriesLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/type/series'],
    retry: false,
  });

  // Fetch animations (type: animation)
  const { data: animations, isLoading: animationsLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/type/animation'],
    retry: false,
  });

  // Fetch documentaries (type: documentary)
  const { data: documentaries, isLoading: documentariesLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/type/documentary'],
    retry: false,
  });

  // Fetch top rated content
  const { data: topRated, isLoading: topRatedLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/top-rated'],
    retry: false,
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#111827] bg-gradient-to-b from-black/70 to-gray-900/70 pt-6">
        {/* Hero section with top rated content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-normal">پیشنهاد ویژه</span>
                محتوای برتر
              </h2>
            </div>
            
            {topRatedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="relative bg-black/20 rounded-lg overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRated?.slice(0, 3).map((content) => (
                  <div key={content.id} className="group relative bg-black/30 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                    <Link href={`/content/${content.englishTitle.replace(/\s+/g, '')}`}>
                      <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${content.poster})` }}>
                        <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                          <div className="mt-auto">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-primary/90 text-white hover:bg-primary">
                                {content.type === "movie" ? "فیلم" : 
                                content.type === "series" ? "سریال" : 
                                content.type === "animation" ? "انیمیشن" : "مستند"}
                              </Badge>
                              
                              <Badge variant="outline" className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {content.imdbRating}
                              </Badge>
                              
                              <Badge variant="outline" className="bg-black/50">
                                {content.year}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{content.title}</h3>
                            <h4 className="text-sm text-gray-300 mb-2">{content.englishTitle}</h4>
                            
                            <p className="text-xs text-gray-400 line-clamp-2">{content.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Movies Section */}
        <ContentSection
          title="فیلم‌ها"
          linkTo="/movies"
          contents={movies?.slice(0, 6) || []}
          isLoading={moviesLoading}
        />

        {/* Series Section */}
        <ContentSection
          title="سریال‌ها"
          linkTo="/series"
          contents={series?.slice(0, 6) || []}
          isLoading={seriesLoading}
        />

        {/* Animations Section */}
        <ContentSection
          title="انیمیشن‌ها"
          linkTo="/animations"
          contents={animations?.slice(0, 6) || []}
          isLoading={animationsLoading}
        />

        {/* Documentaries Section */}
        <ContentSection
          title="مستندها"
          linkTo="/documentaries"
          contents={documentaries?.slice(0, 6) || []}
          isLoading={documentariesLoading}
        />
      </main>
    </>
  );
};

export default IndexPage;