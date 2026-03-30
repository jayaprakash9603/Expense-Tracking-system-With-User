import React from "react";
import { CornerDownLeft, Keyboard, Sparkles } from "lucide-react";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { SearchInput } from "./SearchInput";
import { ResultList } from "./ResultList";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

function getPreviewIcon(icon) {
  return typeof icon === "string" && icon.trim() ? icon : "➡️";
}

export function CommandPalette({
  currentRoute,
  onNavigate,
  baseActions = [],
  searchRemote,
  currencySymbol = "$",
  className,
}) {
  const { t } = useLanguage();
  const {
    isOpen,
    query,
    results,
    selectedIndex,
    selectedAction,
    stackDepth,
    currentLevel,
    loading,
    categoryCount,
    setQuery,
    setSelectedIndex,
    closePalette,
    goBackLevel,
    executeAction,
    flatResults,
    loadMore,
    hasMore,
  } = useCommandPalette({ currentRoute, onNavigate, baseActions, searchRemote, currencySymbol });

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[140] flex items-start justify-center bg-background/40 px-3 pt-[10vh] backdrop-blur-sm",
        className,
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <div className="animate-in fade-in zoom-in-95 w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl duration-150 flex flex-col">
        <SearchInput
          isOpen={isOpen}
          query={query}
          loading={loading}
          canGoBack={stackDepth > 1}
          onQueryChange={setQuery}
          onGoBack={goBackLevel}
          placeholder={t("commandPalette.searchPlaceholder")}
        />

        <div className="flex-1 overflow-hidden">
          <ResultList
            groupedResults={results}
            flatResults={flatResults}
            query={query}
            selectedIndex={selectedIndex}
            onHover={setSelectedIndex}
            onSelect={executeAction}
            loadMore={loadMore}
            hasMore={hasMore}
          />
        </div>

        <footer className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-background border border-border/50 px-1.5 py-0.5 font-mono text-[10px]">↑↓</span>
              <span>{t("search.navigate") || "Navigate"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-background border border-border/50 px-1.5 py-0.5 font-mono text-[10px]">↵</span>
              <span>{t("search.open") || "Open"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-background border border-border/50 px-1.5 py-0.5 font-mono text-[10px]">Esc</span>
              <span>{t("search.close") || "Close"}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CommandPalette;
