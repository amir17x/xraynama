import { useState } from 'react';
import { Link } from 'wouter';
import { Users, Copy, Film, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function WatchPartyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [partyCode, setPartyCode] = useState('');
  
  const handleCreateParty = () => {
    if (!user) {
      toast({
        title: "ورود لازم است",
        description: "برای ایجاد اتاق تماشا ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive"
      });
      return;
    }
    
    // ایجاد یک کد تصادفی 6 رقمی
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPartyCode(randomCode);
    
    toast({
      title: "اتاق تماشا ایجاد شد",
      description: `کد اتاق: ${randomCode}`,
    });
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(partyCode);
    toast({
      title: "کپی شد",
      description: "کد اتاق در کلیپبورد کپی شد.",
    });
  };
  
  const handleJoinParty = () => {
    if (!user) {
      toast({
        title: "ورود لازم است",
        description: "برای پیوستن به اتاق تماشا ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive"
      });
      return;
    }
    
    if (partyCode.length < 6) {
      toast({
        title: "خطا",
        description: "کد اتاق باید 6 رقمی باشد.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "اتصال به اتاق",
      description: `در حال اتصال به اتاق ${partyCode}...`,
    });
    
    // در اینجا منطق اتصال به اتاق واقعی پیاده‌سازی خواهد شد
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">تماشای گروهی</h1>
          <p className="text-muted-foreground mb-6">
            با استفاده از امکان تماشای گروهی، می‌توانید به همراه دوستان خود به صورت همزمان فیلم و سریال تماشا کنید.
          </p>
          
          {!user && (
            <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
              <AlertCircle className="h-4 w-4 ml-2" />
              <AlertTitle>ورود لازم است</AlertTitle>
              <AlertDescription>
                برای استفاده از امکان تماشای گروهی، ابتدا باید 
                <Link href="/auth" className="text-primary hover:underline mr-1">وارد حساب کاربری</Link>
                خود شوید.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-effect rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="text-primary h-6 w-6 ml-2" />
              <h2 className="text-xl font-semibold">ایجاد اتاق جدید</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              یک اتاق تماشای گروهی جدید ایجاد کنید و کد آن را با دوستان خود به اشتراک بگذارید.
            </p>
            
            <Button 
              className="w-full mb-4 flex items-center justify-center"
              onClick={handleCreateParty}
              disabled={!user}
            >
              <Users className="ml-2 h-5 w-5" />
              ایجاد اتاق جدید
            </Button>
            
            {partyCode && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">کد اتاق:</p>
                <div className="flex">
                  <Input 
                    value={partyCode} 
                    readOnly 
                    className="text-center text-lg font-mono font-bold"
                  />
                  <Button variant="outline" className="ml-2" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-effect rounded-lg p-6">
            <div className="flex items-center mb-4">
              <LogIn className="text-primary h-6 w-6 ml-2" />
              <h2 className="text-xl font-semibold">پیوستن به اتاق</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              با استفاده از کد اتاق که از دوستان خود دریافت کرده‌اید، به اتاق تماشای گروهی بپیوندید.
            </p>
            
            <div className="mb-4">
              <Input 
                placeholder="کد اتاق را وارد کنید..." 
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
            
            <Button 
              className="w-full flex items-center justify-center"
              onClick={handleJoinParty}
              disabled={!user || partyCode.length < 6}
            >
              <LogIn className="ml-2 h-5 w-5" />
              پیوستن به اتاق
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">نحوه استفاده از تماشای گروهی</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect p-5 rounded-lg text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">۱</span>
              </div>
              <h3 className="font-semibold mb-2">ایجاد اتاق</h3>
              <p className="text-muted-foreground text-sm">
                یک اتاق تماشای گروهی ایجاد کنید یا با کد اتاق به یک اتاق موجود بپیوندید.
              </p>
            </div>
            
            <div className="glass-effect p-5 rounded-lg text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">۲</span>
              </div>
              <h3 className="font-semibold mb-2">انتخاب محتوا</h3>
              <p className="text-muted-foreground text-sm">
                فیلم یا سریال مورد نظر خود را برای تماشای گروهی انتخاب کنید.
              </p>
            </div>
            
            <div className="glass-effect p-5 rounded-lg text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">۳</span>
              </div>
              <h3 className="font-semibold mb-2">تماشای همزمان</h3>
              <p className="text-muted-foreground text-sm">
                همراه با دوستان خود به صورت همزمان به تماشای محتوای انتخابی بپردازید.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/category/movie">
            <Button className="flex items-center">
              <Film className="ml-2 h-5 w-5" />
              مشاهده فیلم‌های محبوب
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}