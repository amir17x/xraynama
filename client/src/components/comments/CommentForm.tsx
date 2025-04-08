import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { CommentTypeSelector, CommentType } from './CommentTypeSelector';

// Schema validation for comment
const commentSchema = z.object({
  text: z.string().min(3, { message: 'متن نظر نمی‌تواند کمتر از ۳ کاراکتر باشد' }),
  score: z.number().min(1).max(5).optional(),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  contentId: string | number;
  contentTitle: string;
  onSuccess?: () => void;
}

export function CommentForm({ contentId, contentTitle, onSuccess }: CommentFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentType, setCommentType] = useState<CommentType>('comment');
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      text: '',
      score: 5,
    },
  });

  const onSubmit = async (values: CommentFormValues) => {
    if (!user) {
      toast({
        title: 'ابتدا وارد شوید',
        description: 'برای ارسال نظر ابتدا باید وارد حساب کاربری خود شوید',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const endpoint = commentType === 'review' 
        ? `/api/content/${contentId}/reviews` 
        : `/api/content/${contentId}/comments`;
      
      const data = {
        text: values.text,
        hasContainsSpoiler: containsSpoiler,
        type: commentType,
        ...(commentType === 'review' ? { score: values.score } : {}),
      };
      
      await apiRequest('POST', endpoint, data);
      
      // Show success message
      toast({
        title: 'موفقیت',
        description: `${commentType === 'review' ? 'نقد' : commentType === 'question' ? 'سوال' : 'نظر'} شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد`,
      });
      
      // Invalidate comments cache to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/comments`] });
      
      // Reset form
      form.reset();
      setContainsSpoiler(false);
      
      // Call success callback
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'خطا',
        description: 'مشکلی در ثبت نظر به وجود آمد. لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card bg-opacity-50 p-4 rounded-md border mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">دیدگاه خود را بنویسید</h3>
            
            {/* انتخاب نوع نظر */}
            <CommentTypeSelector 
              value={commentType} 
              onValueChange={setCommentType} 
            />
          </div>
          
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={`دیدگاه خود را درباره ${contentTitle} بنویسید...`}
                    className="min-h-32 resize-none border-muted bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            {/* اگر نوع نظر، نقد باشد، امتیازدهی نمایش داده شود */}
            {commentType === 'review' && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground ml-2">امتیاز شما:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => form.setValue('score', score)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          score <= (form.watch('score') || 0)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* گزینه اسپویلر */}
            <div className="flex items-center">
              <Switch
                id="spoiler-switch"
                checked={containsSpoiler}
                onCheckedChange={setContainsSpoiler}
              />
              <Label
                htmlFor="spoiler-switch"
                className="ml-2 text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                <span>حاوی اسپویلر (جزئیات داستان)</span>
              </Label>
            </div>
          </div>
          
          {!user && (
            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
              برای ارسال دیدگاه، ابتدا وارد حساب کاربری خود شوید.
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !user}
              className="flex items-center gap-1"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال دیدگاه'}
              <Send className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CommentForm;