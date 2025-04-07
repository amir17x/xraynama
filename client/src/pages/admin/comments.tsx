import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Search,
  ArrowLeft,
  ArrowRight,
  Eye,
  User,
  Calendar,
  Film,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function AdminComments() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('pending');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingComment, setViewingComment] = useState<any>(null);
  
  const pageSize = 10;

  // Parse URL parameters for status filtering
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const statusParam = searchParams.get('status');
  
  // Update active tab from URL parameter
  useState(() => {
    if (statusParam && ['pending', 'approved', 'rejected'].includes(statusParam)) {
      setActiveTab(statusParam);
    }
  });

  // Fetch comments with pagination, search, and status filter
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/comments', currentPage, searchTerm, activeTab],
    queryFn: async ({ queryKey }) => {
      const [url, page, search, status] = queryKey;
      let apiUrl = `${url}?page=${page}&limit=${pageSize}&status=${status}`;
      
      if (search) {
        apiUrl += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست نظرات');
      }
      
      return response.json();
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest('PATCH', `/api/admin/comments/${commentId}/approve`);
      
      if (!response.ok) {
        throw new Error('خطا در تأیید نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats/comments'] });
      toast({
        title: 'تأیید موفق',
        description: 'نظر با موفقیت تأیید شد.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject comment mutation
  const rejectCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest('PATCH', `/api/admin/comments/${commentId}/reject`);
      
      if (!response.ok) {
        throw new Error('خطا در رد نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats/comments'] });
      toast({
        title: 'رد موفق',
        description: 'نظر با موفقیت رد شد.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/comments/${commentId}`);
      
      if (!response.ok) {
        throw new Error('خطا در حذف نظر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats/comments'] });
      setShowDeleteDialog(false);
      toast({
        title: 'حذف موفق',
        description: 'نظر با موفقیت حذف شد.',
      });
    },
    onError: (error: Error) => {
      setShowDeleteDialog(false);
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle comments approval
  const handleApproveComment = (commentId: number) => {
    approveCommentMutation.mutate(commentId);
  };

  // Handle comments rejection
  const handleRejectComment = (commentId: number) => {
    rejectCommentMutation.mutate(commentId);
  };

  // Handle comment delete
  const handleDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  // Confirm comment delete
  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
    }
  };

  // Handle view comment
  const handleViewComment = (comment: any) => {
    setViewingComment(comment);
    setShowViewDialog(true);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on filter change
    
    // Update URL with status parameter
    navigate(`/admin/comments?status=${tab}`);
  };

  // Pagination controls
  const totalPages = data?.totalPages || 1;
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">مدیریت نظرات</h1>
            <p className="text-gray-400">مدیریت نظرات کاربران در محتوا</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Link href="/admin/dashboard">
              <a className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <span>بازگشت به داشبورد</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
          <Tabs value={activeTab} className="flex-1">
            <TabsList className="bg-dark-card border border-dark-border grid grid-cols-3 h-11">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-dark-lighter dark:data-[state=active]:text-white"
                onClick={() => handleTabChange('pending')}
              >
                <AlertCircle className="h-4 w-4 ml-2 text-amber-500" />
                در انتظار تأیید
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="data-[state=active]:bg-dark-lighter dark:data-[state=active]:text-white"
                onClick={() => handleTabChange('approved')}
              >
                <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                تأیید شده
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="data-[state=active]:bg-dark-lighter dark:data-[state=active]:text-white"
                onClick={() => handleTabChange('rejected')}
              >
                <XCircle className="h-4 w-4 ml-2 text-red-500" />
                رد شده
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="md:w-1/3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="جستجو در نظرات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 bg-dark border-dark-border"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-label="جستجو"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Comments List */}
        <Card className="bg-dark-card border-dark-border overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {activeTab === 'pending' && 'نظرات در انتظار تأیید'}
                {activeTab === 'approved' && 'نظرات تأیید شده'}
                {activeTab === 'rejected' && 'نظرات رد شده'}
              </CardTitle>
              <div className="text-sm text-gray-400">
                {data?.totalItems ? `${data.totalItems} نظر یافت شد` : 'در حال بارگذاری...'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-dark-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>متن نظر</TableHead>
                    <TableHead>کاربر</TableHead>
                    <TableHead>محتوا</TableHead>
                    <TableHead className="text-center">تاریخ ارسال</TableHead>
                    <TableHead className="text-center">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="border-dark-border">
                        <TableCell colSpan={6} className="h-16">
                          <div className="w-full h-10 bg-dark-lighter animate-pulse rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">
                        خطا در بارگذاری داده‌ها
                      </TableCell>
                    </TableRow>
                  ) : data?.comments && data.comments.length > 0 ? (
                    data.comments.map((comment: any, index: number) => (
                      <TableRow key={comment.id} className="border-dark-border">
                        <TableCell className="font-medium text-center">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-2 max-w-md">
                            {comment.text}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              {comment.user?.avatar ? (
                                <img src={comment.user.avatar} alt={comment.user.username} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <span>{comment.user?.username || 'کاربر ناشناس'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded flex items-center justify-center mr-2">
                              {comment.content?.poster ? (
                                <img src={comment.content.poster} alt={comment.content.title} className="w-full h-full rounded object-cover" />
                              ) : (
                                <Film className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <span className="line-clamp-1">{comment.content?.title || 'محتوای نامشخص'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-1 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500"
                              onClick={() => handleViewComment(comment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {activeTab === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-green-500"
                                  onClick={() => handleApproveComment(comment.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => handleRejectComment(comment.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        هیچ نظری یافت نشد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data?.totalPages && data.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-dark-border">
                <div className="text-sm text-gray-400">
                  نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, data.totalItems)} از {data.totalItems} نظر
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="text-xs h-8 px-3 border-dark-border"
                  >
                    <ArrowRight className="h-4 w-4 ml-1" />
                    <span>قبلی</span>
                  </Button>
                  <div className="text-sm">
                    صفحه {currentPage} از {data.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === data.totalPages}
                    className="text-xs h-8 px-3 border-dark-border"
                  >
                    <span>بعدی</span>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Delete Comment Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle>تأیید حذف نظر</DialogTitle>
            <DialogDescription>
              آیا از حذف این نظر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 space-x-reverse">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={confirmDeleteComment}>
              تأیید حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Comment Dialog */}
      {viewingComment && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="bg-dark-card border-dark-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>مشاهده نظر</DialogTitle>
              <DialogDescription>
                جزئیات نظر کاربر
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-dark rounded-lg p-4 border border-dark-border">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-dark-lighter rounded-full flex items-center justify-center mr-3">
                    {viewingComment.user?.avatar ? (
                      <img src={viewingComment.user.avatar} alt={viewingComment.user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{viewingComment.user?.username || 'کاربر ناشناس'}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 ml-1" />
                      {formatDate(viewingComment.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="whitespace-pre-wrap">
                  {viewingComment.text}
                </div>
              </div>
              
              <div className="bg-dark rounded-lg p-4 border border-dark-border">
                <h3 className="text-sm font-medium mb-2 text-gray-400">مربوط به محتوا:</h3>
                <div className="flex items-center">
                  <div className="w-16 h-20 bg-dark-lighter rounded flex-shrink-0 ml-3 overflow-hidden">
                    {viewingComment.content?.poster ? (
                      <img 
                        src={viewingComment.content.poster} 
                        alt={viewingComment.content.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-6 w-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{viewingComment.content?.title || 'محتوای نامشخص'}</div>
                    <div className="text-sm text-gray-400">{viewingComment.content?.englishTitle}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {viewingComment.content?.type && (
                        <span className="bg-dark-lighter px-2 py-0.5 rounded text-xs">
                          {viewingComment.content.type === 'movie' ? 'فیلم' :
                           viewingComment.content.type === 'series' ? 'سریال' :
                           viewingComment.content.type === 'animation' ? 'انیمیشن' : 'مستند'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark rounded-lg p-4 border border-dark-border">
                <h3 className="text-sm font-medium mb-2 text-gray-400">وضعیت:</h3>
                <div className="flex items-center">
                  {viewingComment.isApproved === false && !viewingComment.isRejected && (
                    <div className="flex items-center text-amber-500">
                      <AlertCircle className="h-4 w-4 ml-2" />
                      <span>در انتظار تأیید</span>
                    </div>
                  )}
                  {viewingComment.isApproved === true && (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      <span>تأیید شده</span>
                    </div>
                  )}
                  {viewingComment.isRejected === true && (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 ml-2" />
                      <span>رد شده</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex space-x-2 space-x-reverse gap-2">
              {viewingComment.isApproved === false && !viewingComment.isRejected && (
                <>
                  <Button variant="outline" onClick={() => {
                    handleApproveComment(viewingComment.id);
                    setShowViewDialog(false);
                  }}>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    <span>تأیید نظر</span>
                  </Button>
                  <Button variant="outline" onClick={() => {
                    handleRejectComment(viewingComment.id);
                    setShowViewDialog(false);
                  }}>
                    <XCircle className="h-4 w-4 ml-2" />
                    <span>رد نظر</span>
                  </Button>
                </>
              )}
              <Button variant="default" onClick={() => setShowViewDialog(false)}>
                بستن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}