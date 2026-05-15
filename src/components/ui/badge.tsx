import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "h-5 rounded-4xl px-2 py-0.5 text-xs font-medium text-primary underline-offset-4 hover:underline",
        "verdict-low":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase bg-[#E6F4EC] text-[#0A7A3D] border-[#0A7A3D]/20",
        "verdict-medium":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase bg-[#FFF1E6] text-[var(--color-signal)] border-[var(--color-signal)]/20",
        "verdict-high":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase bg-[#FCE7E9] text-[var(--color-mc-red)] border-[var(--color-mc-red)]/20",
        "urgency-immediate":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase border-[var(--color-mc-red)]/40 text-[var(--color-mc-red)] bg-[var(--color-mc-red)]/5",
        "urgency-soon":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase border-[var(--color-signal)]/40 text-[var(--color-signal)] bg-[var(--color-signal)]/5",
        "urgency-later":
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase border-[var(--color-border)] text-[var(--color-slate)]",
        source:
          "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.04em] uppercase bg-[#E6F4EC] border-[#0A7A3D]/20 text-[#0A7A3D] whitespace-normal",
        chip:
          "rounded-full px-3.5 py-1.5 text-[13px] font-medium bg-white/60 text-[var(--color-ink)] border-[var(--color-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
