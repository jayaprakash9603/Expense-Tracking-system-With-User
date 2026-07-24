import React from "react";

const ScrollingTextBanner = ({
  text,
  color = "#f59e0b",
  durationSeconds = 18,
  className = "",
  ariaLabel,
}) => {
  if (!text) {
    return null;
  }

  return (
    <div
      className={`scrolling-text-banner ${className}`.trim()}
      aria-label={ariaLabel || text}
    >
      <div
        className="scrolling-text-banner__track"
        style={{
          animationDuration: `${durationSeconds}s`,
          color,
        }}
      >
        {text}
      </div>
      <style>{`
        .scrolling-text-banner {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
        }

        .scrolling-text-banner__track {
          white-space: nowrap;
          display: inline-block;
          padding-right: 48px;
          font-size: 12px;
          font-weight: 500;
          animation-name: scrollingTextBanner;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes scrollingTextBanner {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 768px) {
          .scrolling-text-banner__track {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingTextBanner;
