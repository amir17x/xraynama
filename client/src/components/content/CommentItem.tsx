import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { faIR } from 'date-fns/locale';

// نوع داده برای نظر
interface CommentItemProps {
  comment: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
  };
}

/**
 * کامپوننت نمایش نظر
 * این کامپوننت یک نظر را نمایش می‌دهد
 */
const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  // تبدیل تاریخ به فرمت نسبی
  const formattedDate = formatDistance(new Date(comment.createdAt), new Date(), {
    addSuffix: true,
    locale: faIR,
  });

  return (
    <Card className="mb-3 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 space-x-reverse mb-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
            <AvatarFallback>{comment.userName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-sm">{comment.userName}</h4>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{comment.text}</p>
      </CardContent>
      <CardFooter className="py-2 px-4 text-xs text-muted-foreground border-t">
        <div className="flex justify-end w-full">ID: {comment.id.substring(0, 8)}</div>
      </CardFooter>
    </Card>
  );
};

export default CommentItem;