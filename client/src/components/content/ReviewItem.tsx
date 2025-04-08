import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarIcon } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { faIR } from 'date-fns/locale';
import SpoilerAlert from '@/components/shared/SpoilerAlert';

// نوع داده برای نقد
interface ReviewItemProps {
  review: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    title: string;
    text: string;
    score: number;
    createdAt: string;
    hasContainsSpoiler: boolean;
  };
}

/**
 * کامپوننت نمایش نقد
 * این کامپوننت یک نقد را نمایش می‌دهد و در صورت وجود اسپویلر، از کامپوننت SpoilerAlert استفاده می‌کند
 */
const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  // تبدیل تاریخ به فرمت نسبی
  const formattedDate = formatDistance(new Date(review.createdAt), new Date(), {
    addSuffix: true,
    locale: faIR,
  });

  // تبدیل امتیاز به ستاره
  const scoreStars = Array.from({ length: 5 }, (_, i) => (
    <StarIcon
      key={i}
      className={`h-4 w-4 ${
        i < Math.floor(review.score)
          ? 'text-yellow-500 fill-yellow-500'
          : i < review.score
          ? 'text-yellow-500 fill-yellow-500 opacity-50'
          : 'text-gray-300'
      }`}
    />
  ));

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.userAvatar} alt={review.userName} />
            <AvatarFallback>{review.userName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm">{review.userName}</h4>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex mr-2">{scoreStars}</div>
          <Badge variant="outline" className="text-xs">
            {review.score.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <h3 className="text-lg font-bold mb-2">{review.title}</h3>
        {review.hasContainsSpoiler ? (
          <SpoilerAlert>
            <p className="text-sm leading-relaxed">{review.text}</p>
          </SpoilerAlert>
        ) : (
          <p className="text-sm leading-relaxed">{review.text}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex justify-end w-full">ID: {review.id.substring(0, 8)}</div>
      </CardFooter>
    </Card>
  );
};

export default ReviewItem;