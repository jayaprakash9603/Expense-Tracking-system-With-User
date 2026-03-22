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
  } = useCommandPalette({ currentRoute, onNavigate, baseActions, searchRemote });

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[140] flex items-start justify-center bg-background/40 px-3 pt-[8vh] backdrop-blur-sm",
        className,
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <div className="animate-in fade-in zoom-in-95 w-full max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl duration-150">
        <SearchInput
          isOpen={isOpen}
          query={query}
          loading={loading}
          canGoBack={stackDepth > 1}
          onQueryChange={setQuery}
          onGoBack={goBackLevel}
          placeholder={t("commandPalette.searchPlaceholder")}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_0.85fr]">
          <ResultList
            groupedResults={results}
            flatResults={flatResults}
            query={query}
            selectedIndex={selectedIndex}
            onHover={setSelectedIndex}
            onSelect={executeAction}
          />

          <aside className="hidden border-l border-border/60 bg-muted/20 p-4 md:block">
            {selectedAction ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPreviewIcon(selectedAction.icon)}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedAction.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAction.section} · {selectedAction.category}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-3 text-xs text-muted-foreground">
                  <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                    <Sparkles className="h-3.5 w-3.5" /> {t("commandPalette.commandPreview")}
                  </p>
                  {selectedAction.route ? (
                    <p className="mb-1">
                      {t("commandPalette.routePrefix")}{" "}
                      <span className="font-mono text-foreground">{selectedAction.route}</span>
                    </p>
                  ) : null}
                  <p>
                    {t("commandPalette.priorityPrefix")} {selectedAction.priority}
                  </p>
                  <p>
                    {t("commandPalette.keywordsPrefix")}{" "}
                    {selectedAction.keywords?.slice(0, 4).join(", ")}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5" /> {t("commandPalette.navigateHint")}
                  </p>
                  <p className="flex items-center gap-2">
                    <CornerDownLeft className="h-3.5 w-3.5" /> {t("commandPalette.executeHint")}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-mono">Esc</span> {t("commandPalette.closePaletteHint")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-muted-foreground">
                <p className="text-sm font-medium text-foreground">{currentLevel.title}</p>
                <p>{t("commandPalette.useArrowKeys")}</p>
                <p>
                  {t("commandPalette.categoriesVisible")}{" "}
                  {Object.values(categoryCount).reduce((acc, value) => acc + value, 0)}
                </p>
              </div>
            )}
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-2 text-[0.6875rem] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Ctrl/Cmd + K</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">/</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Tab</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Esc</span>
            <span className="hidden sm:inline">{t("commandPalette.footerShortcutHint")}</span>
          </div>
          <span className="font-medium">{t("commandPalette.footerBrand")}</span>
        </footer>
      </div>
    </div>
  );
}

export default CommandPalette;
