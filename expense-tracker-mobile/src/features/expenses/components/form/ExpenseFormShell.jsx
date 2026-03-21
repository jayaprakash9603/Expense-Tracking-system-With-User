import React from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/app-shadcn";
import { Separator } from "@/shared/components/app-shadcn";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ExpenseFormShell({
  title,
  onClose,
  rightContent,
  children,
  className,
  titleClassName,
}) {
  const { t } = useLanguage();
  return (
    <PageContainer className="pt-2 md:pt-3">
      <div
        className={cn(
          "mx-auto w-full max-w-[1240px] rounded-xl border bg-card px-4 py-4 md:px-5 md:py-4 shadow-sm",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h1
            className={cn(
              "min-w-0 flex-1 text-2xl font-extrabold md:text-3xl",
              titleClassName,
            )}
          >
            {title}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {rightContent}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 text-primary"
              onClick={onClose}
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator className="my-2.5" />
        {children}
      </div>
    </PageContainer>
  );
}

export default ExpenseFormShell;
