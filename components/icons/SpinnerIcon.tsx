
import React from 'react';

const SpinnerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`${className} animate-spin`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.696a8.25 8.25 0 01-11.667 0c-1.112-1.111-1.112-2.91 0-4.022l3.182-3.182m4.991 2.696a8.25 8.25 0 010 11.667l-3.182 3.182"
    />
  </svg>
);

export default SpinnerIcon;
