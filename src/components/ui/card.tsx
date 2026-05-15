import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: "default" | "stadium" | "accent"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden text-sm ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        variant === "default" && "rounded-xl bg-card py-4 text-card-foreground",
        variant === "stadium" &&
          "rounded-[40px] bg-[var(--color-lifted)] border border-[var(--color-border)] p-6 md:p-8 ring-0",
        variant === "accent" &&
          "rounded-[40px] bg-[var(--color-ink)] text-[var(--color-canvas)] border-transparent p-6 md:p-8 ring-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group-data-[variant=stadium]/card:px-0 group-data-[variant=accent]/card:px-0",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-4 group-data-[size=sm]/card:px-3 group-data-[variant=stadium]/card:px-0 group-data-[variant=accent]/card:px-0",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

function CardIconHeader({
  icon,
  title,
  className,
}: {
  icon: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 mb-5", className)}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink)] group-data-[variant=accent]/card:bg-[var(--color-signal-light)] group-data-[variant=accent]/card:text-white group-data-[variant=accent]/card:border-transparent">
        {icon}
      </div>
      <h3 className="text-[22px] group-data-[variant=accent]/card:text-[var(--color-canvas)]">
        {title}
      </h3>
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardIconHeader,
}
