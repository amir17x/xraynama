import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash,
  Star,
  Film,
  User,
  Clock,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns-jalali';

// تابع تبدیل تاریخ به فرمت دلخواه
function formatDate(dateString: string | undefined) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
  } catch (error) {
    return dateString;
  }
}

// تابع کوتاه کردن متن
function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// کامپوننت اصلی مدیریت نظرات
export default function AdminComments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // استیت‌ها
  const [activeTab, setActiveTab] = useState("comments");
  const [activeFilter, setActiveFilter] = useState("pending");
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showCommentDetailsDialog, setShowCommentDetailsDialog] = useState(false);
  const [showReviewDetailsDialog, setShowReviewDetailsDialog] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false);
  
  // کوئری‌ها
  const commentsQuery = useQuery({
    queryKey: ['/api/admin/comments'],
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  const reviewsQuery = useQuery({
    queryKey: ['/api/admin/reviews'],
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // میوتیشن‌ها برای نظرات
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در تایید نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({
        title: "عملیات موفق",
        description: "نظر با موفقیت تایید شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در تایید نظر",
        description: error.message || "خطایی در تایید نظر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const rejectCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/admin/comments/${commentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در رد نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({
        title: "عملیات موفق",
        description: "نظر با موفقیت رد شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در رد نظر",
        description: error.message || "خطایی در رد نظر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      setShowDeleteCommentDialog(false);
      toast({
        title: "عملیات موفق",
        description: "نظر با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف نظر",
        description: error.message || "خطایی در حذف نظر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن‌ها برای نقدها
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در تایید نقد');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      toast({
        title: "عملیات موفق",
        description: "نقد با موفقیت تایید شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در تایید نقد",
        description: error.message || "خطایی در تایید نقد رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در رد نقد');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      toast({
        title: "عملیات موفق",
        description: "نقد با موفقیت رد شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در رد نقد",
        description: error.message || "خطایی در رد نقد رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف نقد');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      setShowDeleteReviewDialog(false);
      toast({
        title: "عملیات موفق",
        description: "نقد با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف نقد",
        description: error.message || "خطایی در حذف نقد رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (commentsQuery.error) {
      toast({
        title: "خطا در دریافت نظرات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (reviewsQuery.error) {
      toast({
        title: "خطا در دریافت نقدها",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [commentsQuery.error, reviewsQuery.error, toast]);
  
  // فیلتر کردن نظرات بر اساس وضعیت
  const filteredComments = commentsQuery.data?.filter((comment: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return !comment.isApproved && !comment.isRejected;
    if (activeFilter === 'approved') return comment.isApproved;
    if (activeFilter === 'rejected') return comment.isRejected;
    return true;
  }) || [];
  
  // فیلتر کردن نقدها بر اساس وضعیت
  const filteredReviews = reviewsQuery.data?.filter((review: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return !review.isApproved && !review.isRejected;
    if (activeFilter === 'approved') return review.isApproved;
    if (activeFilter === 'rejected') return review.isRejected;
    return true;
  }) || [];
  
  // چک کردن وضعیت بارگذاری
  const isCommentsLoading = commentsQuery.isLoading;
  const isReviewsLoading = reviewsQuery.isLoading;
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6" /> مدیریت نظرات
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="comments">نظرات</TabsTrigger>
          <TabsTrigger value="reviews">نقدها</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="pt-4">
          <div className="mb-4 flex gap-2">
            <Button
              variant={activeFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('pending')}
            >
              در انتظار تایید
            </Button>
            <Button
              variant={activeFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('approved')}
            >
              تایید شده
            </Button>
            <Button
              variant={activeFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('rejected')}
            >
              رد شده
            </Button>
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              همه
            </Button>
          </div>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت نظرات</span>
                <div className="text-sm opacity-70">
                  {!isCommentsLoading && `${filteredComments.length} نظر`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCommentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>نظر</TableHead>
                        <TableHead>کاربر</TableHead>
                        <TableHead>محتوا</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead className="text-left">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComments.map((comment: any, index: number) => (
                        <TableRow key={comment.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="max-w-[200px]">
                            {truncateText(comment.text, 50)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                              <span>{comment.user?.username || 'کاربر ناشناس'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Film className="h-3.5 w-3.5 text-primary" />
                              <span>{comment.content?.title || 'محتوای نامشخص'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {comment.isApproved ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                تایید شده
                              </Badge>
                            ) : comment.isRejected ? (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                رد شده
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                در انتظار تایید
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{formatDate(comment.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setShowCommentDetailsDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>مشاهده جزئیات</span>
                                </DropdownMenuItem>
                                {!comment.isApproved && !comment.isRejected && (
                                  <DropdownMenuItem
                                    onClick={() => approveCommentMutation.mutate(comment.id)}
                                    disabled={approveCommentMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <span>تایید نظر</span>
                                  </DropdownMenuItem>
                                )}
                                {!comment.isRejected && (
                                  <DropdownMenuItem
                                    onClick={() => rejectCommentMutation.mutate(comment.id)}
                                    disabled={rejectCommentMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    <span>رد نظر</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setShowDeleteCommentDialog(true);
                                  }}
                                  className="text-red-500 hover:text-red-500"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredComments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            نظری یافت نشد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="pt-4">
          <div className="mb-4 flex gap-2">
            <Button
              variant={activeFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('pending')}
            >
              در انتظار تایید
            </Button>
            <Button
              variant={activeFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('approved')}
            >
              تایید شده
            </Button>
            <Button
              variant={activeFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('rejected')}
            >
              رد شده
            </Button>
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              همه
            </Button>
          </div>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت نقدها</span>
                <div className="text-sm opacity-70">
                  {!isReviewsLoading && `${filteredReviews.length} نقد`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isReviewsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>نقد</TableHead>
                        <TableHead>کاربر</TableHead>
                        <TableHead>محتوا</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead className="text-left">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review: any, index: number) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="max-w-[200px]">
                            {truncateText(review.text, 50)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                              <span>{review.user?.username || 'کاربر ناشناس'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Film className="h-3.5 w-3.5 text-primary" />
                              <span>{review.content?.title || 'محتوای نامشخص'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {review.isApproved ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                تایید شده
                              </Badge>
                            ) : review.isRejected ? (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                رد شده
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                در انتظار تایید
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{formatDate(review.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowReviewDetailsDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>مشاهده جزئیات</span>
                                </DropdownMenuItem>
                                {!review.isApproved && !review.isRejected && (
                                  <DropdownMenuItem
                                    onClick={() => approveReviewMutation.mutate(review.id)}
                                    disabled={approveReviewMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <span>تایید نقد</span>
                                  </DropdownMenuItem>
                                )}
                                {!review.isRejected && (
                                  <DropdownMenuItem
                                    onClick={() => rejectReviewMutation.mutate(review.id)}
                                    disabled={rejectReviewMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    <span>رد نقد</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowDeleteReviewDialog(true);
                                  }}
                                  className="text-red-500 hover:text-red-500"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredReviews.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            نقدی یافت نشد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* دیالوگ نمایش جزئیات نظر */}
      <Dialog open={showCommentDetailsDialog} onOpenChange={setShowCommentDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جزئیات نظر</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{selectedComment.user?.username || 'کاربر ناشناس'}</div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(selectedComment.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedComment.user?.email || '-'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span>متن نظر</span>
                  </div>
                  {selectedComment.isApproved ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      تایید شده
                    </Badge>
                  ) : selectedComment.isRejected ? (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      رد شده
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      در انتظار تایید
                    </Badge>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{selectedComment.text}</div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{selectedComment.content?.title || 'محتوای نامشخص'}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedComment.content?.englishTitle || '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedComment && (
              <>
                {!selectedComment.isApproved && !selectedComment.isRejected && (
                  <Button
                    onClick={() => {
                      approveCommentMutation.mutate(selectedComment.id);
                      setShowCommentDetailsDialog(false);
                    }}
                    disabled={approveCommentMutation.isPending}
                    className="gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>تایید نظر</span>
                  </Button>
                )}
                {!selectedComment.isRejected && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      rejectCommentMutation.mutate(selectedComment.id);
                      setShowCommentDetailsDialog(false);
                    }}
                    disabled={rejectCommentMutation.isPending}
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>رد نظر</span>
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowCommentDetailsDialog(false)}
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ نمایش جزئیات نقد */}
      <Dialog open={showReviewDetailsDialog} onOpenChange={setShowReviewDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جزئیات نقد</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{selectedReview.user?.username || 'کاربر ناشناس'}</div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(selectedReview.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedReview.user?.email || '-'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Star className="h-4 w-4 text-primary" />
                    <span>متن نقد</span>
                  </div>
                  {selectedReview.isApproved ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      تایید شده
                    </Badge>
                  ) : selectedReview.isRejected ? (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      رد شده
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      در انتظار تایید
                    </Badge>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{selectedReview.text}</div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{selectedReview.content?.title || 'محتوای نامشخص'}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedReview.content?.englishTitle || '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedReview && (
              <>
                {!selectedReview.isApproved && !selectedReview.isRejected && (
                  <Button
                    onClick={() => {
                      approveReviewMutation.mutate(selectedReview.id);
                      setShowReviewDetailsDialog(false);
                    }}
                    disabled={approveReviewMutation.isPending}
                    className="gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>تایید نقد</span>
                  </Button>
                )}
                {!selectedReview.isRejected && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      rejectReviewMutation.mutate(selectedReview.id);
                      setShowReviewDetailsDialog(false);
                    }}
                    disabled={rejectReviewMutation.isPending}
                    className="gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>رد نقد</span>
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowReviewDetailsDialog(false)}
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ حذف نظر */}
      <Dialog open={showDeleteCommentDialog} onOpenChange={setShowDeleteCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف نظر</DialogTitle>
            <DialogDescription>
              آیا از حذف این نظر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {selectedComment && (
            <div className="py-2">
              <div className="mb-2 text-sm opacity-70">متن نظر:</div>
              <div className="p-3 rounded-md bg-card border">
                {truncateText(selectedComment.text, 100)}
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <div className="opacity-70">
                  نویسنده: {selectedComment.user?.username || 'کاربر ناشناس'}
                </div>
                <div className="opacity-70">
                  تاریخ: {formatDate(selectedComment.createdAt)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteCommentDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteCommentMutation.isPending}
              onClick={() => deleteCommentMutation.mutate(selectedComment.id)}
            >
              {deleteCommentMutation.isPending ? 'در حال حذف...' : 'حذف نظر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ حذف نقد */}
      <Dialog open={showDeleteReviewDialog} onOpenChange={setShowDeleteReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف نقد</DialogTitle>
            <DialogDescription>
              آیا از حذف این نقد اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="py-2">
              <div className="mb-2 text-sm opacity-70">متن نقد:</div>
              <div className="p-3 rounded-md bg-card border">
                {truncateText(selectedReview.text, 100)}
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <div className="opacity-70">
                  نویسنده: {selectedReview.user?.username || 'کاربر ناشناس'}
                </div>
                <div className="opacity-70">
                  تاریخ: {formatDate(selectedReview.createdAt)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteReviewDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteReviewMutation.isPending}
              onClick={() => deleteReviewMutation.mutate(selectedReview.id)}
            >
              {deleteReviewMutation.isPending ? 'در حال حذف...' : 'حذف نقد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}