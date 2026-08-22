import { Link, NavLink } from "react-router-dom";
import { PUBLIC_NAV, SITE_NAME, SITE_SHORT_NAME } from "../../../seo/siteConfig";

const linkClass = ({ isActive }) =>
  [
    "rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700",
    isActive ? "text-teal-800" : "text-slate-600 hover:text-slate-900",
  ].join(" ");

export default function PublicLayout({ children }) {
  const hasSession =
    typeof localStorage !== "undefined" && Boolean(localStorage.getItem("jwt"));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            {SITE_SHORT_NAME}
            <span className="ml-1 font-normal text-teal-700">Finance</span>
          </Link>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-3">
              {PUBLIC_NAV.filter((item) => item.path !== "/").map((item) => (
                <li key={item.path}>
                  <NavLink to={item.path} className={linkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to={hasSession ? "/dashboard" : "/login"}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  {hasSession ? "Open app" : "Sign in"}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-start md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Expense tracking for people
            who want a record they can keep.
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-4">
              <li>
                <Link className="hover:text-slate-900" to="/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900" to="/terms">
                  Terms
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900" to="/help">
                  Help
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900" to="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900" to="/guides">
                  Guides
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
