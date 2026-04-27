import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  className?: string
  children: React.ReactNode
  id?: string
}

export function FormField({ label, required, hint, className, children, id }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)} id={id}>
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors">
        {label}{required && <span className="text-[hsl(var(--destructive))] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
    </div>
  )
}

interface SectionCardProps {
  title?: string
  className?: string
  children: React.ReactNode
  id?: string
}

export function SectionCard({ title, className, children, id }: SectionCardProps) {
  return (
    <div id={id} className={cn("bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden transition-shadow hover:shadow-md", className)}>
      {title && (
        <div className="px-5 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--primary)/0.1)]">
          <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

interface ReadOnlyFieldProps {
  label: string
  value: string
  highlight?: boolean
}

export function ReadOnlyField({ label, value, highlight }: ReadOnlyFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
      <p className={cn("text-sm font-medium mt-1", highlight && "text-[hsl(var(--primary))]")}>{value}</p>
    </div>
  )
}
