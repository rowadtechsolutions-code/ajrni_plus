import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default"
  children: React.ReactNode
  className?: string
}

const variants = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  default: "bg-muted text-muted-foreground",
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
