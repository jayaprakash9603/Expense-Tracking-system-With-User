import React from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { cn } from "@/lib/utils";

export function UniversalSearch({
  open,
  onOpenChange,
  query,
  onQueryChange,
  results = [],
  loading = false,
  onSelect,
  quickActions = [],
  placeholder,
}) {
  const { t } = useLanguage();

  const resolvedPlaceholder =
    placeholder || t("common.searchEverything") || "Search everything...";

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={resolvedPlaceholder}
        value={query}
        onValueChange={onQueryChange}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <CommandEmpty>
            {t("common.noResults") || "No results found."}
          </CommandEmpty>
        )}

        {!query.trim() && quickActions.length > 0 && (
          <CommandGroup heading={t("common.quickActions") || "Quick Actions"}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.key}
                value={action.label}
                onSelect={() => onSelect?.(action)}
                className="gap-3"
              >
                {action.icon && <AppIcon icon={action.icon} size="sm" color="muted" />}
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.map((section, sIdx) => (
          <React.Fragment key={section.key || sIdx}>
            {sIdx > 0 && <CommandSeparator />}
            <CommandGroup heading={section.label}>
              {section.items?.map((item) => (
                <CommandItem
                  key={item.key || item.id}
                  value={item.searchValue || item.label || item.name}
                  onSelect={() => onSelect?.(item)}
                  className="gap-3"
                >
                  {item.icon && <AppIcon icon={item.icon} size="sm" color="muted" />}
                  <div className="flex-1 min-w-0">
                    <HighlightedText
                      text={item.label || item.name}
                      query={query}
                      mode="fuzzy"
                      className="text-sm font-medium truncate block"
                    />
                    {item.description && (
                      <span className="text-xs text-muted-foreground truncate block">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export default UniversalSearch;
