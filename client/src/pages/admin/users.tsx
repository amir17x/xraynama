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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Eye, Edit, Trash2, MoreVertical, Search, Users, UserPlus, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminUsers() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    name: '',
    role: 'user',
  });
  
  const pageSize = 10;

  // Parse URL parameters for role filtering
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const roleParam = searchParams.get('role');
  
  // Update selected role from URL parameter
  useState(() => {
    if (roleParam && (roleParam === 'user' || roleParam === 'admin')) {
      setSelectedRole(roleParam);
    }
  });

  // Fetch users with pagination, search, and role filter
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/users', currentPage, searchTerm, selectedRole],
    queryFn: async ({ queryKey }) => {
      const [url, page, search, role] = queryKey;
      let apiUrl = `${url}?page=${page}&limit=${pageSize}`;
      
      if (search) {
        apiUrl += `&search=${encodeURIComponent(search)}`;
      }
      
      if (role) {
        apiUrl += `&role=${role}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('خطا در دریافت لیست کاربران');
      }
      
      return response.json();
    },
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { userId: number; role: 'user' | 'admin' }) => {
      const response = await apiRequest(`/api/admin/users/${userData.userId}`, {
        method: 'PATCH',
        data: {
          role: userData.role,
        }
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'به‌روزرسانی موفق',
        description: 'نقش کاربر با موفقیت به‌روزرسانی شد.',
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowDeleteDialog(false);
      toast({
        title: 'حذف موفق',
        description: 'کاربر با موفقیت حذف شد.',
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

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (userData: { userId: number; data: any }) => {
      const response = await apiRequest(`/api/admin/users/${userData.userId}`, {
        method: 'PATCH',
        data: userData.data
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditDialog(false);
      toast({
        title: 'ویرایش موفق',
        description: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد.',
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

  // Handle role change
  const handleRoleChange = (userId: number, newRole: 'user' | 'admin') => {
    updateUserMutation.mutate({ userId, role: newRole });
  };

  // Handle user delete
  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  // Confirm user delete
  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name || '',
      role: user.role,
    });
    setShowEditDialog(true);
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      editUserMutation.mutate({
        userId: editingUser.id,
        data: editForm,
      });
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle role filter
  const handleRoleFilter = (role: string | null) => {
    setSelectedRole(role);
    setCurrentPage(1); // Reset to first page on filter change
    
    // Update URL with role parameter
    if (role) {
      navigate(`/admin/users?role=${role}`);
    } else {
      navigate('/admin/users');
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

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">مدیریت کاربران</h1>
            <p className="text-gray-400">مدیریت کاربران و دسترسی‌ها</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
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
                    placeholder="جستجو بر اساس نام کاربری یا ایمیل..."
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
                  value={selectedRole || ""}
                  onValueChange={(value) => handleRoleFilter(value === "" ? null : value)}
                >
                  <SelectTrigger className="w-36 bg-dark border-dark-border">
                    <SelectValue placeholder="همه کاربران" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    <SelectItem value="">همه کاربران</SelectItem>
                    <SelectItem value="user">کاربران عادی</SelectItem>
                    <SelectItem value="admin">مدیران</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-dark-card border-dark-border overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">لیست کاربران</CardTitle>
              <div className="text-sm text-gray-400">
                {data?.totalUsers ? `${data.totalUsers} کاربر یافت شد` : 'در حال بارگذاری...'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-dark-border">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>نام کاربری</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead className="text-center">نقش</TableHead>
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
                  ) : data?.users && data.users.length > 0 ? (
                    data.users.map((user: any, index: number) => (
                      <TableRow key={user.id} className="border-dark-border">
                        <TableCell className="font-medium text-center">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name || '-'}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {user.role === 'admin' ? 'مدیر' : 'کاربر عادی'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-dark-card border-dark-border">
                              <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-dark-border" />
                              <DropdownMenuItem 
                                className="flex items-center cursor-pointer" 
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4 ml-2 text-blue-500" />
                                <span>ویرایش</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center cursor-pointer"
                                onClick={() => handleRoleChange(
                                  user.id, 
                                  user.role === 'admin' ? 'user' : 'admin'
                                )}
                              >
                                {user.role === 'admin' ? (
                                  <>
                                    <XCircle className="h-4 w-4 ml-2 text-orange-500" />
                                    <span>لغو دسترسی مدیریت</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                                    <span>ارتقاء به مدیر</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-dark-border" />
                              <DropdownMenuItem 
                                className="flex items-center cursor-pointer text-red-500" 
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 ml-2 text-red-500" />
                                <span>حذف</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        هیچ کاربری یافت نشد
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
                  نمایش {((currentPage - 1) * pageSize) + 1} تا {Math.min(currentPage * pageSize, data.totalUsers)} از {data.totalUsers} کاربر
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

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle>تأیید حذف کاربر</DialogTitle>
            <DialogDescription>
              آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 space-x-reverse">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              تأیید حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>
              اطلاعات کاربر را ویرایش کنید.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="bg-dark border-dark-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-dark border-dark-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">نام</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-dark border-dark-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">نقش</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger id="role" className="bg-dark border-dark-border">
                    <SelectValue placeholder="انتخاب نقش" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    <SelectItem value="user">کاربر عادی</SelectItem>
                    <SelectItem value="admin">مدیر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editUserMutation.isPending}>
                {editUserMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}