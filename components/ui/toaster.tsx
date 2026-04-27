"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToastStore } from "@/lib/use-toast"

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm p-4 outline-none",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: 'default' | 'success' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-8 shadow-xl transition-all",
      "data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out",
      "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
      variant === 'success' && "bg-[hsl(var(--success-muted))] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]",
      variant === 'destructive' && "bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]",
      variant === 'default' && "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity",
      "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold leading-tight", className)} {...props} />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn("text-xs opacity-80 mt-0.5", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

function Toaster() {
  const toasts = useToastStore()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(t => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          {t.variant === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
          {t.variant === 'destructive' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export { Toaster, Toast, ToastClose, ToastTitle, ToastDescription, ToastViewport, ToastProvider }
