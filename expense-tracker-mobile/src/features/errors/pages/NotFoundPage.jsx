import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Home, Search } from "lucide-react";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { Button } from "@/shared/components/app-shadcn";

function buildContext({ isAdminMode, attemptedAdminRoute, t }) {
  const defaultAdminRoute = "/admin/dashboard";
  const defaultUserRoute = "/dashboard";

  const adminQuickLinks = [
    { label: t("navigation.adminDashboard"), path: defaultAdminRoute },
    { label: t("navigation.userManagement"), path: "/admin/users" },
    { label: t("navigation.systemAnalytics"), path: "/admin/analytics" },
    { label: t("navigation.auditLogs"), path: "/admin/audit" },
  ];

  const userQuickLinks = [
    { label: t("dashboard.title"), path: defaultUserRoute },
    { label: t("navigation.expenses"), path: "/expenses" },
    { label: t("navigation.groups"), path: "/groups" },
    { label: t("navigation.friends"), path: "/friends" },
  ];

  if (isAdminMode && !attemptedAdminRoute) {
    return {
      message: t("errors.notFound.messageAdminWrongWorkspace"),
      primaryCta: {
        label: t("errors.notFound.openAdminDashboard"),
        path: defaultAdminRoute,
      },
      quickLinks: adminQuickLinks,
    };
  }

  if (!isAdminMode && attemptedAdminRoute) {
    return {
      message: t("errors.notFound.messageUserAdminOnly"),
      primaryCta: {
        label: t("errors.notFound.returnUserDashboard"),
        path: defaultUserRoute,
      },
      quickLinks: userQuickLinks,
    };
  }

  return {
    message: t("errors.notFound.messageGeneric"),
    primaryCta: {
      label: isAdminMode
        ? t("errors.notFound.openAdminDashboard")
        : t("errors.notFound.goToDashboard"),
      path: isAdminMode ? defaultAdminRoute : defaultUserRoute,
    },
    quickLinks: isAdminMode ? adminQuickLinks : userQuickLinks,
  };
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");

  const isAdminMode = currentMode === "ADMIN";
  const attemptedAdminRoute = location.pathname?.startsWith("/admin");
  const { message, primaryCta, quickLinks } = buildContext({
    isAdminMode,
    attemptedAdminRoute,
    t,
  });

  return (
    <div className="relative flex min-h-[calc(100dvh-64px)] w-full items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-16 top-6 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 bottom-6 h-56 w-56 rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/95 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Search className="h-8 w-8" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
            {t("errors.notFound.code")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {t("errors.notFound.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/80 sm:text-sm">
            {t("errors.notFound.attemptedRoutePrefix")} {location.pathname}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => navigate(primaryCta.path, { replace: true })}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            {primaryCta.label}
          </Button>

          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("errors.notFound.goBack")}
          </Button>
        </div>

        <div className="mt-7 border-t border-border/60 pt-5 text-center">
          <p className="text-sm text-muted-foreground">{t("errors.notFound.popularPagesHint")}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {quickLinks.map((link) => (
              <Button
                key={link.path}
                type="button"
                variant="link"
                onClick={() => navigate(link.path, { replace: true })}
                className="h-auto p-0 text-sm font-medium text-primary underline-offset-4"
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
