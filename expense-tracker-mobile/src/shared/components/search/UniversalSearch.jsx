import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { AppSheet } from "@/shared/components/overlay/AppSheet";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { HighlightedText } from "@/shared/components/display/HighlightedText";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useLayout } from "@/shared/hooks/useLayout";

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
  errorMessage,
}) {
  const { t } = useLanguage();
  const { isMobile } = useLayout();

  const resolvedPlaceholder = placeholder || t("common.searchEverything") || "Search everything...";

  const renderCommandContent = () => (
    <>
      <CommandInput placeholder={resolvedPlaceholder} value={query} onValueChange={onQueryChange} />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && errorMessage && (
          <div className="px-3 py-2 text-xs text-destructive">{errorMessage}</div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <CommandEmpty>{t("common.noResults") || "No results found."}</CommandEmpty>
        )}

        {!query.trim() && quickActions.length > 0 && (
          <CommandGroup heading={t("common.quickActions") || "Quick Actions"}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.key || action.id}
                value={action.searchValue || action.label}
                onSelect={() => onSelect?.(action)}
                className="gap-3"
              >
                {action.icon && <AppIcon icon={action.icon} size="sm" color="muted" />}
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.map((section, sectionIndex) => (
          <React.Fragment key={section.key || sectionIndex}>
            {sectionIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={section.label}>
              {section.items?.map((item) => (
                <CommandItem
                  key={item.key || item.id}
                  value={item.searchValue || item.label || item.name}
                  onSelect={() => onSelect?.(item)}
                  className="gap-3"
                >
                  {item.icon && <AppIcon icon={item.icon} size="sm" color="muted" />}
                  <div className="min-w-0 flex-1">
                    <HighlightedText
                      text={item.label || item.name}
                      query={query}
                      mode="fuzzy"
                      className="block truncate text-sm font-medium"
                    />
                    {item.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </>
  );

  if (isMobile) {
    return (
      <AppSheet open={open} onOpenChange={onOpenChange} side="bottom" className="max-h-[92vh]">
        <Command className="max-h-[78vh] overflow-hidden rounded-md border border-border/60">
          {renderCommandContent()}
        </Command>
      </AppSheet>
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      {renderCommandContent()}
    </CommandDialog>
  );
}

export default UniversalSearch;
