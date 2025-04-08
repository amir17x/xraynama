import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ReviewsAndComments from '@/components/content/ReviewsAndComments';

/**
 * صفحه آزمایشی برای نمایش نقدها و نظرات
 * این صفحه برای تست کردن کامپوننت ReviewsAndComments استفاده می‌شود
 */
const TestReviews: React.FC = () => {
  // برای تست، شناسه یک محتوای موجود در دیتابیس را وارد کنید
  const { data: contents } = useQuery({
    queryKey: ['/api/content'],
    queryFn: () => fetch('/api/content?limit=1').then(res => res.json()),
  });

  const contentId = contents && contents.length > 0 ? contents[0].id : null;

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">صفحه تست نمایش نقدها و نظرات</h1>
      
      {contentId ? (
        <ReviewsAndComments contentId={contentId} />
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          در حال بارگیری محتوا...
        </div>
      )}
    </div>
  );
};

export default TestReviews;