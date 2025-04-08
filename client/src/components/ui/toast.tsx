import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-xl backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.35)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] p-4 pr-8",
  {
    variants: {
      variant: {
        default: "border-[#00BFFF]/40 bg-[#00142c]/80 text-white border-l-[#00BFFF]",
        success: "border-[#4CAF50]/40 bg-[#00142c]/80 text-white border-l-[#4CAF50]",
        destructive: "border-[#FF5252]/40 bg-[#00142c]/80 text-white border-l-[#FF5252]",
        warning: "border-[#FFC107]/40 bg-[#00142c]/80 text-white border-l-[#FFC107]",
        info: "border-[#2196F3]/40 bg-[#00142c]/80 text-white border-l-[#2196F3]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Toast Icon Component for showing different icons based on variant
const ToastIcon = ({ variant }: { variant?: "default" | "success" | "destructive" | "warning" | "info" }) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-[#4CAF50] mr-3" />;
    case "destructive":
      return <AlertCircle className="h-5 w-5 text-[#FF5252] mr-3" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-[#FFC107] mr-3" />;
    case "info":
      return <Info className="h-5 w-5 text-[#2196F3] mr-3" />;
    default:
      return <Info className="h-5 w-5 text-[#00BFFF] mr-3" />;
  }
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#00BFFF]/30 bg-[#00BFFF]/10 px-3 text-sm font-medium text-white transition-colors hover:bg-[#00BFFF]/20 focus:outline-none focus:ring-2 focus:ring-[#00BFFF]/30 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1 text-white/70 opacity-0 transition-opacity hover:text-white hover:bg-white/10 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white/30 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-white/90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
