import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APIError, APIErrorType } from '@/lib/queryClient';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | APIError | null;
}

/**
 * کامپوننت ErrorBoundary برای مدیریت خطاها در سطح کامپوننت
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error | APIError): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    const { onReset } = this.props;
    this.setState({
      hasError: false,
      error: null
    });
    
    if (onReset) {
      onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // اگر fallback سفارشی تعریف شده باشد، آن را نمایش بده
      if (fallback) {
        return fallback;
      }

      // تعیین نوع خطا و نمایش پیام مناسب
      let errorMessage = 'متأسفانه خطایی رخ داده است.';
      let errorTitle = 'خطا';
      let isNetworkError = false;
      
      // بررسی اینکه آیا خطا از نوع APIError است
      if (error && 'type' in error) {
        const apiError = error as APIError;
        
        switch (apiError.type) {
          case APIErrorType.NETWORK:
            errorTitle = 'خطای شبکه';
            errorMessage = 'اتصال به سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.';
            isNetworkError = true;
            break;
          case APIErrorType.AUTHENTICATION:
            errorTitle = 'خطای احراز هویت';
            errorMessage = 'لطفاً وارد حساب کاربری خود شوید.';
            break;
          case APIErrorType.AUTHORIZATION:
            errorTitle = 'خطای دسترسی';
            errorMessage = 'شما اجازه دسترسی به این بخش را ندارید.';
            break;
          case APIErrorType.NOT_FOUND:
            errorTitle = 'پیدا نشد';
            errorMessage = 'محتوای درخواستی یافت نشد.';
            break;
          case APIErrorType.SERVER:
            errorTitle = 'خطای سرور';
            errorMessage = 'خطایی در سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید.';
            break;
          default:
            errorMessage = apiError.message || errorMessage;
            break;
        }
      } else if (error) {
        // استفاده از پیام خطای اصلی اگر در دسترس باشد
        errorMessage = error.message || errorMessage;
      }

      // نمایش کامپوننت خطا با پیام مناسب
      return (
        <div className="container-glass p-6 rounded-lg shadow-lg text-center my-4 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <Button 
            onClick={this.resetErrorBoundary}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
          
          {isNetworkError && (
            <p className="text-sm text-muted-foreground mt-4">
              اگر مشکل همچنان ادامه دارد، ممکن است سرور در حال به‌روزرسانی باشد.
              لطفاً چند دقیقه دیگر دوباره امتحان کنید.
            </p>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * هوک بهبود یافته ErrorBoundary با قابلیت reset خودکار
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}