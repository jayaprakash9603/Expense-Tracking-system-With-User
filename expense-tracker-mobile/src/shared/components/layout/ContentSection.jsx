import React from "react";
import { cn } from "@/lib/utils";

export function ContentSection({ title, description, action, children, className }) {
  return (
    <section className={cn("mb-6 md:mb-8", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div>
            {title && <h2 className="text-base md:text-lg font-semibold">{title}</h2>}
            {description && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export default ContentSection;
