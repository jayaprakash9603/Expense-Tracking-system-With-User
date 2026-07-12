import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

function Pagination({ className, ...props }) {
  const { t } = useLanguage();
  return (
    <nav
      role="navigation"
      aria-label={t("common.aria.pagination")}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = React.forwardRef(
  ({ className, isActive, size = "icon", ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef(({ className, ...props }, ref) => {
  const { t } = useLanguage();
  return (
    <PaginationLink
      aria-label={t("common.aria.goToPreviousPage")}
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      ref={ref}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{t("common.previous")}</span>
    </PaginationLink>
  );
});
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef(({ className, ...props }, ref) => {
  const { t } = useLanguage();
  return (
    <PaginationLink
      aria-label={t("common.aria.goToNextPage")}
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      ref={ref}
      {...props}
    >
      <span>{t("common.next")}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
});
PaginationNext.displayName = "PaginationNext";

function PaginationEllipsis({ className, ...props }) {
  const { t } = useLanguage();
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t("common.aria.morePages")}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
