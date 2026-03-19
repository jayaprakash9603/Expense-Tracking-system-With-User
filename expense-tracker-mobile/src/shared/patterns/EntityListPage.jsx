import { useState } from "react";
import { Search, Plus, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppInput } from "@/shared/components/form/AppInput";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { PageContainer } from "@/shared/components/layout/PageContainer";

export function EntityListPage({
  title,
  searchPlaceholder = "Search...",
  hook,
  renderItem,
  emptyState = {},
  fab = null,
  filters = null,
  sortOptions = [],
  headerActions = null,
  className,
}) {
  const {
    items, loading, search, setSearch, sort, toggleSort, isEmpty, isSearchEmpty,
  } = hook;

  const [showFilters, setShowFilters] = useState(false);

  if (loading && items.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" className="mt-20" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-2">
          {headerActions}
          {filters && (
            <AppButton
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <AppIcon icon={SlidersHorizontal} color="soft" size="sm" />
            </AppButton>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <AppIcon icon={Search} color="muted" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <AppInput
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {sortOptions.length > 0 && (
          <AppButton
            variant="outline"
            size="icon"
            onClick={() => toggleSort(sort.field)}
          >
            <AppIcon icon={ArrowUpDown} color="soft" size="sm" />
          </AppButton>
        )}
      </div>

      {showFilters && filters}

      {isEmpty && (
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title || "No items yet"}
          description={emptyState.description || "Get started by adding your first item"}
          action={
            fab
              ? { label: emptyState.actionLabel || "Add New", onClick: fab.onPress }
              : undefined
          }
        />
      )}

      {isSearchEmpty && (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No items match "${search}"`}
          action={{ label: "Clear search", onClick: () => setSearch("") }}
        />
      )}

      {!isEmpty && !isSearchEmpty && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || index}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {loading && items.length > 0 && (
        <LoadingSpinner size="sm" className="my-4" />
      )}

      {fab && !isEmpty && (
        <AppButton
          size="icon"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6 z-40"
          onClick={fab.onPress}
        >
          {fab.icon ? <AppIcon icon={fab.icon} color="inherit" size="lg" /> : <AppIcon icon={Plus} color="inherit" size="lg" />}
        </AppButton>
      )}
    </PageContainer>
  );
}

export default EntityListPage;
