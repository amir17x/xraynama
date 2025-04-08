import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import { Separator } from '@/components/ui/separator';

interface CommentsSectionProps {
  contentId: string | number;
  contentTitle: string;
}

export function CommentsSection({ contentId, contentTitle }: CommentsSectionProps) {
  return (
    <Card className="mt-10 mb-16">
      <CardContent className="p-6">
        <CommentForm 
          contentId={contentId}
          contentTitle={contentTitle}
        />
        
        <Separator className="my-6" />
        
        <CommentsList 
          contentId={contentId}
        />
      </CardContent>
    </Card>
  );
}

export default CommentsSection;