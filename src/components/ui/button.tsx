import * as React from "react"

type Variant = "default" | "outline" | "ghost"
type Size = "sm" | "md" | "lg"

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"

const variantClasses: Record<Variant, string> = {
  default: "bg-indigo-600 text-white shadow-md hover:bg-indigo-700",
  outline: "border border-slate-200 text-slate-800 hover:bg-slate-50",
  ghost: "text-slate-700 hover:text-indigo-700",
}

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
)

Button.displayName = "Button"

export { Button }
