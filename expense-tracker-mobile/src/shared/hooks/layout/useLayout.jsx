import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { STORAGE_KEYS, SIDEBAR_WIDTH } from "@/config/constants";

const LayoutContext = createContext(null);

const QUERIES = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  xxl: "(min-width: 1536px)",
};

function getBreakpoints() {
  if (typeof window === "undefined") {
    return { sm: false, md: false, lg: false, xl: false, xxl: false };
  }
  return {
    sm: window.matchMedia(QUERIES.sm).matches,
    md: window.matchMedia(QUERIES.md).matches,
    lg: window.matchMedia(QUERIES.lg).matches,
    xl: window.matchMedia(QUERIES.xl).matches,
    xxl: window.matchMedia(QUERIES.xxl).matches,
  };
}

function useBreakpoints() {
  const [bp, setBp] = useState(getBreakpoints);

  useEffect(() => {
    const mqls = Object.entries(QUERIES).map(([key, q]) => ({
      key,
      mql: window.matchMedia(q),
    }));

    const handler = () => setBp(getBreakpoints());

    mqls.forEach(({ mql }) => mql.addEventListener("change", handler));
    return () => mqls.forEach(({ mql }) => mql.removeEventListener("change", handler));
  }, []);

  return bp;
}

function useLayoutProvider() {
  const { sm: isMinSm, md: isMinMd, lg: isMinLg, xl: isMinXl, xxl: isMin2xl } = useBreakpoints();

  const isMobile = !isMinMd;
  const isTablet = isMinMd && !isMinLg;
  const isDesktop = isMinLg && !isMinXl;
  const isDesktopWide = isMinXl && !isMin2xl;
  const isDesktopUltra = isMin2xl;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobile || isTablet) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) return;
    if (isTablet) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  }, [isMobile, isTablet]);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const device = isMobile
    ? "mobile"
    : isTablet
      ? "tablet"
      : isDesktopUltra
        ? "desktop-ultra"
        : isDesktopWide
          ? "desktop-wide"
          : "desktop";

  const showSidebar = isMinLg || isTablet;
  const showBottomNav = isMobile;
  const collapsed = isTablet || sidebarCollapsed;

  const sidebarWidth = useMemo(() => {
    if (isMobile) return 0;
    if (isTablet) return SIDEBAR_WIDTH.COLLAPSED;
    return sidebarCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED;
  }, [isMobile, isTablet, sidebarCollapsed]);

  const contentColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 1;
    if (isDesktop) return 2;
    return isMin2xl ? 3 : 2;
  }, [isMobile, isTablet, isDesktop, isMin2xl]);

  const gridCols = useMemo(() => {
    if (isMobile) return 1;
    if (isMinSm && !isMinMd) return 2;
    if (isTablet) return 2;
    if (isDesktop) return 3;
    if (isDesktopWide) return 4;
    return 4;
  }, [isMobile, isMinSm, isMinMd, isTablet, isDesktop, isDesktopWide]);

  return {
    device,
    isMobile,
    isTablet,
    isDesktop: isMinLg,
    isDesktopWide: isMinXl,
    isDesktopUltra: isMin2xl,
    isMinSm,
    isMinMd,
    isMinLg,
    isMinXl,
    isMin2xl,
    showSidebar,
    showBottomNav,
    sidebarCollapsed: collapsed,
    sidebarWidth,
    mobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
    contentColumns,
    gridCols,
  };
}

export function LayoutProvider({ children }) {
  const layout = useLayoutProvider();
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
