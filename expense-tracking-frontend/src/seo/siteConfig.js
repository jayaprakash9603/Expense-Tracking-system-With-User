export const SITE_NAME = "Expensio Finance";
export const SITE_SHORT_NAME = "Expensio";
export const SITE_TAGLINE =
  "Track spending, budgets, bills, and shared expenses in one place.";
export const SITE_DEFAULT_DESCRIPTION =
  "Expensio Finance is a personal and household expense tracker for daily spending, monthly budgets, recurring bills, shared costs, and clear reports. Built for people who want useful financial records, not a spreadsheet they abandon.";
export const SITE_THEME_COLOR = "#0f766e";
export const DEFAULT_OG_IMAGE = "/favicon.jpg";

const trimSlash = (value = "") => value.replace(/\/+$/, "");

export const getSiteUrl = () => {
  const fromEnv = trimSlash(process.env.REACT_APP_PUBLIC_SITE_URL || "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimSlash(window.location.origin);
  }
  return "https://expensio.finance";
};

export const absoluteUrl = (path = "/") => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "/" : normalized}`;
};

export const AUTH_NOINDEX_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/create-password",
  "/otp-verification",
  "/mfa",
  "/oauth/callback",
];

export const APP_NOINDEX_PREFIXES = [
  "/dashboard",
  "/expenses",
  "/bill",
  "/budget",
  "/friends",
  "/groups",
  "/chats",
  "/profile",
  "/settings",
  "/admin",
  "/payment-method",
  "/category",
  "/calendar",
  "/share",
  "/my-shares",
  "/public-shares",
  "/shared-with-me",
  "/component1",
  "/component2",
  "/friend-chat",
  "/support",
  "/transactions",
  "/reports",
  "/utilities",
  "/upload",
];

export const PUBLIC_NAV = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/guides", label: "Guides" },
  { path: "/about", label: "About" },
  { path: "/help", label: "Help" },
  { path: "/contact", label: "Contact" },
];

export const PUBLIC_PAGE_META = {
  "/": {
    title: "Expensio Finance | Expense Tracker, Budgets, and Shared Bills",
    description: SITE_DEFAULT_DESCRIPTION,
    type: "website",
  },
  "/features": {
    title: "Expense Tracking Features | Expensio Finance",
    description:
      "See how Expensio Finance handles expenses, categories, budgets, recurring bills, friend splits, payment methods, and reports without turning your money into a monthly cleanup project.",
  },
  "/guides": {
    title: "Personal Finance Guides | Expensio Finance",
    description:
      "Practical guides on tracking daily expenses, building a monthly budget, splitting bills fairly, reading spending reports, and keeping recurring bills visible.",
  },
  "/about": {
    title: "About Expensio Finance",
    description:
      "Why Expensio Finance exists: a calmer way to record spending, share household costs, and understand where money actually goes.",
  },
  "/help": {
    title: "Help Center | Expensio Finance",
    description:
      "Answers for getting started with Expensio Finance, adding expenses, setting budgets, managing bills, inviting friends, and keeping your account secure.",
  },
  "/contact": {
    title: "Contact Expensio Finance",
    description:
      "Contact Expensio Finance for product questions, account help, privacy requests, and feedback. We reply to support email within one business day when we can.",
  },
  "/privacy": {
    title: "Privacy Policy | Expensio Finance",
    description:
      "How Expensio Finance collects, uses, stores, and protects account and expense data, and the choices you have over your information.",
  },
  "/terms": {
    title: "Terms of Service | Expensio Finance",
    description:
      "The terms for using Expensio Finance, including accounts, acceptable use, service changes, and how to contact us about legal questions.",
  },
};

export const ROBOTS_DISALLOW = [
  "/dashboard",
  "/expenses",
  "/bill",
  "/budget",
  "/friends",
  "/groups",
  "/chats",
  "/profile",
  "/settings",
  "/admin",
  "/payment-method",
  "/category",
  "/calendar",
  "/share/",
  "/my-shares",
  "/public-shares",
  "/shared-with-me",
  "/component1",
  "/component2",
  "/friend-chat",
  "/support/",
  "/oauth/",
  "/mfa",
  "/otp-verification",
  "/forgot-password",
  "/create-password",
];
