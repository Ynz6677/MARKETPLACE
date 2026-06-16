/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SVGLogoProps {
  className?: string;
  size?: number;
}

export const SVGLogo: React.FC<SVGLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(255,107,0,0.4)] transition-all duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="metallicOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFAE42" />
            <stop offset="35%" stopColor="#FF6B00" />
            <stop offset="70%" stopColor="#D84A00" />
            <stop offset="10%" stopColor="#FFA03A" />
            <stop offset="100%" stopColor="#802000" />
          </linearGradient>
          
          <linearGradient id="glowHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF2A00" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FF8C00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE082" stopOpacity="1" />
          </linearGradient>

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        <g filter="url(#softShadow)">
          <path
            d="M 22 65 C 10 50, 15 25, 34 25 C 44 25, 48 35, 39 48 C 30 60, 42 78, 58 78 C 68 78, 85 64, 88 32 C 89 26, 84 24, 82 28 C 76 40, 68 62, 54 62 C 44 62, 38 52, 48 38 C 55 28, 48 10, 32 10 C 12 10, 2 30, 10 60 C 15 78, 38 90, 56 90 C 74 90, 88 78, 88 70 C 88 66, 82 66, 81 70 C 76 78, 62 82, 53 82 C 34 82, 28 72, 22 65 Z"
            fill="url(#metallicOrange)"
          />
          <path
            d="M 52 35 C 58 22, 70 20, 80 20 C 84 20, 82 26, 78 30 C 68 40, 50 64, 50 64 C 50 64, 46 45, 52 35 Z"
            fill="url(#glowHighlight)"
          />
        </g>
      </svg>
    </div>
  );
};
