import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

/*
  Generic Error Page Component
  Props:
    - code (number|string): HTTP-ish or custom error code (e.g., 404, 403, 500)
    - title (string): Heading text (defaults derived from code)
    - message (string|ReactNode): Descriptive message
    - showPath (boolean): Whether to display the attempted path (default true for 404)
    - primaryAction ({ label, onClick }) optional
    - secondaryAction ({ label, onClick }) optional
    - heightOffset (number) subtract from 100vh (default 100)
    - widthOffset (number) subtract from 100vw (default 370)
    - className (string) additional container classes
    - style (object) inline style overrides
*/

const DEFAULT_TITLES = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Access denied",
  404: "Page not found",
  409: "Conflict detected",
  422: "Unprocessable entity",
  429: "Too many requests",
  500: "Server error",
  502: "Bad gateway",
  503: "Service unavailable",
  504: "Gateway timeout",
};

export default function ErrorPage({
  code = 404,
  title,
  message,
  showPath = true,
  primaryAction,
  secondaryAction,
  heightOffset = 100,
  widthOffset = 370,
  className = "",
  style = {},
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedTitle = title || DEFAULT_TITLES[code] || "Unexpected error";
  const defaultMessage =
    message ||
    (code === 404
      ? "We looked everywhere but couldn't find the page you were after."
      : "Something went wrong. You can try again or go back.");

  const effectivePrimary = primaryAction || {
    label: code === 403 ? "Go Home" : "Go Home",
    onClick: () => navigate("/", { replace: true }),
  };
  const effectiveSecondary = secondaryAction || {
    label: "Go Back",
    onClick: () => navigate(-1),
  };

  return (
    <main
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1b1e] via-[#103038] to-[#081417] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10 text-slate-200 overflow-auto rounded-xl shadow-inner shadow-black/40 ${className}`}
      role="main"
      aria-labelledby="error-title"
      style={{
        height: `calc(100vh - ${heightOffset}px)`,
        width: `calc(100vw - ${widthOffset}px)`,
        marginRight: 20,
        ...style,
      }}
    >
      <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-14">
        <div className="w-full md:w-1/2 animate-fade-in">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-teal-500/25 via-cyan-400/15 to-blue-500/10 dark:from-indigo-500/25 dark:via-cyan-400/15 dark:to-transparent blur-xl"
              aria-hidden="true"
            />
            <div className="relative rounded-3xl bg-slate-800/70 backdrop-blur border border-slate-700/60 shadow-xl shadow-black/40 p-6 md:p-8">
              <ErrorArt code={code} />
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-6 animate-slide-up">
          <header className="space-y-3">
            <p className="text-sm font-semibold tracking-wider text-teal-400 dark:text-indigo-400 uppercase">
              {code} {code && typeof code === "number" ? "-" : ""}{" "}
              {resolvedTitle}
            </p>
            <h1
              id="error-title"
              className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300 dark:from-indigo-300 dark:via-white dark:to-cyan-200 bg-clip-text text-transparent"
            >
              {resolvedTitle}
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              {defaultMessage}
              {showPath && (
                <>
                  <span className="mx-2 px-2 py-1 rounded bg-slate-700/60 text-slate-200 font-mono text-sm">
                    {location?.pathname || "/"}
                  </span>
                </>
              )}
            </p>
          </header>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={effectivePrimary.onClick}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 active:from-teal-600 active:to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-900/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 focus-visible:ring-offset-[#0d1b1e] dark:focus-visible:ring-offset-slate-900"
            >
              <span className="inline-block group-hover:-translate-y-0.5 transition-transform">
                {effectivePrimary.label}
              </span>
              <span
                aria-hidden="true"
                className="text-lg leading-none group-hover:translate-x-0.5 transition-transform"
              >
                →
              </span>
            </button>
            <button
              onClick={effectiveSecondary.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700/70 hover:bg-slate-600 active:bg-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 shadow-md shadow-black/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-[#0d1b1e] dark:focus-visible:ring-offset-slate-900"
            >
              {effectiveSecondary.label}
            </button>
          </div>

          <footer className="pt-4 text-xs text-slate-500 leading-relaxed space-y-1">
            <p>
              If you believe this is unexpected, you can retry or contact
              support.
            </p>
            {code && (
              <p className="font-mono opacity-70">Error reference: {code}</p>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
}

function ErrorArt({ code }) {
  const display = String(code).slice(0, 3) || "ERR";
  return (
    <svg
      className="w-full h-52 md:h-64"
      viewBox="0 0 400 260"
      fill="none"
      role="img"
      aria-labelledby="error-ill-title error-ill-desc"
    >
      <title id="error-ill-title">Error state illustration</title>
      <desc id="error-ill-desc">
        Abstract floating shapes representing an error context.
      </desc>
      <rect
        x="0.5"
        y="0.5"
        width="399"
        height="259"
        rx="24"
        fill="url(#grad1)"
        stroke="rgba(255,255,255,0.06)"
      />
      <g filter="url(#glow1)">
        <circle cx="300" cy="70" r="34" fill="url(#grad2)" fillOpacity="0.85" />
      </g>
      <g filter="url(#glow2)">
        <circle cx="120" cy="180" r="46" fill="url(#grad3)" fillOpacity="0.9" />
      </g>
      <g filter="url(#glow3)">
        <circle cx="210" cy="120" r="18" fill="#60A5FA" fillOpacity="0.7" />
      </g>
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        className="font-bold"
        fontSize="72"
        fill="rgba(255,255,255,0.08)"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
      >
        {display}
      </text>
      <defs>
        <linearGradient
          id="grad1"
          x1="0"
          y1="0"
          x2="400"
          y2="260"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient
          id="grad2"
          x1="266"
          y1="36"
          x2="334"
          y2="104"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient
          id="grad3"
          x1="74"
          y1="134"
          x2="166"
          y2="226"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <filter
          id="glow1"
          x="246"
          y="16"
          width="108"
          height="108"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter
          id="glow2"
          x="54"
          y="114"
          width="132"
          height="132"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter
          id="glow3"
          x="184"
          y="94"
          width="52"
          height="52"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
    </svg>
  );
}
