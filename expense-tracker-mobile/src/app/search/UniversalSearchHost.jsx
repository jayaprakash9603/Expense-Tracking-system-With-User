import React from "react";
import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_CATALOG } from "@/app/routing/routeCatalog";
import { universalSearchService } from "@/domain/search/search.service";
import { buildCatalogCommandActions, SEARCH_MODES } from "@/app/search/quickActions";
import { CommandPalette } from "@/shared/components/search/command-palette";
import { buildBaseCommandActions } from "@/shared/components/search/command-palette/data/actions";

function dedupeActions(actions) {
  const map = new Map();
  actions.forEach((action) => {
    const key = `${action?.name || ""}::${action?.route || ""}::${action?.section || ""}`;
    if (!map.has(key)) {
      map.set(key, action);
    }
  });
  return Array.from(map.values());
}

export function UniversalSearchHost() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentMode = useSelector((state) => state.auth?.currentMode || SEARCH_MODES.USER);

  const baseActions = useMemo(() => {
    const routeActions = buildBaseCommandActions(ROUTE_CATALOG, currentMode);
    const quickActions = buildCatalogCommandActions(currentMode);
    return dedupeActions([...routeActions, ...quickActions]);
  }, [currentMode]);

  const searchRemote = useCallback(
    async ({ query, limit, mode }) =>
      universalSearchService.search({
        query,
        limit,
        mode,
      }),
    [],
  );

  return (
    <CommandPalette
      currentRoute={location.pathname}
      onNavigate={navigate}
      baseActions={baseActions}
      searchRemote={searchRemote}
    />
  );
}

export default UniversalSearchHost;
