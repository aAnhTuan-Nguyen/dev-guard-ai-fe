import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:border-input dark:bg-input/30",
        type === "search" &&
          "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
        type === "file" &&
          "text-muted-foreground/70 file:mr-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
