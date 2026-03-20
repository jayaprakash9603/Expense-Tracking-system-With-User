import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Home, Search } from "lucide-react";

function buildContext({ isAdminMode, attemptedAdminRoute }) {
  const defaultAdminRoute = "/admin/dashboard";
  const defaultUserRoute = "/dashboard";

  const adminQuickLinks = [
    { label: "Admin Dashboard", path: defaultAdminRoute },
    { label: "User Management", path: "/admin/users" },
    { label: "System Analytics", path: "/admin/analytics" },
    { label: "Audit Logs", path: "/admin/audit" },
  ];

  const userQuickLinks = [
    { label: "Dashboard", path: defaultUserRoute },
    { label: "Expenses", path: "/expenses" },
    { label: "Groups", path: "/groups" },
    { label: "Friends", path: "/friends" },
  ];

  if (isAdminMode && !attemptedAdminRoute) {
    return {
      message:
        "You are currently in Admin Mode, but the page you tried to open belongs to the user workspace.",
      primaryCta: { label: "Open Admin Dashboard", path: defaultAdminRoute },
      quickLinks: adminQuickLinks,
    };
  }

  if (!isAdminMode && attemptedAdminRoute) {
    return {
      message:
        "This page is available only in Admin Mode. Switch back to your user workspace to continue.",
      primaryCta: { label: "Return to User Dashboard", path: defaultUserRoute },
      quickLinks: userQuickLinks,
    };
  }

  return {
    message:
      "The page you are looking for does not exist. It may have moved, been deleted, or the URL is incorrect.",
    primaryCta: {
      label: isAdminMode ? "Open Admin Dashboard" : "Go to Dashboard",
      path: isAdminMode ? defaultAdminRoute : defaultUserRoute,
    },
    quickLinks: isAdminMode ? adminQuickLinks : userQuickLinks,
  };
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");

  const isAdminMode = currentMode === "ADMIN";
  const attemptedAdminRoute = location.pathname?.startsWith("/admin");
  const { message, primaryCta, quickLinks } = buildContext({ isAdminMode, attemptedAdminRoute });

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
          <p className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">404</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/80 sm:text-sm">
            Attempted route: {location.pathname}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(primaryCta.path, { replace: true })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            {primaryCta.label}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <div className="mt-7 border-t border-border/60 pt-5 text-center">
          <p className="text-sm text-muted-foreground">Try one of these popular pages:</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path, { replace: true })}
                className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
