import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Medal, TrendingUp, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  points: number;
  badges: string[];
}

// Badge data with title and color
const badgeInfo: Record<string, { title: string, color: string }> = {
  active_user: { title: "کاربر فعال", color: "bg-accent-purple" },
  critic: { title: "منتقد حرفه‌ای", color: "bg-accent-orange" },
  animation_fan: { title: "فن انیمیشن", color: "bg-accent-green" },
  series_fan: { title: "فن سریال", color: "bg-accent-blue" }
};

const LeaderboardSection: React.FC = () => {
  const { data: users, isLoading, error } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      // In a full implementation, this would fetch from the API
      // For now, we'll return mock data that follows the expected structure
      return [
        { id: 1, username: "سینا_مووی", displayName: "سینا", avatar: null, points: 1245, badges: ["critic", "active_user", "animation_fan"] },
        { id: 2, username: "مهدی_فیلم‌بین", displayName: "مهدی", avatar: null, points: 985, badges: ["active_user", "series_fan"] },
        { id: 3, username: "نگین_سینما", displayName: "نگین", avatar: null, points: 872, badges: ["critic", "active_user"] },
        { id: 4, username: "امیر_انیمه", displayName: "امیر", avatar: null, points: 723, badges: ["animation_fan"] },
        { id: 5, username: "رضا_سریال‌بین", displayName: "رضا", avatar: null, points: 657, badges: ["series_fan", "active_user"] }
      ];
    }
  });

  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          برترین کاربران
        </h2>
        
        <Link href="/leaderboard">
          <a className="text-primary hover:text-primary-light transition-colors duration-200 text-sm font-medium flex items-center gap-1">
            <span>مشاهده همه</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </Link>
      </div>
      
      <div className="mica-effect rounded-xl overflow-hidden">
        <div className="p-4 bg-dark-card/50 border-b border-dark-border">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-text-secondary">
            <div className="col-span-1 text-center">رتبه</div>
            <div className="col-span-7 md:col-span-4">کاربر</div>
            <div className="hidden md:block md:col-span-3">مدال‌ها</div>
            <div className="col-span-4">امتیاز</div>
          </div>
        </div>
        
        <div className="divide-y divide-dark-border">
          {isLoading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center">
                    <Skeleton className="h-6 w-6 rounded-full mx-auto" />
                  </div>
                  <div className="col-span-7 md:col-span-4 flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full ml-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="hidden md:flex md:col-span-3 items-center space-x-1 space-x-reverse">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <div className="col-span-4">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="px-4 py-8 text-center text-red-500">
              خطا در بارگذاری داده‌ها
            </div>
          ) : (
            users?.map((user, index) => (
              <div key={user.id} className="px-4 py-3 hover:bg-dark-card/30 transition-colors duration-200">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center font-bold flex items-center justify-center">
                    {index < 3 ? (
                      <Medal className={`h-5 w-5 ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        'text-amber-600'
                      }`} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="col-span-7 md:col-span-4 flex items-center">
                    <Avatar className="h-8 w-8 ml-2 bg-primary-dark">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                      ) : null}
                      <AvatarFallback>
                        {getInitial(user.displayName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <Link href={`/profile/${user.id}`}>
                      <a className="font-medium hover:underline">
                        {user.displayName || user.username}
                      </a>
                    </Link>
                  </div>
                  
                  <div className="hidden md:flex md:col-span-3 items-center space-x-1 space-x-reverse">
                    {user.badges?.map((badge) => (
                      <span 
                        key={badge}
                        className={`inline-block w-6 h-6 rounded-full ${badgeInfo[badge]?.color || 'bg-primary'} text-white text-xs flex items-center justify-center`}
                        title={badgeInfo[badge]?.title || badge}
                      >
                        {getInitial(badgeInfo[badge]?.title || badge)}
                      </span>
                    ))}
                  </div>
                  
                  <div className="col-span-4 font-bold text-primary-light flex items-center">
                    <Gift className="h-4 w-4 mr-1 ml-2" />
                    {user.points.toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
