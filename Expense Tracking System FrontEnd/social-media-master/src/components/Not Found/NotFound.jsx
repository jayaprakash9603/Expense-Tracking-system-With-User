import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

/*
  Beautiful 404 / Not Found page
  - Full viewport height with centered card
  - Responsive illustration (inline SVG – no network cost)
  - Shows attempted path
  - Primary actions: Go Home, Go Back
  - Accessible landmarks & aria labels
  - Tailwind-first classes (falls back gracefully if Tailwind not present)
*/

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  const goHome = () => navigate("/", { replace: true });
  const goBack = () => navigate(-1);

  return (
    <main
      className="flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1b1e] via-[#103038] to-[#081417] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10 text-slate-200 overflow-auto rounded-xl shadow-inner shadow-black/40"
      role="main"
      aria-labelledby="nf-title"
      style={{
        height: "calc(100vh - 100px)",
        width: "calc(100vw - 370px)",
        marginRight: 20,
      }}
    >
      <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-14">
        {/* Illustration */}
        <div className="w-full md:w-1/2 animate-fade-in">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-teal-500/25 via-cyan-400/15 to-blue-500/10 dark:from-indigo-500/25 dark:via-cyan-400/15 dark:to-transparent blur-xl"
              aria-hidden="true"
            />
            <div className="relative rounded-3xl bg-slate-800/70 backdrop-blur border border-slate-700/60 shadow-xl shadow-black/40 p-6 md:p-8">
              <SVGDecoration />
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="w-full md:w-1/2 space-y-6 animate-slide-up">
          <header className="space-y-3">
            <p className="text-sm font-semibold tracking-wider text-teal-400 dark:text-indigo-400 uppercase">
              Error 404
            </p>
            <h1
              id="nf-title"
              className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300 dark:from-indigo-300 dark:via-white dark:to-cyan-200 bg-clip-text text-transparent"
            >
              Page not found
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              We looked everywhere, but couldn&apos;t find a page at
              <span className="mx-2 px-2 py-1 rounded bg-slate-700/60 text-slate-200 font-mono text-sm">
                {location?.pathname || "/unknown"}
              </span>
              . It may have been moved, renamed, or removed.
            </p>
          </header>

          {/* Suggested actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={goHome}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 active:from-teal-600 active:to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-900/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 focus-visible:ring-offset-[#0d1b1e] dark:focus-visible:ring-offset-slate-900"
            >
              <span className="inline-block group-hover:-translate-y-0.5 transition-transform">
                Go Home
              </span>
              <span
                aria-hidden="true"
                className="text-lg leading-none group-hover:translate-x-0.5 transition-transform"
              >
                →
              </span>
            </button>
            <button
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700/70 hover:bg-slate-600 active:bg-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 shadow-md shadow-black/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-[#0d1b1e] dark:focus-visible:ring-offset-slate-900"
            >
              Go Back
            </button>
          </div>

          <footer className="pt-4 text-xs text-slate-500 leading-relaxed">
            <p>
              If you believe this is an error, you can refresh the page or
              contact support with the URL above.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

function SVGDecoration() {
  return (
    <svg
      className="w-full h-52 md:h-64"
      viewBox="0 0 400 260"
      fill="none"
      role="img"
      aria-labelledby="nf-ill-title nf-ill-desc"
    >
      <title id="nf-ill-title">Lost in space illustration</title>
      <desc id="nf-ill-desc">
        Abstract floating shapes conveying lost navigation state.
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
        404
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
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
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
