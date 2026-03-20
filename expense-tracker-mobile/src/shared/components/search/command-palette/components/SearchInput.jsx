import React, { useEffect, useRef } from "react";
import { ArrowLeft, Loader2, Search, X } from "lucide-react";

export function SearchInput({
  isOpen,
  query,
  loading,
  canGoBack,
  onQueryChange,
  onGoBack,
  placeholder = "Search anything or run an action...",
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
      {canGoBack ? (
        <button
          onClick={onGoBack}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <Search className="h-4 w-4 text-muted-foreground" />
      )}

      <input
        ref={inputRef}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />

      {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}

      {query ? (
        <button
          onClick={() => onQueryChange("")}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Clear query"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
