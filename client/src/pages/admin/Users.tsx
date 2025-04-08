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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, MoreHorizontal, Edit, Trash, UserX, Shield, User as UserIcon, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns-jalali';

// اسکیما برای فرم ویرایش کاربر
const userEditSchema = z.object({
  username: z.string().min(3, { message: "نام کاربری باید حداقل 3 کاراکتر باشد" }),
  email: z.string().email({ message: "ایمیل نامعتبر است" }),
  name: z.string().min(2, { message: "نام باید حداقل 2 کاراکتر باشد" }),
  role: z.enum(["admin", "user", "blocked"], { message: "نقش نامعتبر است" }),
});

// تابع برای تبدیل تاریخ به فرمت دلخواه
function formatDate(dateString: string | undefined) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
  } catch (error) {
    return dateString;
  }
}

// کامپوننت اصلی مدیریت کاربران
export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // استیت‌ها
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  
  // فرم ویرایش کاربر
  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      role: 'user',
    },
  });
  
  // دریافت لیست کاربران
  const usersQuery = useQuery({
    queryKey: ['/api/admin/users'],
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // میوتیشن برای ویرایش کاربر
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در بروزرسانی کاربر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditDialog(false);
      toast({
        title: "عملیات موفق",
        description: "اطلاعات کاربر با موفقیت بروزرسانی شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در بروزرسانی",
        description: error.message || "خطایی در بروزرسانی اطلاعات کاربر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن برای تغییر وضعیت مسدودی کاربر
  const toggleBlockMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/toggle-block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در تغییر وضعیت کاربر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowBlockDialog(false);
      toast({
        title: "عملیات موفق",
        description: "وضعیت کاربر با موفقیت تغییر کرد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "خطایی در تغییر وضعیت کاربر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // میوتیشن برای حذف کاربر
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'خطا در حذف کاربر');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowDeleteDialog(false);
      toast({
        title: "عملیات موفق",
        description: "کاربر با موفقیت حذف شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در حذف",
        description: error.message || "خطایی در حذف کاربر رخ داد",
        variant: "destructive",
      });
    },
  });
  
  // آماده سازی فرم ویرایش کاربر با اطلاعات کاربر انتخاب شده
  useEffect(() => {
    if (selectedUser && showEditDialog) {
      form.reset({
        username: selectedUser.username,
        email: selectedUser.email,
        name: selectedUser.name || '',
        role: selectedUser.role || 'user',
      });
    }
  }, [selectedUser, showEditDialog, form]);
  
  // تابع برای ویرایش کاربر
  const onSubmitEdit = form.handleSubmit((data) => {
    updateUserMutation.mutate(data);
  });
  
  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (usersQuery.error) {
      toast({
        title: "خطا در دریافت اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.",
        variant: "destructive",
      });
    }
  }, [usersQuery.error, toast]);
  
  // تابع برای نمایش آیکون مناسب برای نقش کاربر
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-green-500" />;
    }
  };
  
  // تابع برای نمایش متن مناسب برای نقش کاربر
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return "مدیر سیستم";
      case 'blocked':
        return "مسدود شده";
      default:
        return "کاربر عادی";
    }
  };
  
  // چک کردن وضعیت بارگذاری
  const isLoading = usersQuery.isLoading;
  
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
            <Users className="h-6 w-6" /> مدیریت کاربران
          </h1>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>لیست کاربران</span>
            <div className="text-sm opacity-70">{!isLoading && `${usersQuery.data?.length || 0} کاربر`}</div>
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
                    <TableHead>نام کاربری</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead>نقش</TableHead>
                    <TableHead>تاریخ ثبت نام</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.data?.map((user: any, index: number) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getRoleIcon(user.role)}
                          <span>{getRoleName(user.role)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                                setSelectedUser(user);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              <span>ویرایش</span>
                            </DropdownMenuItem>
                            {user.username !== 'admin' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowBlockDialog(true);
                                  }}
                                >
                                  {user.role === 'blocked' ? (
                                    <>
                                      <UserIcon className="h-4 w-4 mr-2" />
                                      <span>رفع مسدودیت</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      <span>مسدود کردن</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-500 hover:text-red-500"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* دیالوگ ویرایش کاربر */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>
              ویرایش اطلاعات و سطح دسترسی کاربر
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmitEdit} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="نام کاربری" 
                        {...field} 
                        disabled={selectedUser?.username === 'admin'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input placeholder="ایمیل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کامل</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نقش کاربر</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={selectedUser?.username === 'admin'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب نقش کاربر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">مدیر سیستم</SelectItem>
                        <SelectItem value="user">کاربر عادی</SelectItem>
                        <SelectItem value="blocked">مسدود شده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ مسدود کردن/رفع مسدودی کاربر */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role === 'blocked' ? 'رفع مسدودیت کاربر' : 'مسدود کردن کاربر'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.role === 'blocked' 
                ? 'آیا مطمئن هستید که می‌خواهید این کاربر را از حالت مسدود خارج کنید؟'
                : 'این کاربر دیگر قادر به ورود به سیستم نخواهد بود. آیا مطمئن هستید؟'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBlockDialog(false)}
            >
              انصراف
            </Button>
            <Button 
              type="button" 
              disabled={toggleBlockMutation.isPending}
              variant={selectedUser?.role === 'blocked' ? 'default' : 'destructive'}
              onClick={() => toggleBlockMutation.mutate()}
            >
              {toggleBlockMutation.isPending 
                ? 'در حال انجام...' 
                : (selectedUser?.role === 'blocked' ? 'رفع مسدودیت' : 'مسدود کردن')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* دیالوگ حذف کاربر */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف کاربر</DialogTitle>
            <DialogDescription>
              با این کار تمام اطلاعات کاربر حذف خواهد شد. این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
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
              disabled={deleteUserMutation.isPending}
              onClick={() => deleteUserMutation.mutate()}
            >
              {deleteUserMutation.isPending ? 'در حال حذف...' : 'حذف کاربر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}