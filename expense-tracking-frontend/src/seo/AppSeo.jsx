import { useLocation } from "react-router-dom";
import SeoHead from "./SeoHead";
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME } from "./siteConfig";
import { isAppPrivatePath, isAuthPath, resolvePublicPage } from "./publicPaths";

export default function AppSeo() {
  const { pathname } = useLocation();
  const publicPage = resolvePublicPage(pathname);

  if (publicPage) {
    return (
      <SeoHead
        title={publicPage.title}
        description={publicPage.description}
        path={publicPage.path}
        type={publicPage.type || "website"}
        robots="index,follow"
      />
    );
  }

  if (isAuthPath(pathname) || isAppPrivatePath(pathname) || pathname !== "/") {
    const isAuth = isAuthPath(pathname);
    return (
      <SeoHead
        title={isAuth ? `Sign in | ${SITE_NAME}` : SITE_NAME}
        description={
          isAuth
            ? "Sign in to Expensio Finance to manage your private expenses, budgets, and bills."
            : SITE_DEFAULT_DESCRIPTION
        }
        path={pathname}
        robots="noindex,nofollow"
      />
    );
  }

  return null;
}
