import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useUniversalSearch } from "@/shared/components/search/useUniversalSearch";
import { universalSearchService } from "@/domain/search";
import { buildQuickActions, filterQuickActions, SEARCH_MODES } from "@/app/search/quickActions";

export function useAppUniversalSearch() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const currentMode = useSelector((state) => state.auth?.currentMode || SEARCH_MODES.USER);

  const allQuickActions = useMemo(() => buildQuickActions(currentMode, t), [currentMode, t]);

  const searchFn = useCallback(
    async (searchQuery) => {
      const quickActionMatches = filterQuickActions(allQuickActions, searchQuery);
      const { sections, error: serviceError } = await universalSearchService.search({
        query: searchQuery,
        mode: currentMode,
        limit: 20,
      });

      setError(serviceError?.message || null);

      if (!quickActionMatches.length) return sections;

      return [
        {
          key: "quick-actions",
          label: t("common.quickActions") || "Quick Actions",
          items: quickActionMatches,
        },
        ...sections,
      ];
    },
    [allQuickActions, currentMode, t],
  );

  const searchState = useUniversalSearch({
    searchFn,
    debounceMs: 180,
    enableGlobalHotkey: false,
  });

  const { open, setOpen, openSearch, closeSearch } = searchState;

  const handleSelect = useCallback(
    (item) => {
      if (!item?.route) return;
      if (item.route.startsWith("#action:")) {
        closeSearch();
        return;
      }

      closeSearch();
      navigate(item.route);
    },
    [closeSearch, navigate],
  );

  useEffect(() => {
    const handleOpen = () => openSearch();
    const handleClose = () => closeSearch();

    window.addEventListener("open-universal-search", handleOpen);
    window.addEventListener("close-universal-search", handleClose);

    return () => {
      window.removeEventListener("open-universal-search", handleOpen);
      window.removeEventListener("close-universal-search", handleClose);
    };
  }, [closeSearch, openSearch]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeTag = event.target?.tagName?.toLowerCase();
      const isEditable =
        activeTag === "input" || activeTag === "textarea" || event.target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          closeSearch();
        } else {
          openSearch();
        }
        return;
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeSearch();
        return;
      }

      if (isEditable) return;
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch, open, openSearch]);

  return {
    ...searchState,
    open,
    setOpen,
    error,
    currentMode,
    quickActions: allQuickActions,
    handleSelect,
  };
}

export default useAppUniversalSearch;
