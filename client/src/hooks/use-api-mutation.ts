import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { apiRequest, APIError, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

/**
 * گزینه‌های استفاده از هوک useApiMutation
 */
export interface UseApiMutationOptions<TData = unknown, TError = APIError, TVariables = unknown, TContext = unknown> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  /** آیا پیام موفقیت آمیز بودن نمایش داده شود */
  showSuccessToast?: boolean;
  /** عنوان پیام موفقیت */
  successTitle?: string;
  /** متن پیام موفقیت */
  successMessage?: string;
  /** آیا خطاها به صورت خودکار نمایش داده شوند */
  showErrorToast?: boolean;
  /** عنوان پیام خطا */
  errorTitle?: string;
  /** کلیدهای کوئری که باید بعد از موفقیت بی‌اعتبار شوند */
  invalidateQueriesOnSuccess?: unknown[][];
}

/**
 * هوک بهبود یافته برای استفاده از Mutation با مدیریت خطا و موفقیت
 * @param url آدرس endpoint
 * @param method روش HTTP (GET, POST, PUT, DELETE)
 * @param options گزینه‌های اضافی
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseApiMutationOptions<TData, APIError, TVariables>
): UseMutationResult<TData, APIError, TVariables> {
  const {
    showSuccessToast = true,
    successTitle = 'عملیات موفقیت‌آمیز',
    successMessage = 'عملیات با موفقیت انجام شد',
    showErrorToast = true,
    errorTitle = 'خطا',
    invalidateQueriesOnSuccess,
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {};

  return useMutation<TData, APIError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await apiRequest({
        url,
        method,
        data: variables
      });
      
      try {
        return await response.json();
      } catch (e) {
        // اگر پاسخ خالی است یا JSON نیست، پاسخ خالی برگردان
        return {} as TData;
      }
    },
    onSuccess: async (data, variables, context) => {
      // در صورت تنظیم، پیام موفقیت را نمایش بده
      if (showSuccessToast) {
        toast({
          title: successTitle,
          description: successMessage,
        });
      }
      
      // در صورت تنظیم، کوئری‌های مورد نظر را بی‌اعتبار کن
      if (invalidateQueriesOnSuccess && invalidateQueriesOnSuccess.length > 0) {
        const promises = invalidateQueriesOnSuccess.map(queryKey => 
          queryClient.invalidateQueries({ queryKey })
        );
        await Promise.all(promises);
      }
      
      // اگر پردازنده onSuccess سفارشی تنظیم شده، آن را فراخوانی کن
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // در صورت تنظیم، پیام خطا را نمایش بده
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: errorTitle,
          description: error.message || 'خطایی رخ داد. لطفا دوباره تلاش کنید.',
        });
      }
      
      // اگر پردازنده onError سفارشی تنظیم شده، آن را فراخوانی کن
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * هوک ساده شده برای ثبت نظر
 */
export function useAddComment() {
  return useApiMutation<any, {
    contentId: number;
    text: string;
    parentId?: number;
  }>(
    '/api/comments',
    'POST',
    {
      successMessage: 'نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده خواهد شد',
      invalidateQueriesOnSuccess: [['/api/comments']]
    }
  );
}

/**
 * هوک ساده شده برای ثبت امتیاز
 */
export function useAddRating() {
  return useApiMutation<any, {
    contentId: number;
    score: number;
  }>(
    '/api/ratings',
    'POST',
    {
      successMessage: 'امتیاز شما با موفقیت ثبت شد',
      invalidateQueriesOnSuccess: [['/api/ratings']]
    }
  );
}

/**
 * هوک ساده شده برای افزودن محتوا به لیست تماشا
 */
export function useAddToWatchlist() {
  return useApiMutation<any, number>(
    '/api/user/watchlist',
    'POST',
    {
      successMessage: 'محتوا با موفقیت به لیست تماشا اضافه شد',
      invalidateQueriesOnSuccess: [['/api/user/watchlist']]
    }
  );
}

/**
 * هوک ساده شده برای افزودن محتوا به علاقه‌مندی‌ها
 */
export function useAddToFavorites() {
  return useApiMutation<any, number>(
    '/api/user/favorites',
    'POST',
    {
      successMessage: 'محتوا با موفقیت به علاقه‌مندی‌ها اضافه شد',
      invalidateQueriesOnSuccess: [['/api/user/favorites']]
    }
  );
}

/**
 * هوک ساده شده برای حذف محتوا از لیست تماشا
 */
export function useRemoveFromWatchlist() {
  return useApiMutation<any, number>(
    '/api/user/watchlist/remove',
    'POST',
    {
      successMessage: 'محتوا با موفقیت از لیست تماشا حذف شد',
      invalidateQueriesOnSuccess: [['/api/user/watchlist']]
    }
  );
}

/**
 * هوک ساده شده برای حذف محتوا از علاقه‌مندی‌ها
 */
export function useRemoveFromFavorites() {
  return useApiMutation<any, number>(
    '/api/user/favorites/remove',
    'POST',
    {
      successMessage: 'محتوا با موفقیت از علاقه‌مندی‌ها حذف شد',
      invalidateQueriesOnSuccess: [['/api/user/favorites']]
    }
  );
}