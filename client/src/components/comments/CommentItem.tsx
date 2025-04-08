import React, { useState } from 'react';
import { format } from 'date-fns-jalali';
import { 
  MessageSquare, 
  Star, 
  MessageCircle, 
  CornerDownLeft, 
  ThumbsUp, 
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import SpoilerText from '../shared/SpoilerText';
import CommentReplyForm from './CommentReplyForm';

interface CommentData {
  id: string | number;
  text: string;
  userId: string | number;
  userName: string;
  userAvatar?: string;
  contentId: string | number;
  createdAt: string | Date;
  type?: 'comment' | 'review' | 'question';
  score?: number;
  hasContainsSpoiler?: boolean;
  replies?: CommentData[];
  isApproved?: boolean;
}

interface CommentItemProps {
  comment: CommentData;
  isReply?: boolean;
  contentId: string | number;
}

export function CommentItem({ comment, isReply = false, contentId }: CommentItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const date = comment.createdAt instanceof Date 
    ? comment.createdAt 
    : new Date(comment.createdAt);
  
  const formattedDate = format(date, 'yyyy/MM/dd');
  
  const handleLike = async () => {
    if (isLiking) return;
    
    if (!user) {
      toast({
        title: 'ابتدا وارد شوید',
        description: 'برای پسندیدن نظرات، ابتدا باید وارد حساب کاربری خود شوید',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLiking(true);
      
      await apiRequest('POST', `/api/content/${contentId}/comments/${comment.id}/like`);
      
      setLiked(true);
      setLikeCount(prevCount => prevCount + 1);
      
      toast({
        title: 'موفق',
        description: 'نظر با موفقیت پسندیده شد',
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: 'خطا',
        description: 'مشکلی در پسندیدن نظر پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleReport = async () => {
    if (!user) {
      toast({
        title: 'ابتدا وارد شوید',
        description: 'برای گزارش تخلف، ابتدا باید وارد حساب کاربری خود شوید',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await apiRequest('POST', `/api/content/${contentId}/comments/${comment.id}/report`);
      
      toast({
        title: 'گزارش ثبت شد',
        description: 'گزارش شما با موفقیت ثبت شد و توسط تیم بررسی خواهد شد',
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'خطا',
        description: 'مشکلی در ثبت گزارش پیش آمد',
        variant: 'destructive',
      });
    }
  };
  
  // تشخیص نوع آیکون برای نمایش (نظر، نقد، سوال)
  const getTypeIcon = () => {
    switch (comment.type) {
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // گرفتن نام نوع نظر برای نمایش
  const getTypeName = () => {
    switch (comment.type) {
      case 'review':
        return 'نقد';
      case 'question':
        return 'سوال';
      default:
        return 'نظر';
    }
  };
  
  // کلاس‌های مختلف برای نمایش انواع نظر
  const getTypeClasses = () => {
    switch (comment.type) {
      case 'review':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'question':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };
  
  return (
    <Card className={`mb-4 ${isReply ? 'mr-8 md:mr-16 mt-2' : ''}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="relative">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={comment.userAvatar} alt={comment.userName} />
              <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {/* نمایش آیکون نوع نظر کنار آواتار */}
            <div className="absolute -right-2 -bottom-1 bg-white dark:bg-background rounded-full p-0.5 border">
              {getTypeIcon()}
            </div>
          </div>
          
          <div className="flex-1 mr-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <h4 className="font-semibold text-foreground">{comment.userName}</h4>
                
                {/* نشانگر نوع نظر */}
                <Badge 
                  variant="outline" 
                  className={`mr-2 text-xs font-normal ${getTypeClasses()}`}
                >
                  {getTypeName()}
                </Badge>
                
                {/* اگر این نظر هنوز تایید نشده باشد */}
                {comment.isApproved === false && (
                  <Badge 
                    variant="outline" 
                    className="mr-2 bg-orange-500/10 text-orange-700 border-orange-200 text-xs font-normal"
                  >
                    در انتظار تایید
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground flex items-center mt-1 sm:mt-0">
                <span>{formattedDate}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">گزینه‌های بیشتر</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleReport}>
                      گزارش تخلف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* امتیاز دهی در صورتی که نظر از نوع نقد باشد */}
            {comment.type === 'review' && comment.score !== undefined && (
              <div className="flex items-center mt-1 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= comment.score! 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground mr-2">
                  {comment.score} از 5
                </span>
              </div>
            )}
            
            {/* نمایش متن نظر */}
            <div className="mt-2 text-foreground text-sm">
              {comment.hasContainsSpoiler ? (
                <SpoilerText>{comment.text}</SpoilerText>
              ) : (
                <p>{comment.text}</p>
              )}
            </div>
            
            {/* دکمه‌های تعامل با نظر */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs flex items-center gap-1"
                onClick={handleLike}
                disabled={isLiking || liked}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-primary text-primary' : ''}`} />
                <span>{likeCount > 0 ? likeCount : ''} پسندیدم</span>
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  <span>پاسخ</span>
                </Button>
              )}
            </div>
            
            {/* فرم پاسخ به نظر */}
            {showReplyForm && (
              <CommentReplyForm
                commentId={comment.id}
                contentId={contentId}
                onCancel={() => setShowReplyForm(false)}
                onSuccess={() => {
                  // بعد از ارسال موفق پاسخ، فرم را ببند
                  setShowReplyForm(false);
                }}
              />
            )}
            
            {/* پاسخ‌های نظر */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isReply={true}
                      contentId={contentId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CommentItem;