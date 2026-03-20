import React from "react";
import { CornerDownLeft, Keyboard, Sparkles } from "lucide-react";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { SearchInput } from "./SearchInput";
import { ResultList } from "./ResultList";

function getPreviewIcon(icon) {
  return typeof icon === "string" && icon.trim() ? icon : "➡️";
}

export function CommandPalette({ currentRoute, onNavigate, baseActions = [], searchRemote }) {
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
      className="fixed inset-0 z-[140] flex items-start justify-center bg-background/40 px-3 pt-[8vh] backdrop-blur-sm"
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
          placeholder="Search navigation, actions, settings, or users..."
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
                    <Sparkles className="h-3.5 w-3.5" /> Command Preview
                  </p>
                  {selectedAction.route ? (
                    <p className="mb-1">
                      Route:{" "}
                      <span className="font-mono text-foreground">{selectedAction.route}</span>
                    </p>
                  ) : null}
                  <p>Priority: {selectedAction.priority}</p>
                  <p>Keywords: {selectedAction.keywords?.slice(0, 4).join(", ")}</p>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5" /> ↑/↓ Navigate
                  </p>
                  <p className="flex items-center gap-2">
                    <CornerDownLeft className="h-3.5 w-3.5" /> Enter Execute
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-mono">Esc</span> Close palette
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-muted-foreground">
                <p className="text-sm font-medium text-foreground">{currentLevel.title}</p>
                <p>Use arrow keys to navigate and press Enter to execute.</p>
                <p>
                  Categories visible:{" "}
                  {Object.values(categoryCount).reduce((acc, value) => acc + value, 0)}
                </p>
              </div>
            )}
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Ctrl/Cmd + K</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">/</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Tab</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono">Esc</span>
            <span className="hidden sm:inline">Backspace on empty query to go back</span>
          </div>
          <span className="font-medium">Notion-style command palette</span>
        </footer>
      </div>
    </div>
  );
}

export default CommandPalette;
