import React from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useIsMobile } from "@/shared/hooks/theme/useMediaQuery";
import { cn } from "@/lib/utils";

function CrumbLabel({ crumb, isLast, compact, t }) {
  const label = t(crumb.labelKey);
  if (isLast) {
    return (
      <BreadcrumbItem className="min-w-0">
        <BreadcrumbPage className={cn(compact && "max-w-[min(100%,12rem)]")}>{label}</BreadcrumbPage>
      </BreadcrumbItem>
    );
  }
  if (crumb.to) {
    return (
      <BreadcrumbItem className="min-w-0 max-w-[min(100%,9rem)] sm:max-w-[14rem]">
        <BreadcrumbLink asChild>
          <Link to={crumb.to} className="truncate">
            {label}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  }
  return (
    <BreadcrumbItem className="min-w-0">
      <BreadcrumbPage className="font-normal text-muted-foreground">{label}</BreadcrumbPage>
    </BreadcrumbItem>
  );
}

export function AppBreadcrumb({ items, className }) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const count = items?.length ?? 0;

  if (!count) return null;

  const collapseMiddle = isMobile && count > 3;
  if (collapseMiddle) {
    const head = items[0];
    const middle = items.slice(1, -1);
    const tail = items[count - 1];
    return (
      <Breadcrumb className={cn("min-w-0 flex-1", className)}>
        <BreadcrumbList className="flex-nowrap">
          <CrumbLabel crumb={head} isLast={false} compact={false} t={t} />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label={t("breadcrumb.moreSteps")}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {middle.map((crumb, i) =>
                  crumb.to ? (
                    <DropdownMenuItem key={`${crumb.labelKey}-${i}`} asChild>
                      <Link to={crumb.to}>{t(crumb.labelKey)}</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={`${crumb.labelKey}-${i}`} disabled>
                      {t(crumb.labelKey)}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <CrumbLabel crumb={tail} isLast compact t={t} />
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className={cn("min-w-0 flex-1", className)}>
      <BreadcrumbList>
        {items.map((crumb, i) => (
          <React.Fragment key={`${crumb.labelKey}-${i}`}>
            {i > 0 ? <BreadcrumbSeparator /> : null}
            <CrumbLabel crumb={crumb} isLast={i === count - 1} compact={false} t={t} />
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
