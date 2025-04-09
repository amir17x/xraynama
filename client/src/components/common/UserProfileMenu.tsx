import React from 'react';
import { UserCircle, LogOut, User, Heart, List, Clock, Settings, Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

type UserProfileProps = {
  user: {
    id: number | string;
    username: string;
    name?: string | null;
    avatar?: string | null;
    role?: string | "user" | "admin";
    email?: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } | null;
};

export function UserProfileMenu({ user }: UserProfileProps) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/user'] });
      navigate('/');
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <Button asChild variant="default" size="sm" className="bg-blue-700 hover:bg-blue-600 text-white">
        <Link href="/auth/login">ورود / ثبت‌نام</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="relative h-8 flex items-center gap-2 px-2 glassmorphic-icon">
          <Avatar className="w-6 h-6 border border-[#00BFFF]/80">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-[#00142c] text-[#00BFFF] text-xs">
              {user.name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-white hidden md:inline max-w-[100px] truncate">
            {user.name || user.username}
          </span>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-[200] min-w-[220px] rounded-md shadow-lg bg-[#00142c]/95 backdrop-blur-xl border border-[#00BFFF]/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={8}
          align="end"
          style={{
            boxShadow: '0 5px 20px -5px rgba(0, 191, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* هدر پروفایل */}
          <div className="p-3 flex items-center border-b border-[#00BFFF]/20">
            <Avatar className="w-10 h-10 mr-3 border-2 border-[#00BFFF]/50 shadow-glow-sm shadow-[#00BFFF]/20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-[#00142c] text-[#00BFFF] font-semibold text-lg">
                {user.name?.charAt(0) || user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-white truncate">{user.name || user.username}</div>
              <div className="text-xs text-[#00BFFF] truncate flex items-center mt-1">
                {user?.role === 'admin' ? (
                  <>
                    <ShieldAlert className="h-3 w-3 ml-1" />
                    <span>مدیر سیستم</span>
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 ml-1" />
                    <span>کاربر</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* آپشن‌های منو */}
          <div className="p-1.5">
            <MenuItem href="/profile" icon={<User className="h-3.5 w-3.5 text-[#00BFFF]" />} label="پروفایل" />
            <MenuItem href="/profile?tab=favorites" icon={<Heart className="h-3.5 w-3.5 text-[#00BFFF]" />} label="علاقه‌مندی‌ها" />
            <MenuItem href="/profile?tab=playlists" icon={<List className="h-3.5 w-3.5 text-[#00BFFF]" />} label="پلی‌لیست‌ها" />
            <MenuItem href="/profile?tab=history" icon={<Clock className="h-3.5 w-3.5 text-[#00BFFF]" />} label="تاریخچه تماشا" />
            <MenuItem href="/profile?tab=settings" icon={<Settings className="h-3.5 w-3.5 text-[#00BFFF]" />} label="تنظیمات" />
            
            <DropdownMenu.Separator className="h-px bg-[#00BFFF]/10 my-1" />
            
            {user.role === 'admin' && (
              <>
                <MenuItem href="/admin" icon={<Shield className="h-3.5 w-3.5 text-green-400" />} label="پنل مدیریت" />
                <DropdownMenu.Separator className="h-px bg-[#00BFFF]/10 my-1" />
              </>
            )}
            
            <DropdownMenu.Item 
              className="text-xs rounded px-2 py-1.5 flex items-center cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 focus:outline-none"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-3.5 w-3.5 text-red-400" />
              <span className="text-red-400">خروج</span>
            </DropdownMenu.Item>
          </div>
          
          <DropdownMenu.Arrow className="fill-[#00142c]" width={12} height={7} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// کامپوننت برای هر آیتم منو
function MenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <DropdownMenu.Item asChild className="focus:outline-none">
      <Link 
        href={href} 
        className="text-xs rounded px-2 py-1.5 flex items-center hover:bg-[#00BFFF]/10 focus:bg-[#00BFFF]/20 focus:outline-none cursor-pointer text-white"
      >
        <span className="ml-2">{icon}</span>
        {label}
      </Link>
    </DropdownMenu.Item>
  );
}