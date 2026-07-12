import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsTablet() {
  const isMinMd = useMediaQuery("(min-width: 768px)");
  const isMinLg = useMediaQuery("(min-width: 1024px)");
  return isMinMd && !isMinLg;
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

export default useMediaQuery;
