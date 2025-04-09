import React, { useState, useRef } from 'react';
import { BellRing, Info, AlertCircle, MessageCircle, ArrowLeftCircle, Bell, Clock as ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

type Notification = {
  id: number;
  title: string;
  text: string;
  date: string;
  isNew: boolean;
  icon: 'info' | 'warning' | 'message';
};

// داده‌های نمونه برای اعلان‌ها
const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: 'پخش آنلاین',
    text: 'جهت پخش مروگر Chrome را به آخرین نسخه آپدیت نمایید.',
    date: '2 ماه پیش',
    isNew: true,
    icon: 'info',
  },
  {
    id: 2,
    title: 'پخش آنلاین',
    text: 'پخش آنلاین تنها با مرورگر Chrome امکان پذیر است.',
    date: '2 ماه پیش',
    isNew: false,
    icon: 'warning',
  },
  {
    id: 3,
    title: 'انتقاد و پیشنهاد',
    text: 'نظر، انتقاد و پیشنهادات خود را از طریق تیکت برای ما ارسال نمو...',
    date: '2 ماه پیش',
    isNew: false,
    icon: 'message',
  },
];

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const hasUnreadNotifications = notifications.some(n => n.isNew);

  // رندر آیکون مناسب برای هر نوع اعلان
  const renderNotificationIcon = (icon: string) => {
    switch (icon) {
      case 'info':
        return <Info className="h-3.5 w-3.5 text-blue-400" />;
      case 'warning':
        return <AlertCircle className="h-3.5 w-3.5 text-amber-400" />;
      case 'message':
        return <MessageCircle className="h-3.5 w-3.5 text-green-400" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  const handleNotificationClick = (id: number) => {
    // در یک پیاده‌سازی واقعی، این مورد به API درخواست ارسال می‌کند
    // برای آزمایش، وضعیت isNew را تغییر می‌دهیم
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, isNew: false } : notif
      )
    );
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 flex items-center justify-center overflow-hidden glassmorphic-icon"
        >
          <BellRing className={`h-5 w-5 ${hasUnreadNotifications ? 'text-[#00BFFF]' : 'text-white'} transition-colors duration-300`} />
          
          {/* نشانگر اعلان جدید با انیمیشن پالس */}
          {hasUnreadNotifications && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full shadow-md animate-pulse">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
            </span>
          )}
        </Button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className="z-[200] w-[280px] rounded-md shadow-lg bg-[#00142c]/95 backdrop-blur-xl border border-[#00BFFF]/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={8}
          align="end"
          style={{
            boxShadow: '0 5px 20px -5px rgba(0, 191, 255, 0.2), 0 0 10px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* هدر */}
          <div className="font-bold text-xs border-b border-[#00BFFF]/20 p-2 flex items-center bg-[#00142c]/95 sticky top-0">
            <BellRing className="h-3.5 w-3.5 ml-2 text-[#00BFFF]" />
            <span className="text-white">اعلانات</span>
            {hasUnreadNotifications && (
              <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-red-500/20 text-[10px] font-normal text-red-400">
                جدید
              </span>
            )}
          </div>
          
          {/* محتوا */}
          <div className="max-h-[225px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Bell className="h-8 w-8 text-[#00BFFF]/30 mb-2" />
                <p className="text-xs text-gray-400">اعلان جدیدی ندارید</p>
              </div>
            ) : (
              <div className="p-1">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "border-b border-[#00BFFF]/10 pb-1.5 mb-1.5 hover:bg-[#00BFFF]/10 p-1.5 rounded-sm",
                      "transition-all duration-300 cursor-pointer relative overflow-hidden",
                      notification.isNew && "bg-[#00BFFF]/5 border-r-2 border-r-[#00BFFF]"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="ml-1.5 p-1 rounded-full bg-[#00BFFF]/10 flex-shrink-0">
                        {renderNotificationIcon(notification.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-[11px] text-white truncate max-w-[180px]">
                            {notification.title}
                            {notification.isNew && (
                              <span className="mr-1 px-1 py-0.5 text-[8px] bg-red-500/20 text-red-400 rounded-full">
                                جدید
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-300 mt-0.5 leading-4 line-clamp-2">{notification.text}</p>
                        <div className="text-[8px] text-gray-400 mt-1 flex items-center">
                          <ClockIcon className="h-2 w-2 ml-0.5" />
                          {notification.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* فوتر */}
          <div className="text-center border-t border-[#00BFFF]/20 p-1.5 bg-[#00142c]/95 sticky bottom-0">
            <Button 
              variant="link" 
              size="sm" 
              className="text-[#00BFFF] text-[10px] hover:text-[#00BFFF]/80 transition-all duration-300 h-6 px-2"
            >
              مشاهده همه اعلانات
              <ArrowLeftCircle className="mr-1 h-2.5 w-2.5" />
            </Button>
          </div>
          
          <Popover.Arrow className="fill-[#00142c]" width={12} height={7} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}