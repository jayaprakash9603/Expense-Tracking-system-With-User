const PRODUCT_SITE_ORIGIN =
  import.meta.env.VITE_PRODUCT_SITE_ORIGIN || "https://expensio.app";

export const PRODUCT_URLS = {
  helpCenter: import.meta.env.VITE_HELP_CENTER_URL || "https://help.expensio.app",
  termsOfService: import.meta.env.VITE_TERMS_URL || `${PRODUCT_SITE_ORIGIN}/terms`,
  privacyPolicy: import.meta.env.VITE_PRIVACY_URL || `${PRODUCT_SITE_ORIGIN}/privacy`,
};
