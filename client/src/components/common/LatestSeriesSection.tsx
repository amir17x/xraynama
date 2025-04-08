import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Tv } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// تعریف تایپ داده‌های سریال
interface SeriesEpisode {
  id: string;
  title: string;
  thumbnail: string;
  network: string;
  networkLogo: string;
  description: string;
  latestEpisodeDate: string;
  hasNewEpisode: boolean;
  url: string;
}

/**
 * کامپوننت نمایش سریال‌های به‌روز شده
 * این کامپوننت سریال‌هایی که به تازگی قسمت جدید آن‌ها منتشر شده را نمایش می‌دهد
 */
const LatestSeriesSection: React.FC = () => {
  // دریافت داده‌های سریال‌ها از API
  const { data: seriesData, isLoading, error } = useQuery<SeriesEpisode[]>({
    queryKey: ['/api/series'],
  });

  // مرتب‌سازی سریال‌ها بر اساس تاریخ انتشار آخرین قسمت
  const sortedSeries = React.useMemo(() => {
    if (!seriesData) return [];
    
    return [...seriesData].sort((a, b) => {
      const dateA = new Date(a.latestEpisodeDate).getTime();
      const dateB = new Date(b.latestEpisodeDate).getTime();
      return dateB - dateA; // نمایش جدیدترین‌ها در بالا
    });
  }, [seriesData]);

  // نمایش وضعیت بارگذاری
  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 h-full w-full">
        <div className="flex items-center mb-4 text-white">
          <Tv className="h-5 w-5 text-[#FF9800] ml-2" />
          <h2 className="text-lg font-bold">سریال‌های بروز شده</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-24 bg-gray-700 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // نمایش خطا
  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="flex items-center mb-4 text-white">
          <Tv className="h-5 w-5 text-[#FF9800] ml-2" />
          <h2 className="text-lg font-bold">سریال‌های بروز شده</h2>
        </div>
        <p className="text-red-400">خطا در بارگذاری اطلاعات</p>
      </div>
    );
  }

  // نمایش اصلی کامپوننت
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4">
      <div className="flex items-center mb-4 text-white">
        <Tv className="h-5 w-5 text-[#FF9800] ml-2" />
        <h2 className="text-lg font-bold">سریال‌های بروز شده</h2>
      </div>
      
      {sortedSeries.length === 0 ? (
        <p className="text-gray-400">سریالی یافت نشد</p>
      ) : (
        <div className="space-y-3">
          {sortedSeries.map((series) => (
            <Link key={series.id} href={series.url}>
              <a className="block">
                <div className="flex items-center bg-black/30 rounded-md overflow-hidden hover:bg-black/50 transition-colors duration-300">
                  {/* تصویر بندانگشتی */}
                  <div className="w-28 h-20 relative flex-shrink-0">
                    <img 
                      src={series.thumbnail} 
                      alt={series.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* اطلاعات سریال */}
                  <div className="flex-1 p-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium text-sm line-clamp-1">{series.title}</h3>
                      
                      {/* لوگوی شبکه پخش کننده */}
                      {series.networkLogo && (
                        <img 
                          src={series.networkLogo} 
                          alt={series.network}
                          className="h-4 object-contain" 
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1">
                      <p className="text-gray-400 text-xs">{series.description}</p>
                      
                      {/* نشانگر قسمت جدید */}
                      {series.hasNewEpisode && (
                        <div className="mr-2 w-3 h-3 rounded-full bg-[#FF9800]"></div>
                      )}
                    </div>
                    
                    {/* تاریخ انتشار قسمت جدید */}
                    <div className="text-[10px] text-gray-500 mt-1 left-auto">
                      {new Date(series.latestEpisodeDate).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestSeriesSection;