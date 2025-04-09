import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { APIError } from '@/lib/queryClient';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * گزینه‌های استفاده از هوک useApiQuery
 */
export interface UseApiQueryOptions<TData, TError = APIError> 
  extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
  /** آیا خطاها به صورت خودکار نمایش داده شوند */
  showErrorToast?: boolean;
  /** عنوان پیام خطا */
  errorTitle?: string;
  /** آیا کوئری به صورت خودکار فعال شود */
  enabled?: boolean;
}

/**
 * هوک بهبود یافته برای استفاده از React Query با مدیریت خطا و بارگذاری
 */
export function useApiQuery<TData = unknown>(
  queryKey: unknown[],
  options?: UseApiQueryOptions<TData>
): UseQueryResult<TData, APIError> & {
  isFirstLoading: boolean;
} {
  const {
    showErrorToast = true,
    errorTitle = 'خطا در دریافت اطلاعات',
    ...queryOptions
  } = options || {};

  // برای پیگیری اولین بارگذاری استفاده می‌شود
  const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true);
  
  // استفاده از React Query
  const result = useQuery<TData, APIError>({
    queryKey,
    ...queryOptions,
  });
  
  // وقتی بارگذاری تمام شد، وضعیت اولین بارگذاری را به‌روز کن
  useEffect(() => {
    if (!result.isLoading && isFirstLoading) {
      setIsFirstLoading(false);
    }
  }, [result.isLoading, isFirstLoading]);
  
  // نمایش خطاها در صورت فعال بودن
  useEffect(() => {
    if (result.error && showErrorToast) {
      toast({
        variant: 'destructive',
        title: errorTitle,
        description: result.error.message || 'خطایی در دریافت اطلاعات رخ داده است',
      });
    }
  }, [result.error, showErrorToast, errorTitle]);
  
  // افزودن isFirstLoading به نتیجه
  return {
    ...result,
    isFirstLoading,
  };
}

/**
 * هوک ساده‌شده برای دریافت اطلاعات جستجوی TMDB
 */
export function useTMDBSearch(query: string, options?: UseApiQueryOptions<any>) {
  return useApiQuery(
    ['/api/tmdb/search/unified', { query }],
    {
      enabled: !!query && query.length > 2,
      ...options
    }
  );
}

/**
 * هوک ساده‌شده برای دریافت محتوای توصیه شده
 */
export function useRecommendedContent(options?: UseApiQueryOptions<any>) {
  return useApiQuery(
    ['/api/content/recommended'],
    options
  );
}

/**
 * هوک ساده‌شده برای دریافت محتوا با نوع خاص
 */
export function useContentByType(type: string, options?: UseApiQueryOptions<any>) {
  return useApiQuery(
    ['/api/content/types', type],
    options
  );
}

/**
 * هوک ساده‌شده برای دریافت محتوای برتر
 */
export function useTopRatedContent(options?: UseApiQueryOptions<any>) {
  return useApiQuery(
    ['/api/content/top-rated'],
    options
  );
}

/**
 * هوک ساده‌شده برای دریافت آمار کش TMDB
 */
export function useTMDBCacheStats(options?: UseApiQueryOptions<any>) {
  return useApiQuery(
    ['/api/tmdb/cache/stats'],
    options
  );
}

/**
 * هوک ساده‌شده برای دریافت فیلم‌های محبوب TMDB
 * توجه: این متد دیگر از API محبوب‌ترین فیلم‌ها استفاده نمی‌کند و به جای آن از جستجوی چند منظوره استفاده می‌کند
 */
export function usePopularMovies(options?: UseApiQueryOptions<any> & { page?: number, limit?: number }) {
  const { page, limit, ...queryOptions } = options || {};
  return useApiQuery(
    ['/api/tmdb/search/multi', { query: 'a', page, limit }], // از جستجوی ساده برای دریافت چند فیلم استفاده می‌کنیم
    queryOptions
  );
}