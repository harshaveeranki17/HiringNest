// components/HiringNestLogo.tsx
'use client';

import Image from 'next/image';

export function HiringNestLogo({ 
  size = 'default',
  showText = true 
}: { 
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}) {
  const sizeMap = {
    sm: 40,
    default: 60,
    lg: 80
  };

  const textSizeMap = {
    sm: 'text-lg',
    default: 'text-2xl',
    lg: 'text-3xl'
  };

  const logoSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Top teal/blue house shape */}
        <path
          d="M100 30L160 70L160 100C160 110 155 120 145 125L55 125C45 120 40 110 40 100L40 70L100 30Z"
          fill="#0891b2"
        />

        {/* Inner darker house */}
        <path
          d="M100 50L140 80L140 100C140 105 137 110 130 112L70 112C63 110 60 105 60 100L60 80L100 50Z"
          fill="#0c4a6e"
        />

        {/* Team circles - center person (larger) */}
        <circle cx="100" cy="85" r="10" fill="white" />

        {/* Team circles - left person */}
        <circle cx="75" cy="95" r="8" fill="white" />

        {/* Team circles - right person */}
        <circle cx="125" cy="95" r="8" fill="white" />

        {/* Orange/brown circular bottom (basket) */}
        <g>
          {/* Outer orange circle band */}
          <circle cx="100" cy="140" r="50" fill="#b8860b" opacity="0.9" />
          <circle cx="100" cy="140" r="45" fill="#cd853f" opacity="0.8" />
          <circle cx="100" cy="140" r="40" fill="#daa520" opacity="0.7" />
          
          {/* Inner lighter band */}
          <circle cx="100" cy="140" r="35" fill="#f0e68c" opacity="0.6" />
        </g>

        {/* Left leaf */}
        <g transform="translate(45, 50)">
          <ellipse cx="0" cy="0" rx="8" ry="15" fill="#84cc16" transform="rotate(-30)" />
          <ellipse cx="5" cy="-8" rx="6" ry="12" fill="#bfef45" transform="rotate(-25)" />
        </g>

        {/* Right leaves */}
        <g transform="translate(155, 50)">
          <ellipse cx="0" cy="0" rx="8" ry="15" fill="#84cc16" transform="rotate(30)" />
          <ellipse cx="-5" cy="-8" rx="6" ry="12" fill="#bfef45" transform="rotate(25)" />
        </g>

        {/* Top left leaf */}
        <g transform="translate(55, 35)">
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="#84cc16" transform="rotate(-40)" />
        </g>

        {/* Top right leaf */}
        <g transform="translate(145, 35)">
          <ellipse cx="0" cy="0" rx="7" ry="14" fill="#84cc16" transform="rotate(40)" />
        </g>
      </svg>

      {showText && (
        <div className={`font-bold ${textSizeMap[size]}`}>
          <span className="bg-gradient-to-r from-cyan-600 to-blue-900 bg-clip-text text-transparent">
            Hiring
          </span>
          <span className="text-orange-600">Nest</span>
        </div>
      )}
    </div>
  );
}

export default HiringNestLogo;
