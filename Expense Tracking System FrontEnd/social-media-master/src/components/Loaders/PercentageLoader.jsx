import React from 'react';
import clsx from 'clsx';

/**
 * PercentageLoader Component
 * A customizable circular percentage loader with animated progress
 *
 * @param {Object} props
 * @param {number} props.percentage - The percentage value (0-100)
 * @param {string} props.size - Size of the loader ('sm', 'md', 'lg', or specific pixel value)
 * @param {string} props.trackColor - Color of the background track
 * @param {string} props.progressColor - Color of the progress bar
 * @param {string} props.textColor - Color of the percentage text
 * @param {boolean} props.showPercentage - Whether to show percentage text in center
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const PercentageLoader = ({
  percentage = 0,
  size = 'md',
  trackColor = '#f3f4f6',
  progressColor = '#4f46e5',
  textColor = '#111827',
  showPercentage = true,
  className,
}) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  // Calculate the circumference of the circle
  const radius = 42; // SVG coordinate system
  const circumference = 2 * Math.PI * radius;

  // Calculate the dash offset based on percentage
  const dashOffset = circumference - (circumference * normalizedPercentage) / 100;

  // Determine size dimensions
  const sizeMap = {
    sm: '60px',
    md: '80px',
    lg: '120px'
  };

  const sizeValue = sizeMap[size] || size;

  return (
    <div
      className={clsx('relative inline-flex justify-center items-center', className)}
      style={{ width: sizeValue, height: sizeValue }}
    >
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox="0 0 100 100"
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={trackColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={progressColor}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <div
          className="absolute inset-0 flex items-center justify-center font-semibold"
          style={{ color: textColor }}
        >
          <span>{Math.round(normalizedPercentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default PercentageLoader;
