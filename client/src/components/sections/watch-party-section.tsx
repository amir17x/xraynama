import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  List, 
  ArrowLeft, 
  PlayCircle, 
  FileText 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WatchPartySection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [partyCode, setPartyCode] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  
  // Create watch party mutation
  const createWatchPartyMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, the content ID would come from props or selected content
      const contentId = 1; // Default to first content for example
      const res = await apiRequest("POST", "/api/watch-parties", { contentId });
      return await res.json();
    },
    onSuccess: (data) => {
      navigate(`/watch-party/${data.partyCode}`);
      toast({
        title: "تماشای گروهی ایجاد شد",
        description: `کد تماشای گروهی: ${data.partyCode}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ایجاد تماشای گروهی",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Join watch party mutation
  const joinWatchPartyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", `/api/watch-parties/${code}/join`);
      return await res.json();
    },
    onSuccess: () => {
      navigate(`/watch-party/${partyCode}`);
      setIsJoinDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در پیوستن به تماشای گروهی",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCreateWatchParty = () => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای ایجاد تماشای گروهی نیاز به حساب کاربری است",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    createWatchPartyMutation.mutate();
  };
  
  const handleJoinWatchParty = () => {
    if (!user) {
      toast({
        title: "ابتدا وارد شوید",
        description: "برای پیوستن به تماشای گروهی نیاز به حساب کاربری است",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!partyCode) {
      toast({
        title: "کد وارد نشده",
        description: "لطفاً کد تماشای گروهی را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    
    joinWatchPartyMutation.mutate(partyCode);
  };
  
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watch Party Card */}
        <div className="mica-effect rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center ml-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">تماشای گروهی</h2>
          </div>
          
          <p className="text-text-secondary mb-4">
            فیلم‌ها و سریال‌های مورد علاقه‌تون رو با دوستانتون به صورت همزمان تماشا کنید! کافیه یک اتاق تماشای گروهی بسازید و لینکش رو با دوستانتون به اشتراک بگذارید.
          </p>
          
          <div className="space-y-2">
            <Button
              className="btn-primary w-full rounded-lg px-4 py-3 flex items-center justify-center font-medium"
              onClick={handleCreateWatchParty}
              disabled={createWatchPartyMutation.isPending}
            >
              {createWatchPartyMutation.isPending ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
              ) : (
                <Plus className="h-5 w-5 ml-2" />
              )}
              ساخت اتاق جدید
            </Button>
            
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-dark-card hover:bg-dark-border transition-colors duration-200 w-full rounded-lg px-4 py-3 flex items-center justify-center font-medium"
                >
                  پیوستن به اتاق
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-card border-dark-border">
                <DialogHeader>
                  <DialogTitle className="text-xl mb-4">پیوستن به تماشای گروهی</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    کد تماشای گروهی را وارد کنید تا به دوستان خود ملحق شوید.
                  </p>
                  
                  <Input
                    value={partyCode}
                    onChange={(e) => setPartyCode(e.target.value)}
                    placeholder="کد تماشای گروهی (مثال: Abc123)"
                    className="bg-dark text-white"
                  />
                  
                  <Button
                    className="w-full"
                    onClick={handleJoinWatchParty}
                    disabled={joinWatchPartyMutation.isPending || !partyCode}
                  >
                    {joinWatchPartyMutation.isPending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    ) : (
                      <ArrowLeft className="h-5 w-5 ml-2" />
                    )}
                    پیوستن به اتاق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Playlist Card */}
        <div className="mica-effect rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-purple flex items-center justify-center ml-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">لیست شخصی بسازید</h2>
          </div>
          
          <p className="text-text-secondary mb-4">
            با ساخت پلی‌لیست‌های شخصی، محتواهای مورد علاقه‌تون رو سازماندهی کنید و اونها رو با دوستاتون به اشتراک بگذارید.
          </p>
          
          <div className="space-y-2">
            <Button
              className="bg-accent-purple hover:bg-accent-purple/90 transition-colors duration-200 w-full rounded-lg px-4 py-3 flex items-center justify-center font-medium"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "ابتدا وارد شوید",
                    description: "برای ساخت پلی‌لیست نیاز به حساب کاربری است",
                    variant: "destructive",
                  });
                  navigate("/auth");
                  return;
                }
                navigate("/profile?tab=playlists&action=create");
              }}
            >
              <Plus className="h-5 w-5 ml-2" />
              ساخت پلی‌لیست جدید
            </Button>
            
            <Button
              variant="outline"
              className="bg-dark-card hover:bg-dark-border transition-colors duration-200 w-full rounded-lg px-4 py-3 flex items-center justify-center font-medium"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "ابتدا وارد شوید",
                    description: "برای مشاهده پلی‌لیست‌ها نیاز به حساب کاربری است",
                    variant: "destructive",
                  });
                  navigate("/auth");
                  return;
                }
                navigate("/profile?tab=playlists");
              }}
            >
              <List className="h-5 w-5 ml-2" />
              مشاهده پلی‌لیست‌های من
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WatchPartySection;
