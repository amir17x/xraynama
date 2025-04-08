import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema validation for comment
const replySchema = z.object({
  text: z.string().min(3, { message: 'متن پاسخ نمی‌تواند کمتر از ۳ کاراکتر باشد' }),
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface CommentReplyFormProps {
  commentId: string | number;
  contentId: string | number;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function CommentReplyForm({ commentId, contentId, onCancel, onSuccess }: CommentReplyFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  
  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = async (values: ReplyFormValues) => {
    try {
      setIsSubmitting(true);
      
      await apiRequest('POST', `/api/content/${contentId}/comments/${commentId}/replies`, {
        text: values.text,
        hasContainsSpoiler: containsSpoiler,
      });
      
      // Show success message
      toast({
        title: 'موفقیت',
        description: 'پاسخ شما با موفقیت ثبت شد',
      });
      
      // Invalidate comments cache to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/content/${contentId}/comments`] });
      
      // Reset form
      form.reset();
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close reply form
      onCancel();
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: 'خطا',
        description: 'مشکلی در ثبت پاسخ به وجود آمد. لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-md border mt-2 mb-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">پاسخ به نظر</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">بستن</span>
            </Button>
          </div>
          
          <Textarea
            {...form.register('text')}
            placeholder="پاسخ خود را بنویسید..."
            className="min-h-24 resize-none border-muted bg-transparent"
          />
          
          {form.formState.errors.text && (
            <p className="text-destructive text-xs">{form.formState.errors.text.message}</p>
          )}
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="contains-spoiler"
                checked={containsSpoiler}
                onCheckedChange={setContainsSpoiler}
              />
              <Label
                htmlFor="contains-spoiler"
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                <span>حاوی اسپویلر</span>
              </Label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="mr-2"
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}
              <Send className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CommentReplyForm;