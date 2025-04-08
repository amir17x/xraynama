import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";

export default function ToastTestPage() {
  const { toast } = useToast();

  // تابع برای نمایش پیام موفقیت
  const showSuccessToast = () => {
    toast({
      variant: "success",
      title: "عملیات موفقیت‌آمیز",
      description: "عملیات مورد نظر با موفقیت انجام شد.",
    });
  };

  // تابع برای نمایش پیام خطا
  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: "خطا در انجام عملیات",
      description: "متأسفانه خطایی در انجام عملیات رخ داده است. لطفاً دوباره تلاش کنید.",
    });
  };

  // تابع برای نمایش پیام هشدار
  const showWarningToast = () => {
    toast({
      variant: "warning",
      title: "هشدار",
      description: "توجه داشته باشید که این عملیات قابل بازگشت نیست.",
    });
  };

  // تابع برای نمایش پیام اطلاع‌رسانی
  const showInfoToast = () => {
    toast({
      variant: "info",
      title: "اطلاعات",
      description: "به‌روزرسانی‌های جدید در دسترس است.",
    });
  };

  // تابع برای نمایش پیام با دکمه اقدام
  const showToastWithAction = () => {
    toast({
      title: "تأیید حساب کاربری",
      description: "برای تأیید حساب کاربری خود لطفاً بر روی دکمه کلیک کنید.",
      action: (
        <Button variant="outline" size="sm" onClick={() => alert("اقدام انجام شد!")}>
          تأیید
        </Button>
      ),
    });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 min-h-[calc(100vh-200px)] relative">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2/3 h-1/2 top-0 left-[15%] bg-[#00BFFF]/10 rounded-full blur-[150px] opacity-60"></div>
          <div className="absolute w-1/3 h-1/3 bottom-[10%] right-[10%] bg-[#00BFFF]/15 rounded-full blur-[100px] opacity-60"></div>
        </div>
        
        <div className="content-section-glass mx-auto max-w-lg relative z-10">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">تست نمایش پیام‌های خطا</h1>
          
          <div className="grid gap-4">
            <Button 
              onClick={showSuccessToast}
              className="bg-[#4CAF50]/20 border border-[#4CAF50]/30 hover:bg-[#4CAF50]/30 text-white"
            >
              نمایش پیام موفقیت
            </Button>
            
            <Button 
              onClick={showErrorToast}
              className="bg-[#FF5252]/20 border border-[#FF5252]/30 hover:bg-[#FF5252]/30 text-white"
            >
              نمایش پیام خطا
            </Button>
            
            <Button 
              onClick={showWarningToast}
              className="bg-[#FFC107]/20 border border-[#FFC107]/30 hover:bg-[#FFC107]/30 text-white"
            >
              نمایش پیام هشدار
            </Button>
            
            <Button 
              onClick={showInfoToast}
              className="bg-[#2196F3]/20 border border-[#2196F3]/30 hover:bg-[#2196F3]/30 text-white"
            >
              نمایش پیام اطلاع‌رسانی
            </Button>
            
            <Button 
              onClick={showToastWithAction}
              className="bg-[#00BFFF]/20 border border-[#00BFFF]/30 hover:bg-[#00BFFF]/30 text-white"
            >
              نمایش پیام با دکمه اقدام
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}