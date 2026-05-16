import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Receipt } from "lucide-react";
import { AppCard } from "@/shared/components/display/AppCard";
import { AppButton } from "@/shared/components/form/AppButton";
import { SectionHeader } from "@/shared/components/display/SectionHeader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Skeleton } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useDashboardData } from "@/features/dashboard/hooks/data/useDashboardData";
import { RecentTransactionCard } from "./RecentTransactionCard";

const RECENT_TXN_MOBILE_MAX_WIDTH_PX = 600;
const RECENT_TXN_LIMIT_DESKTOP = 10;
const RECENT_TXN_LIMIT_MOBILE = 6;

function useRecentTransactionLimit() {
  const [limit, setLimit] = useState(RECENT_TXN_LIMIT_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${RECENT_TXN_MOBILE_MAX_WIDTH_PX}px)`);
    const sync = () =>
      setLimit(mq.matches ? RECENT_TXN_LIMIT_MOBILE : RECENT_TXN_LIMIT_DESKTOP);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return limit;
}

function RecentTransactionsSkeleton({ count }) {
  const items = Array.from({ length: count });
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[min(100%,14rem)]" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function RecentTransactions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { format, animation } = usePresentation();
  const { recentTransactions, loading } = useDashboardData();
  const limit = useRecentTransactionLimit();
  const skeletonCount = limit >= 10 ? 10 : 6;

  const visible = (recentTransactions || []).slice(0, limit);

  return (
    <AppCard className="flex h-full min-h-0 flex-col">
      <AppCard.Header className="shrink-0">
        <SectionHeader icon={Clock} title={t("dashboard.recentTransactions")}>
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => navigate("/expenses")}
          >
            {t("dashboard.viewAll")}
          </AppButton>
        </SectionHeader>
      </AppCard.Header>
      <AppCard.Content className="flex min-h-0 flex-1 flex-col pt-0">
        {loading ? (
          <RecentTransactionsSkeleton count={skeletonCount} />
        ) : visible.length === 0 ? (
          <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="col-span-full flex min-h-[min(16rem,45vh)] w-full flex-1 items-center justify-center sm:col-span-2 sm:min-h-[17rem]">
              <EmptyState
                icon={Receipt}
                title={t("dashboard.noRecentTransactionsTitle")}
                description={t("dashboard.noRecentTransactionsMessage")}
                className="w-full max-w-none justify-center px-4 py-6 sm:py-8 md:py-10"
              />
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            {visible.map((tx) => (
              <RecentTransactionCard
                key={tx.id}
                transaction={tx}
                format={format}
                animated={animation.enabled}
                onExpenseNavigate={(id) => navigate(`/expenses/${id}`)}
                onCategoryNavigate={(categoryId) =>
                  navigate(`/category-flow/view/${categoryId}`)
                }
              />
            ))}
          </div>
        )}
      </AppCard.Content>
    </AppCard>
  );
}

export default RecentTransactions;
