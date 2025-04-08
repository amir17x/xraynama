import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import ReviewItem from './ReviewItem';
import CommentItem from './CommentItem';
import { Loader2 } from 'lucide-react';

interface ReviewsAndCommentsProps {
  contentId: string;
}

const ReviewsAndComments: React.FC<ReviewsAndCommentsProps> = ({ contentId }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewScore, setReviewScore] = useState(5);
  const [hasContainsSpoiler, setHasContainsSpoiler] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // دریافت نظرات
  const { 
    data: comments, 
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments 
  } = useQuery({
    queryKey: ['/api/content', contentId, 'comments'],
    queryFn: () => fetch(`/api/content/${contentId}/comments`).then(res => res.json()),
    staleTime: 60000,  // 1 minute
  });

  // دریافت نقدها
  const { 
    data: reviews, 
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews 
  } = useQuery({
    queryKey: ['/api/content', contentId, 'reviews'],
    queryFn: () => fetch(`/api/content/${contentId}/reviews`).then(res => res.json()),
    staleTime: 60000,  // 1 minute
  });

  // ارسال نظر جدید
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "خطا",
        description: "برای ثبت نظر ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        title: "خطا",
        description: "متن نظر نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      await apiRequest(`/api/content/${contentId}/comments`, {
        method: 'POST',
        data: { text: commentText },
      });

      toast({
        title: "موفقیت",
        description: "نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد",
        variant: "default",
      });

      setCommentText('');
      refetchComments();
    } catch (error) {
      toast({
        title: "خطا",
        description: "در ثبت نظر خطایی رخ داد. لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  // ارسال نقد جدید
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: "خطا",
        description: "برای ثبت نقد ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
      return;
    }

    if (!reviewTitle.trim()) {
      toast({
        title: "خطا",
        description: "عنوان نقد نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "خطا",
        description: "متن نقد نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReview(true);
      await apiRequest(`/api/content/${contentId}/reviews`, {
        method: 'POST',
        data: { 
          title: reviewTitle,
          text: reviewText,
          score: reviewScore,
          hasContainsSpoiler
        },
      });

      toast({
        title: "موفقیت",
        description: "نقد شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد",
        variant: "default",
      });

      setReviewTitle('');
      setReviewText('');
      setReviewScore(5);
      setHasContainsSpoiler(false);
      refetchReviews();
    } catch (error) {
      toast({
        title: "خطا",
        description: "در ثبت نقد خطایی رخ داد. لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // نمایش نقدها و نظرات در تب‌های جداگانه
  return (
    <Tabs defaultValue="reviews" className="w-full mt-8">
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="reviews" className="flex-1">نقدها</TabsTrigger>
        <TabsTrigger value="comments" className="flex-1">نظرات</TabsTrigger>
      </TabsList>
      
      {/* تب نقدها */}
      <TabsContent value="reviews" className="space-y-4 mt-4">
        <div className="p-4 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">نقد جدید</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="عنوان نقد"
              className="w-full p-3 rounded-md border bg-background"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              disabled={!isAuthenticated || submittingReview}
            />
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm font-medium">امتیاز:</span>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={reviewScore}
                onChange={(e) => setReviewScore(parseFloat(e.target.value))}
                disabled={!isAuthenticated || submittingReview}
                className="w-32"
              />
              <span className="text-sm">{reviewScore}</span>
            </div>
            
            <Textarea
              placeholder={isAuthenticated ? "نقد خود را بنویسید..." : "برای نوشتن نقد ابتدا وارد حساب کاربری خود شوید"}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={!isAuthenticated || submittingReview}
              className="min-h-[120px]"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="spoiler-check"
                checked={hasContainsSpoiler}
                onChange={(e) => setHasContainsSpoiler(e.target.checked)}
                disabled={!isAuthenticated || submittingReview}
                className="ml-2"
              />
              <label htmlFor="spoiler-check" className="text-sm">
                این نقد حاوی اسپویلر است
              </label>
            </div>
            
            <Button 
              onClick={handleSubmitReview} 
              disabled={!isAuthenticated || submittingReview || !reviewTitle.trim() || !reviewText.trim()}
              className="w-full md:w-auto"
            >
              {submittingReview && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ثبت نقد
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">نقدهای کاربران</h3>
          
          {reviewsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviewsError ? (
            <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg">
              خطا در بارگیری نقدها. لطفا دوباره تلاش کنید.
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <ReviewItem key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              هنوز نقدی برای این محتوا ثبت نشده است. اولین نفری باشید که نقد می‌نویسید!
            </div>
          )}
        </div>
      </TabsContent>
      
      {/* تب نظرات */}
      <TabsContent value="comments" className="space-y-4 mt-4">
        <div className="p-4 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">نظر جدید</h3>
          
          <div className="space-y-3">
            <Textarea
              placeholder={isAuthenticated ? "نظر خود را بنویسید..." : "برای نوشتن نظر ابتدا وارد حساب کاربری خود شوید"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isAuthenticated || submittingComment}
              className="min-h-[100px]"
            />
            
            <Button 
              onClick={handleSubmitComment} 
              disabled={!isAuthenticated || submittingComment || !commentText.trim()}
              className="w-full md:w-auto"
            >
              {submittingComment && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ثبت نظر
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">نظرات کاربران</h3>
          
          {commentsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : commentsError ? (
            <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg">
              خطا در بارگیری نظرات. لطفا دوباره تلاش کنید.
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <CommentItem key={comment._id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              هنوز نظری برای این محتوا ثبت نشده است. اولین نفری باشید که نظر می‌دهید!
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ReviewsAndComments;