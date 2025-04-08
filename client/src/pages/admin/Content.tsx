import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileVideo,
  Film,
  MoreHorizontal,
  Tv,
  Edit,
  Trash,
  Plus,
  ArrowLeft,
  Star,
  FileImage,
  Volume2,
  Type,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// اسکیما برای فرم ایجاد/ویرایش محتوا
const contentSchema = z.object({
  title: z.string().min(3, { message: "عنوان باید حداقل 3 کاراکتر باشد" }),
  englishTitle: z.string().min(3, { message: "عنوان انگلیسی باید حداقل 3 کاراکتر باشد" }),
  type: z.enum(["movie", "series", "animation", "documentary"], { message: "نوع محتوا نامعتبر است" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل 10 کاراکتر باشد" }),
  year: z.string().regex(/^\d{4}$/, { message: "سال باید 4 رقمی باشد" }),
  duration: z.string().optional(),
  poster: z.string().url({ message: "لینک تصویر پوستر نامعتبر است" }),
  backdrop: z.string().url({ message: "لینک تصویر پس‌زمینه نامعتبر است" }),
  imdbRating: z.string().regex(/^\d(\.\d{1,2})?$/, { message: "امتیاز IMDb باید عددی بین 0 تا 10 باشد" }),
  hasPersianDubbing: z.boolean().default(false),
  hasPersianSubtitle: z.boolean().default(true),
  genres: z.array(z.string()).min(1, { message: "حداقل یک ژانر باید انتخاب شود" }),
  tags: z.array(z.string()).optional(),
});

// تابع برای نمایش آیکون مناسب برای نوع محتوا
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'movie':
      return <Film className="h-4 w-4 text-blue-500" />;
    case 'series':
      return <Tv className="h-4 w-4 text-purple-500" />;
    case 'animation':
      return <FileVideo className="h-4 w-4 text-green-500" />;
    case 'documentary':
      return <BookOpen className="h-4 w-4 text-amber-500" />;
    default:
      return <FileVideo className="h-4 w-4" />;
  }
};

// تابع برای نمایش متن مناسب برای نوع محتوا
const getContentTypeName = (type: string) => {
  switch (type) {
    case 'movie':
      return "فیلم";
    case 'series':
      return "سریال";
    case 'animation':
      return "انیمیشن";
    case 'documentary':
      return "مستند";
    default:
      return "نامشخص";
  }
};

// کامپوننت اصلی مدیریت محتوا
export default function AdminContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // استیت‌ها
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // فرم ایجاد/ویرایش محتوا
  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      englishTitle: '',
      type: 'movie',
      description: '',
      year: new Date().getFullYear().toString(),
      duration: '',
      poster: '',
      backdrop: '',
      imdbRating: '0',
      hasPersianDubbing: false,
      hasPersianSubtitle: true,
      genres: [],
      tags: [],
    },
  });
  
  // دریافت لیست محتوا
  const contentQuery = useQuery({
    queryKey: ['/api/admin/content'],
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // دریافت لیست ژانرها
  const genresQuery = useQuery({
    queryKey: ['/api/genres'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // دریافت لیست تگ‌ها
  const tagsQuery = useQuery({
    queryKey: ['/api/tags'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // میوتیشن برای ایجاد محتوای جدید
  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ایجاد محتوا');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "عملیات موفق",
        description: "محتوای جدید با موفقیت ایجاد شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ایجاد محتوا",
        description: error.message || "خطایی در ایجاد محتوای جدید رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن برای ویرایش محتوا
  const updateContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await fetch(`/api/admin/content/${selectedContent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در بروزرسانی محتوا');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowEditDialog(false);
      toast({
        title: "عملیات موفق",
        description: "محتوا با موفقیت بروزرسانی شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در بروزرسانی",
        description: error.message || "خطایی در بروزرسانی محتوا رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن برای حذف محتوا
  const deleteContentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/content/${selectedContent.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف محتوا');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowDeleteDialog(false);
      toast({
        title: "عملیات موفق",
        description: "محتوا با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف",
        description: error.message || "خطایی در حذف محتوا رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // آماده سازی فرم ویرایش محتوا با اطلاعات محتوای انتخاب شده
  useEffect(() => {
    if (selectedContent && showEditDialog) {
      form.reset({
        title: selectedContent.title,
        englishTitle: selectedContent.englishTitle,
        type: selectedContent.type,
        description: selectedContent.description,
        year: selectedContent.year.toString(),
        duration: selectedContent.duration?.toString() || '',
        poster: selectedContent.poster,
        backdrop: selectedContent.backdrop,
        imdbRating: selectedContent.imdbRating.toString(),
        hasPersianDubbing: selectedContent.hasPersianDubbing || false,
        hasPersianSubtitle: selectedContent.hasPersianSubtitle || false,
        genres: selectedContent.genres?.map((g: any) => g.id.toString()) || [],
        tags: selectedContent.tags?.map((t: any) => t.id.toString()) || [],
      });
    }
  }, [selectedContent, showEditDialog, form]);
  
  // تابع برای ایجاد محتوای جدید
  const onSubmitCreate = form.handleSubmit((data) => {
    createContentMutation.mutate({
      ...data,
      year: parseInt(data.year),
      duration: data.duration ? parseInt(data.duration) : null,
      imdbRating: parseFloat(data.imdbRating),
    });
  });
  
  // تابع برای ویرایش محتوا
  const onSubmitEdit = form.handleSubmit((data) => {
    updateContentMutation.mutate({
      ...data,
      year: parseInt(data.year),
      duration: data.duration ? parseInt(data.duration) : null,
      imdbRating: parseFloat(data.imdbRating),
    });
  });
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (contentQuery.error) {
      toast({
        title: "خطا در دریافت اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [contentQuery.error, toast]);
  
  // فیلتر کردن محتوا بر اساس تب فعال
  const filteredContent = contentQuery.data?.filter((content: any) => {
    if (activeTab === 'all') return true;
    return content.type === activeTab;
  }) || [];
  
  // چک کردن وضعیت بارگذاری
  const isLoading = contentQuery.isLoading || genresQuery.isLoading || tagsQuery.isLoading;
  
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
            <FileVideo className="h-6 w-6" /> مدیریت محتوا
          </h1>
        </div>
        <Button
          onClick={() => {
            form.reset({
              title: '',
              englishTitle: '',
              type: 'movie',
              description: '',
              year: new Date().getFullYear().toString(),
              duration: '',
              poster: '',
              backdrop: '',
              imdbRating: '0',
              hasPersianDubbing: false,
              hasPersianSubtitle: true,
              genres: [],
              tags: [],
            });
            setShowCreateDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>افزودن محتوای جدید</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="movie">فیلم‌ها</TabsTrigger>
          <TabsTrigger value="series">سریال‌ها</TabsTrigger>
          <TabsTrigger value="animation">انیمیشن‌ها</TabsTrigger>
          <TabsTrigger value="documentary">مستندها</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="bg-primary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>لیست محتوا</span>
            <div className="text-sm opacity-70">{!isLoading && `${filteredContent.length} مورد`}</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
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
                    <TableHead>عنوان</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>سال</TableHead>
                    <TableHead>امتیاز IMDb</TableHead>
                    <TableHead>دوبله فارسی</TableHead>
                    <TableHead>زیرنویس فارسی</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((content: any, index: number) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{content.title}</span>
                          <span className="text-xs opacity-70">{content.englishTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getContentTypeIcon(content.type)}
                          <span>{getContentTypeName(content.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{content.year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span>{content.imdbRating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {content.hasPersianDubbing ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            دارد
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                            ندارد
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {content.hasPersianSubtitle ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            دارد
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                            ندارد
                          </Badge>
                        )}
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
                                setSelectedContent(content);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span>ویرایش</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContent(content);
                                setShowDeleteDialog(true);
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
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* دیالوگ ایجاد محتوای جدید */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>افزودن محتوای جدید</DialogTitle>
            <DialogDescription>
              اطلاعات محتوای جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmitCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان فارسی</FormLabel>
                        <FormControl>
                          <Input placeholder="عنوان فارسی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="englishTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان انگلیسی</FormLabel>
                        <FormControl>
                          <Input placeholder="عنوان انگلیسی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع محتوا</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب نوع محتوا" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="movie">فیلم</SelectItem>
                            <SelectItem value="series">سریال</SelectItem>
                            <SelectItem value="animation">انیمیشن</SelectItem>
                            <SelectItem value="documentary">مستند</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سال تولید</FormLabel>
                          <FormControl>
                            <Input placeholder="سال تولید" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مدت زمان (دقیقه)</FormLabel>
                          <FormControl>
                            <Input placeholder="مدت زمان" {...field} />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            فقط برای فیلم‌ها و مستندها
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="imdbRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>امتیاز IMDb</FormLabel>
                        <FormControl>
                          <Input placeholder="امتیاز IMDb" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hasPersianDubbing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>دوبله فارسی</FormLabel>
                            <FormDescription>
                              آیا این محتوا دوبله فارسی دارد؟
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasPersianSubtitle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>زیرنویس فارسی</FormLabel>
                            <FormDescription>
                              آیا این محتوا زیرنویس فارسی دارد؟
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات محتوا را وارد کنید"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poster"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لینک تصویر پوستر</FormLabel>
                        <FormControl>
                          <Input placeholder="لینک تصویر پوستر" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backdrop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لینک تصویر پس‌زمینه</FormLabel>
                        <FormControl>
                          <Input placeholder="لینک تصویر پس‌زمینه" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ژانرها</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {genresQuery.data?.map((genre: any) => (
                            <Badge
                              key={genre.id}
                              variant={field.value.includes(genre.id.toString()) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => {
                                const currentValue = [...field.value];
                                const index = currentValue.indexOf(genre.id.toString());
                                if (index > -1) {
                                  currentValue.splice(index, 1);
                                } else {
                                  currentValue.push(genre.id.toString());
                                }
                                field.onChange(currentValue);
                              }}
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تگ‌ها</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {tagsQuery.data?.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              variant={field.value.includes(tag.id.toString()) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => {
                                const currentValue = [...field.value];
                                const index = currentValue.indexOf(tag.id.toString());
                                if (index > -1) {
                                  currentValue.splice(index, 1);
                                } else {
                                  currentValue.push(tag.id.toString());
                                }
                                field.onChange(currentValue);
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={createContentMutation.isPending}
                >
                  {createContentMutation.isPending ? 'در حال ذخیره...' : 'ایجاد محتوا'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ ویرایش محتوا */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش محتوا</DialogTitle>
            <DialogDescription>
              اطلاعات محتوا را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmitEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان فارسی</FormLabel>
                        <FormControl>
                          <Input placeholder="عنوان فارسی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="englishTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان انگلیسی</FormLabel>
                        <FormControl>
                          <Input placeholder="عنوان انگلیسی" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع محتوا</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب نوع محتوا" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="movie">فیلم</SelectItem>
                            <SelectItem value="series">سریال</SelectItem>
                            <SelectItem value="animation">انیمیشن</SelectItem>
                            <SelectItem value="documentary">مستند</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سال تولید</FormLabel>
                          <FormControl>
                            <Input placeholder="سال تولید" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مدت زمان (دقیقه)</FormLabel>
                          <FormControl>
                            <Input placeholder="مدت زمان" {...field} />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            فقط برای فیلم‌ها و مستندها
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="imdbRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>امتیاز IMDb</FormLabel>
                        <FormControl>
                          <Input placeholder="امتیاز IMDb" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hasPersianDubbing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>دوبله فارسی</FormLabel>
                            <FormDescription>
                              آیا این محتوا دوبله فارسی دارد؟
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasPersianSubtitle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>زیرنویس فارسی</FormLabel>
                            <FormDescription>
                              آیا این محتوا زیرنویس فارسی دارد؟
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات محتوا را وارد کنید"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poster"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لینک تصویر پوستر</FormLabel>
                        <FormControl>
                          <Input placeholder="لینک تصویر پوستر" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backdrop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لینک تصویر پس‌زمینه</FormLabel>
                        <FormControl>
                          <Input placeholder="لینک تصویر پس‌زمینه" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ژانرها</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {genresQuery.data?.map((genre: any) => (
                            <Badge
                              key={genre.id}
                              variant={field.value.includes(genre.id.toString()) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => {
                                const currentValue = [...field.value];
                                const index = currentValue.indexOf(genre.id.toString());
                                if (index > -1) {
                                  currentValue.splice(index, 1);
                                } else {
                                  currentValue.push(genre.id.toString());
                                }
                                field.onChange(currentValue);
                              }}
                            >
                              {genre.name}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تگ‌ها</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {tagsQuery.data?.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              variant={field.value.includes(tag.id.toString()) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => {
                                const currentValue = [...field.value];
                                const index = currentValue.indexOf(tag.id.toString());
                                if (index > -1) {
                                  currentValue.splice(index, 1);
                                } else {
                                  currentValue.push(tag.id.toString());
                                }
                                field.onChange(currentValue);
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateContentMutation.isPending}
                >
                  {updateContentMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ حذف محتوا */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف محتوا</DialogTitle>
            <DialogDescription>
              با این کار محتوای انتخاب شده به همراه تمام اطلاعات مرتبط با آن (نظرات، امتیازات و ...) حذف خواهد شد. این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="flex items-center gap-4 py-2">
              {selectedContent.poster && (
                <img 
                  src={selectedContent.poster} 
                  alt={selectedContent.title} 
                  className="w-16 h-24 object-cover rounded-md"
                />
              )}
              <div>
                <h3 className="font-semibold">{selectedContent.title}</h3>
                <p className="text-sm opacity-70">{selectedContent.englishTitle}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {getContentTypeIcon(selectedContent.type)}
                  <span className="text-sm">{getContentTypeName(selectedContent.type)}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{selectedContent.year}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteContentMutation.isPending}
              onClick={() => deleteContentMutation.mutate()}
            >
              {deleteContentMutation.isPending ? 'در حال حذف...' : 'حذف محتوا'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}