import React from 'react';

export const SchedulerPlanLogo: React.FC = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock Face (Left Side) */}
      <circle
        cx="35"
        cy="50"
        r="28"
        fill="#1e3a8a"
      />
      
      {/* Clock Hour Markers */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
        const angle = (hour * 30 - 90) * (Math.PI / 180);
        const x1 = 35 + 22 * Math.cos(angle);
        const y1 = 50 + 22 * Math.sin(angle);
        const x2 = 35 + 25 * Math.cos(angle);
        const y2 = 50 + 25 * Math.sin(angle);
        return (
          <line
            key={hour}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#f5f5f5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      
      {/* Clock Hands */}
      {/* Hour hand pointing to 7 */}
      <line
        x1="35"
        y1="50"
        x2="35"
        y2="42"
        stroke="#f5f5f5"
        strokeWidth="3"
        strokeLinecap="round"
        transform="rotate(30 35 50)"
      />
      {/* Minute hand pointing to 12 */}
      <line
        x1="35"
        y1="50"
        x2="35"
        y2="30"
        stroke="#f5f5f5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Calendar (Right Side) */}
      <rect
        x="50"
        y="20"
        width="45"
        height="60"
        rx="4"
        fill="#ffffff"
        stroke="#1e3a8a"
        strokeWidth="2"
      />
      
      {/* Calendar Binding Loops */}
      <circle cx="60" cy="25" r="2" fill="#1e3a8a" />
      <circle cx="85" cy="25" r="2" fill="#1e3a8a" />
      
      {/* Calendar Grid - Top Row (Orange U and 25) */}
      <rect x="52" y="30" width="12" height="12" fill="#f97316" rx="1" />
      <path
        d="M 56 34 L 56 40 L 60 40 L 60 38 L 58 38 L 58 36 L 62 36 L 62 34 Z"
        fill="#ffffff"
      />
      
      <rect x="66" y="30" width="12" height="12" fill="#f97316" rx="1" />
      <text
        x="72"
        y="40"
        fontSize="8"
        fill="#ffffff"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        25
      </text>
      
      {/* Calendar Grid - Middle Row (Clock overlap, Person, Empty) */}
      <rect x="52" y="44" width="12" height="12" fill="#1e3a8a" />
      <rect x="66" y="44" width="12" height="12" fill="#1e3a8a" />
      
      {/* Person with Graduation Cap */}
      <rect x="70" y="48" width="4" height="6" fill="#ffffff" rx="0.5" />
      <rect x="69" y="46" width="6" height="4" fill="#ffffff" rx="1" />
      <rect x="70" y="44" width="4" height="2" fill="#1e3a8a" />
      <circle cx="72" cy="45" r="0.5" fill="#ffffff" />
      
      <rect x="80" y="44" width="12" height="12" fill="#1e3a8a" />
      
      {/* Calendar Grid - Bottom Row */}
      <rect x="52" y="58" width="12" height="12" fill="#1e3a8a" />
      <rect x="66" y="58" width="12" height="12" fill="#1e3a8a" />
      <rect x="80" y="58" width="12" height="12" fill="#1e3a8a" />
    </svg>
  );
};

