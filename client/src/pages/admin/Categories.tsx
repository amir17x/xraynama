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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tag,
  MoreHorizontal,
  Edit,
  Trash,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// اسکیما برای فرم ایجاد/ویرایش ژانر
const genreSchema = z.object({
  name: z.string().min(2, { message: "نام ژانر باید حداقل 2 کاراکتر باشد" }),
  slug: z.string().min(2, { message: "نامک ژانر باید حداقل 2 کاراکتر باشد" })
    .regex(/^[a-z0-9-]+$/, { message: "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد" }),
});

// اسکیما برای فرم ایجاد/ویرایش تگ
const tagSchema = z.object({
  name: z.string().min(2, { message: "نام تگ باید حداقل 2 کاراکتر باشد" }),
  slug: z.string().min(2, { message: "نامک تگ باید حداقل 2 کاراکتر باشد" })
    .regex(/^[a-z0-9-]+$/, { message: "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد" }),
});

// تابع تبدیل نام فارسی به نامک انگلیسی
const generateSlug = (text: string) => {
  // توابع پیچیده تبدیل متن فارسی به انگلیسی اینجا قرار می‌گیرد
  // این فقط یک نمونه ساده است
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// کامپوننت اصلی مدیریت دسته‌بندی‌ها و برچسب‌ها
export default function AdminCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // استیت‌ها
  const [activeTab, setActiveTab] = useState("genres");
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [showCreateGenreDialog, setShowCreateGenreDialog] = useState(false);
  const [showEditGenreDialog, setShowEditGenreDialog] = useState(false);
  const [showDeleteGenreDialog, setShowDeleteGenreDialog] = useState(false);
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [showEditTagDialog, setShowEditTagDialog] = useState(false);
  const [showDeleteTagDialog, setShowDeleteTagDialog] = useState(false);
  
  // فرم‌ها
  const genreForm = useForm<z.infer<typeof genreSchema>>({
    resolver: zodResolver(genreSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });
  
  const tagForm = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });
  
  // کوئری‌ها
  const genresQuery = useQuery({
    queryKey: ['/api/admin/genres'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const tagsQuery = useQuery({
    queryKey: ['/api/admin/tags'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // میوتیشن‌ها برای ژانرها
  const createGenreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ایجاد ژانر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genres'] });
      queryClient.invalidateQueries({ queryKey: ['/api/genres'] });
      setShowCreateGenreDialog(false);
      genreForm.reset();
      toast({
        title: "عملیات موفق",
        description: "ژانر جدید با موفقیت ایجاد شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ایجاد ژانر",
        description: error.message || "خطایی در ایجاد ژانر جدید رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const updateGenreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/genres/${selectedGenre.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در بروزرسانی ژانر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genres'] });
      queryClient.invalidateQueries({ queryKey: ['/api/genres'] });
      setShowEditGenreDialog(false);
      toast({
        title: "عملیات موفق",
        description: "ژانر با موفقیت بروزرسانی شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در بروزرسانی",
        description: error.message || "خطایی در بروزرسانی ژانر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const deleteGenreMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/genres/${selectedGenre.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف ژانر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/genres'] });
      queryClient.invalidateQueries({ queryKey: ['/api/genres'] });
      setShowDeleteGenreDialog(false);
      toast({
        title: "عملیات موفق",
        description: "ژانر با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف",
        description: error.message || "خطایی در حذف ژانر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن‌ها برای تگ‌ها
  const createTagMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در ایجاد تگ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setShowCreateTagDialog(false);
      tagForm.reset();
      toast({
        title: "عملیات موفق",
        description: "تگ جدید با موفقیت ایجاد شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ایجاد تگ",
        description: error.message || "خطایی در ایجاد تگ جدید رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const updateTagMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در بروزرسانی تگ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setShowEditTagDialog(false);
      toast({
        title: "عملیات موفق",
        description: "تگ با موفقیت بروزرسانی شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در بروزرسانی",
        description: error.message || "خطایی در بروزرسانی تگ رخ داد",
        variant: "destructive",
      });
    },
  });
  
  const deleteTagMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف تگ');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setShowDeleteTagDialog(false);
      toast({
        title: "عملیات موفق",
        description: "تگ با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف",
        description: error.message || "خطایی در حذف تگ رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // افکت‌ها
  
  // آماده‌سازی فرم ویرایش ژانر
  useEffect(() => {
    if (selectedGenre && showEditGenreDialog) {
      genreForm.reset({
        name: selectedGenre.name,
        slug: selectedGenre.slug,
      });
    }
  }, [selectedGenre, showEditGenreDialog, genreForm]);
  
  // آماده‌سازی فرم ویرایش تگ
  useEffect(() => {
    if (selectedTag && showEditTagDialog) {
      tagForm.reset({
        name: selectedTag.name,
        slug: selectedTag.slug,
      });
    }
  }, [selectedTag, showEditTagDialog, tagForm]);
  
  // واچ کردن تغییرات فیلد نام ژانر برای تولید خودکار نامک
  useEffect(() => {
    const subscription = genreForm.watch((value, { name }) => {
      if (name === 'name' && value.name && !genreForm.getValues('slug')) {
        genreForm.setValue('slug', generateSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [genreForm]);
  
  // واچ کردن تغییرات فیلد نام تگ برای تولید خودکار نامک
  useEffect(() => {
    const subscription = tagForm.watch((value, { name }) => {
      if (name === 'name' && value.name && !tagForm.getValues('slug')) {
        tagForm.setValue('slug', generateSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [tagForm]);
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (genresQuery.error) {
      toast({
        title: "خطا در دریافت ژانرها",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
    
    if (tagsQuery.error) {
      toast({
        title: "خطا در دریافت تگ‌ها",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [genresQuery.error, tagsQuery.error, toast]);
  
  // توابع فرم
  const onSubmitCreateGenre = genreForm.handleSubmit((data) => {
    createGenreMutation.mutate(data);
  });
  
  const onSubmitEditGenre = genreForm.handleSubmit((data) => {
    updateGenreMutation.mutate(data);
  });
  
  const onSubmitCreateTag = tagForm.handleSubmit((data) => {
    createTagMutation.mutate(data);
  });
  
  const onSubmitEditTag = tagForm.handleSubmit((data) => {
    updateTagMutation.mutate(data);
  });
  
  // چک کردن وضعیت بارگذاری
  const isGenresLoading = genresQuery.isLoading;
  const isTagsLoading = tagsQuery.isLoading;
  
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
            <Tag className="h-6 w-6" /> دسته‌بندی و برچسب‌ها
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="genres">ژانرها</TabsTrigger>
          <TabsTrigger value="tags">برچسب‌ها</TabsTrigger>
        </TabsList>
        
        <TabsContent value="genres" className="pt-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت ژانرها</span>
                <Button
                  onClick={() => {
                    genreForm.reset({
                      name: '',
                      slug: '',
                    });
                    setShowCreateGenreDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>افزودن ژانر جدید</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenresLoading ? (
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
                        <TableHead>نام ژانر</TableHead>
                        <TableHead>نامک</TableHead>
                        <TableHead>تعداد محتوا</TableHead>
                        <TableHead className="text-left">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {genresQuery.data?.map((genre: any, index: number) => (
                        <TableRow key={genre.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{genre.name}</TableCell>
                          <TableCell className="font-mono text-sm">{genre.slug}</TableCell>
                          <TableCell>{genre.contentCount || 0}</TableCell>
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
                                    setSelectedGenre(genre);
                                    setShowEditGenreDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>ویرایش</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedGenre(genre);
                                    setShowDeleteGenreDialog(true);
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
        </TabsContent>
        
        <TabsContent value="tags" className="pt-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مدیریت برچسب‌ها</span>
                <Button
                  onClick={() => {
                    tagForm.reset({
                      name: '',
                      slug: '',
                    });
                    setShowCreateTagDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>افزودن برچسب جدید</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTagsLoading ? (
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
                        <TableHead>نام برچسب</TableHead>
                        <TableHead>نامک</TableHead>
                        <TableHead>تعداد محتوا</TableHead>
                        <TableHead className="text-left">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagsQuery.data?.map((tag: any, index: number) => (
                        <TableRow key={tag.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{tag.name}</TableCell>
                          <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
                          <TableCell>{tag.contentCount || 0}</TableCell>
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
                                    setSelectedTag(tag);
                                    setShowEditTagDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>ویرایش</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTag(tag);
                                    setShowDeleteTagDialog(true);
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
        </TabsContent>
      </Tabs>
      
      {/* دیالوگ ایجاد ژانر جدید */}
      <Dialog open={showCreateGenreDialog} onOpenChange={setShowCreateGenreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>افزودن ژانر جدید</DialogTitle>
            <DialogDescription>
              اطلاعات ژانر جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...genreForm}>
            <form onSubmit={onSubmitCreateGenre} className="space-y-4">
              <FormField
                control={genreForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام ژانر</FormLabel>
                    <FormControl>
                      <Input placeholder="نام ژانر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={genreForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نامک (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="نامک" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateGenreDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGenreMutation.isPending}
                >
                  {createGenreMutation.isPending ? 'در حال ذخیره...' : 'ایجاد ژانر'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ ویرایش ژانر */}
      <Dialog open={showEditGenreDialog} onOpenChange={setShowEditGenreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش ژانر</DialogTitle>
            <DialogDescription>
              اطلاعات ژانر را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...genreForm}>
            <form onSubmit={onSubmitEditGenre} className="space-y-4">
              <FormField
                control={genreForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام ژانر</FormLabel>
                    <FormControl>
                      <Input placeholder="نام ژانر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={genreForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نامک (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="نامک" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditGenreDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateGenreMutation.isPending}
                >
                  {updateGenreMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ حذف ژانر */}
      <Dialog open={showDeleteGenreDialog} onOpenChange={setShowDeleteGenreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف ژانر</DialogTitle>
            <DialogDescription>
              آیا از حذف این ژانر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {selectedGenre && (
            <div className="py-2">
              <h3 className="font-semibold">{selectedGenre.name}</h3>
              <p className="text-sm opacity-70 font-mono mt-1">{selectedGenre.slug}</p>
              {selectedGenre.contentCount > 0 && (
                <p className="text-amber-500 mt-2 text-sm">
                  این ژانر در {selectedGenre.contentCount} محتوا استفاده شده است.
                  با حذف ژانر، ارتباط آن با محتواها نیز حذف خواهد شد.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteGenreDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteGenreMutation.isPending}
              onClick={() => deleteGenreMutation.mutate()}
            >
              {deleteGenreMutation.isPending ? 'در حال حذف...' : 'حذف ژانر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ ایجاد تگ جدید */}
      <Dialog open={showCreateTagDialog} onOpenChange={setShowCreateTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>افزودن برچسب جدید</DialogTitle>
            <DialogDescription>
              اطلاعات برچسب جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...tagForm}>
            <form onSubmit={onSubmitCreateTag} className="space-y-4">
              <FormField
                control={tagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام برچسب</FormLabel>
                    <FormControl>
                      <Input placeholder="نام برچسب" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tagForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نامک (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="نامک" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTagDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTagMutation.isPending}
                >
                  {createTagMutation.isPending ? 'در حال ذخیره...' : 'ایجاد برچسب'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ ویرایش تگ */}
      <Dialog open={showEditTagDialog} onOpenChange={setShowEditTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش برچسب</DialogTitle>
            <DialogDescription>
              اطلاعات برچسب را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...tagForm}>
            <form onSubmit={onSubmitEditTag} className="space-y-4">
              <FormField
                control={tagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام برچسب</FormLabel>
                    <FormControl>
                      <Input placeholder="نام برچسب" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tagForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نامک (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="نامک" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditTagDialog(false)}
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTagMutation.isPending}
                >
                  {updateTagMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* دیالوگ حذف تگ */}
      <Dialog open={showDeleteTagDialog} onOpenChange={setShowDeleteTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف برچسب</DialogTitle>
            <DialogDescription>
              آیا از حذف این برچسب اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="py-2">
              <h3 className="font-semibold">{selectedTag.name}</h3>
              <p className="text-sm opacity-70 font-mono mt-1">{selectedTag.slug}</p>
              {selectedTag.contentCount > 0 && (
                <p className="text-amber-500 mt-2 text-sm">
                  این برچسب در {selectedTag.contentCount} محتوا استفاده شده است.
                  با حذف برچسب، ارتباط آن با محتواها نیز حذف خواهد شد.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteTagDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deleteTagMutation.isPending}
              onClick={() => deleteTagMutation.mutate()}
            >
              {deleteTagMutation.isPending ? 'در حال حذف...' : 'حذف برچسب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}