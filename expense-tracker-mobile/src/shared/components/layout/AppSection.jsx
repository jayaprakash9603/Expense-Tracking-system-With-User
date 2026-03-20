import React from "react";
import { cn } from "@/lib/utils";

/**
 * @param {{title?: string, description?: string, actions?: React.ReactNode, children: React.ReactNode, className?: string}} props
 */
export function AppSection({ title, description, actions, children, className }) {
  return (
    <section
      className={cn("rounded-xl border border-border/70 bg-card/60 p-3 md:p-4 lg:p-5", className)}
    >
      {(title || description || actions) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title ? <h2 className="text-base md:text-lg font-semibold">{title}</h2> : null}
            {description ? (
              <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export default AppSection;
