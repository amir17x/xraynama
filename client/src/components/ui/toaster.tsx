import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

// نوع مناسب برای variant
type ToastVariant = "default" | "success" | "destructive" | "warning" | "info" | undefined;

// Toast Icon Component for showing different icons based on variant
const ToastIcon = ({ variant }: { variant: ToastVariant }) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-[#4CAF50] ml-3" />;
    case "destructive":
      return <AlertCircle className="h-5 w-5 text-[#FF5252] ml-3" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-[#FFC107] ml-3" />;
    case "info":
      return <Info className="h-5 w-5 text-[#2196F3] ml-3" />;
    default:
      return <Info className="h-5 w-5 text-[#00BFFF] ml-3" />;
  }
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const safeVariant = variant as ToastVariant;
        return (
          <Toast 
            key={id} 
            {...props} 
            variant={safeVariant}
            className="transform-gpu transition-all duration-300 ease-in-out animate-fade-in-up"
          >
            <div className="relative">
              {/* نوار تزئینی بالای کارت */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              <div className="flex items-center">
                <ToastIcon variant={safeVariant} />
                <div className="flex-1">
                  {title && <ToastTitle className="text-[15px]">{title}</ToastTitle>}
                  {description && (
                    <ToastDescription className="opacity-90">{description}</ToastDescription>
                  )}
                </div>
              </div>
              {action && (
                <div className="mt-3 flex justify-end">
                  {action}
                </div>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
