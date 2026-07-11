import { forwardRef, SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  loading?: boolean
}

const ARROW_BG =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, loading, dir, ...props }, ref) => {
    const isRtl = dir === "rtl" || dir === "ar"
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          disabled={loading || props.disabled}
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none",
            ARROW_BG,
            isRtl ? "pl-10" : "pr-10",
            error && "border-error",
            loading && "opacity-60 cursor-not-allowed",
            className
          )}
          style={
            isRtl
              ? { backgroundPosition: "left 12px center", textAlign: "right" as const }
              : { backgroundPosition: "right 12px center", textAlign: "left" as const }
          }
          {...props}
        >
          {loading ? (
            <option value="">جاري التحميل...</option>
          ) : (
            <option value="">{label ? `اختر ${label}` : "اختر..."}</option>
          )}
          {!loading && options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
