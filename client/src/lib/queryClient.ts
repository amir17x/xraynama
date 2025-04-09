import { QueryClient, QueryFunction, DefaultOptions } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// مدیریت خطاهای API
export enum APIErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface APIError {
  type: APIErrorType;
  status: number;
  message: string;
  originalError?: Error;
  data?: any;
}

/**
 * تبدیل خطای HTTP به یک خطای ساختاریافته برای مدیریت بهتر
 */
export async function createAPIError(res: Response): Promise<APIError> {
  let message: string;
  let data: any;
  
  try {
    const contentType = res.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await res.json();
      message = jsonData.message || jsonData.error || res.statusText;
      data = jsonData;
    } else {
      message = await res.text() || res.statusText;
    }
  } catch (e) {
    message = res.statusText;
  }

  // تعیین نوع خطا بر اساس کد وضعیت
  let type = APIErrorType.UNKNOWN;
  if (res.status === 401) type = APIErrorType.AUTHENTICATION;
  else if (res.status === 403) type = APIErrorType.AUTHORIZATION; 
  else if (res.status === 404) type = APIErrorType.NOT_FOUND;
  else if (res.status === 422 || res.status === 400) type = APIErrorType.VALIDATION;
  else if (res.status >= 500) type = APIErrorType.SERVER;
  
  return {
    type,
    status: res.status,
    message,
    data
  };
}

/**
 * پرتاب خطا در صورت پاسخ نامعتبر
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = await createAPIError(res);
    throw error;
  }
}

/**
 * درخواست به API با مدیریت خطای پیشرفته
 */
export async function apiRequest(
  urlOrOptions: string | {
    url: string;
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
    ignoreError?: boolean;
  },
  options?: {
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
    ignoreError?: boolean;
  }
): Promise<Response> {
  let url: string;
  let method: string;
  let data: unknown;
  let headers: Record<string, string> = {};
  let ignoreError: boolean = false;
  
  // پردازش آرگومان‌ها
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    method = options?.method || 'GET';
    data = options?.data;
    headers = options?.headers || {};
    ignoreError = options?.ignoreError || false;
  } else {
    url = urlOrOptions.url;
    method = urlOrOptions.method || 'GET';
    data = urlOrOptions.data;
    headers = urlOrOptions.headers || {};
    ignoreError = urlOrOptions.ignoreError || false;
  }
  
  // افزودن هدر Content-Type در صورت وجود داده
  if (data && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!ignoreError) {
      await throwIfResNotOk(res);
    }
    
    return res;
  } catch (error) {
    // تشخیص خطاهای شبکه
    if (error instanceof Error && error.name === 'TypeError') {
      const networkError: APIError = {
        type: APIErrorType.NETWORK,
        status: 0,
        message: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
        originalError: error,
      };
      throw networkError;
    }
    
    throw error;
  }
}

/**
 * توابع کمکی برای ساخت نام کلیدهای Query یکپارچه
 */
export const QueryKeys = {
  content: {
    all: ['/api/content'] as const,
    byType: (type: string) => ['/api/content/type', type] as const,
    details: (id: string) => ['/api/content', id] as const,
    recommended: ['/api/content/recommended'] as const,
    topRated: ['/api/content/top-rated'] as const
  },
  tmdb: {
    popular: (contentType: string) => [`/api/tmdb/${contentType}/popular`] as const,
    search: (query: string) => ['/api/tmdb/search/unified', { query }] as const,
    details: (id: string, contentType: string) => [`/api/tmdb/${contentType}/${id}`] as const,
    cacheStats: ['/api/tmdb/cache/stats'] as const
  },
  user: {
    profile: ['/api/user'] as const,
    watchlist: ['/api/user/watchlist'] as const,
    favorites: ['/api/user/favorites'] as const,
    history: ['/api/user/history'] as const
  }
};

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * تابع پیش فرض برای استفاده در React Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // شناسایی آدرس از کلید کوئری
      let url: string;
      let params: Record<string, any> = {};
      
      if (typeof queryKey[0] === 'string') {
        url = queryKey[0];
        
        // اضافه کردن کوئری پارامترها اگر در کلید وجود داشته باشند
        if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
          params = queryKey[1];
          const searchParams = new URLSearchParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          
          const queryString = searchParams.toString();
          if (queryString) {
            url = `${url}?${queryString}`;
          }
        }
      } else {
        throw new Error('کلید کوئری باید یک آدرس باشد');
      }
      
      const res = await fetch(url, {
        credentials: "include",
      });

      // مدیریت خطای احراز هویت
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        const error = await createAPIError(res);
        throw error;
      }

      // مدیریت سایر خطاها
      if (!res.ok) {
        const error = await createAPIError(res);
        throw error;
      }
      
      return await res.json();
    } catch (error) {
      // تبدیل خطاهای شبکه به فرمت استاندارد
      if (error instanceof Error && error.name === 'TypeError') {
        const networkError: APIError = {
          type: APIErrorType.NETWORK,
          status: 0,
          message: 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
          originalError: error,
        };
        throw networkError;
      }
      
      throw error;
    }
  };

// تنظیمات پیش‌فرض React Query
const defaultOptions: DefaultOptions = {
  queries: {
    queryFn: getQueryFn({ on401: "throw" }),
    refetchOnWindowFocus: false,  // عدم درخواست مجدد هنگام فوکوس پنجره
    refetchOnMount: true,         // درخواست مجدد هنگام نصب کامپوننت
    refetchOnReconnect: true,     // درخواست مجدد هنگام اتصال مجدد به اینترنت
    staleTime: 5 * 60 * 1000,     // زمان منقضی شدن داده (5 دقیقه)
    cacheTime: 10 * 60 * 1000,    // زمان نگهداری در کش (10 دقیقه)
    retry: (failureCount, error) => {
      // تلاش مجدد برای خطاهای شبکه و سرور (حداکثر 3 بار)
      if (failureCount < 3) {
        const apiError = error as APIError;
        return apiError.type === APIErrorType.NETWORK || apiError.type === APIErrorType.SERVER;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // تاخیر نمایی تا حداکثر 30 ثانیه
  },
  mutations: {
    retry: false,
    onError: (error: unknown) => {
      // نمایش خطای پیش‌فرض برای تمام mutations
      const apiError = error as APIError;
      if (apiError.type && apiError.message) {
        toast({
          variant: "destructive",
          title: "خطا در انجام عملیات",
          description: apiError.message
        });
      }
    }
  },
};

// ایجاد نمونه QueryClient با تنظیمات بهبود یافته
export const queryClient = new QueryClient({
  defaultOptions,
});
