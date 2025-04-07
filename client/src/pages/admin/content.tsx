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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import {
  Film,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  ArrowLeft,
  ArrowRight,
  Eye,
  Plus,
  Type,
  Tv,
  Video,
  FileVideo
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function AdminContent() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);
  
  const pageSize = 10;

  // Parse URL parameters for content type filtering
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const typeParam = searchParams.get('type');
  
  // Update selected type from URL parameter
  useState(() => {
    if (typeParam && ['movie', 'series', 'animation', 'documentary'].includes(typeParam)) {
      setSelectedType(typeParam);
    }
  });

  // Fetch content with pagination, search, and type filter
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/content', currentPage, searchTerm, selectedType],
    queryFn: async ({ queryKey }) => {
      const [url, page, search, type] = queryKey;
      let apiUrl = `${url}?page=${page}&limit=${pageSize}`;
      
      if (search) {
        apiUrl += `&search=${encodeURIComponent(search)}`;
      }
      
      if (type) {
        apiUrl += `&type=${type}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست محتوا');
      }
      
      return response.json();
    },
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await apiRequest(`/api/admin/content/${contentId}`, {
        method: 'DELETE'
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowDeleteDialog(false);
      toast({
        title: 'حذف موفق',
        description: 'محتوا با موفقیت حذف شد.',
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

  // Handle content delete
  const handleDeleteContent = (contentId: number) => {
    setContentToDelete(contentId);
    setShowDeleteDialog(true);
  };

  // Confirm content delete
  const confirmDeleteContent = () => {
    if (contentToDelete) {
      deleteContentMutation.mutate(contentToDelete);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle type filter
  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page on filter change
    
    // Update URL with type parameter
    if (type) {
      navigate(`/admin/content?type=${type}`);
    } else {
      navigate('/admin/content');
    }
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

  // Function to get the icon for content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="h-4 w-4 text-blue-500" />;
      case 'series':
        return <Tv className="h-4 w-4 text-green-500" />;
      case 'animation':
        return <FileVideo className="h-4 w-4 text-purple-500" />;
      case 'documentary':
        return <Video className="h-4 w-4 text-yellow-500" />;
      default:
        return <Film className="h-4 w-4 text-gray-500" />;
    }
  };

  // Function to translate content type to Persian
  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'movie':
        return 'فیلم';
      case 'series':
        return 'سریال';
      case 'animation':
        return 'انیمیشن';
      case 'documentary':
        return 'مستند';
      default:
        return type;
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">مدیریت محتوا</h1>
            <p className="text-gray-400">مدیریت فیلم‌ها، سریال‌ها و سایر محتوا</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button asChild className="bg-blue-700 hover:bg-blue-600">
              <Link href="/admin/content/create">
                <a className="flex items-center">
                  <Plus className="h-4 w-4 ml-2" />
                  <span>افزودن محتوا</span>
                </a>
              </Link>
            </Button>
            <Link href="/admin/dashboard">
              <a className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <span>بازگشت به داشبورد</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-dark-card border-dark-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">فیلتر و جستجو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="جستجو بر اساس عنوان یا توضیحات..."
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
              <div>
                <Select
                  value={selectedType || ""}
                  onValueChange={(value) => handleTypeFilter(value === "" ? null : value)}
                >
                  <SelectTrigger className="w-40 bg-dark border-dark-border">
                    <SelectValue placeholder="همه محتوا" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    <SelectItem value="">همه محتوا</SelectItem>
                    <SelectItem value="movie">فیلم</SelectItem>
                    <SelectItem value="series">سریال</SelectItem>
                    <SelectItem value="animation">انیمیشن</SelectItem>
                    <SelectItem value="documentary">مستند</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card className="bg-dark-card border-dark-border overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">لیست محتوا</CardTitle>
              <div className="text-sm text-gray-400">
                {data?.totalItems ? `${data.totalItems} محتوا یافت شد` : 'در حال بارگذاری...'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-dark-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>عنوان</TableHead>
                    <TableHead className="text-center">نوع</TableHead>
                    <TableHead className="text-center">سال انتشار</TableHead>
                    <TableHead className="text-center">امتیاز IMDb</TableHead>
                    <TableHead className="text-center">تاریخ ایجاد</TableHead>
                    <TableHead className="text-center">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="border-dark-border">
                        <TableCell colSpan={7} className="h-16">
                          <div className="w-full h-10 bg-dark-lighter animate-pulse rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">
                        خطا در بارگذاری داده‌ها
                      </TableCell>
                    </TableRow>
                  ) : data?.content && data.content.length > 0 ? (
                    data.content.map((item: any, index: number) => (
                      <TableRow key={item.id} className="border-dark-border">
                        <TableCell className="font-medium text-center">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-14 bg-dark-lighter rounded flex-shrink-0 mr-3 overflow-hidden">
                              {item.poster ? (
                                <img 
                                  src={item.poster} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="h-5 w-5 text-blue-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div>{item.title}</div>
                              <div className="text-xs text-gray-400">{item.englishTitle}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1 space-x-reverse">
                            {getContentTypeIcon(item.type)}
                            <span className="text-sm">{getContentTypeText(item.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.year}</TableCell>
                        <TableCell className="text-center">
                          {item.imdbRating ? (
                            <div className="flex items-center justify-center">
                              <span className="text-yellow-500 font-medium mr-1">{item.imdbRating}</span>
                              <span className="text-xs text-gray-400">/10</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">--</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-1 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500"
                              asChild
                            >
                              <Link href={`/content/${item.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-amber-500"
                              asChild
                            >
                              <Link href={`/admin/content/edit/${item.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        هیچ محتوایی یافت نشد
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
                  نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, data.totalItems)} از {data.totalItems} محتوا
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

      {/* Delete Content Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle>تأیید حذف محتوا</DialogTitle>
            <DialogDescription>
              آیا از حذف این محتوا اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 space-x-reverse">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={confirmDeleteContent}>
              تأیید حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}