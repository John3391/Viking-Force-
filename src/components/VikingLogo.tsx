import React from 'react';

interface VikingLogoProps {
  className?: string;
  size?: number;
}

export const VikingLogo: React.FC<VikingLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]`}
    >
      {/* Outer circular background glow */}
      <circle cx="256" cy="256" r="230" fill="url(#bgGrad)" stroke="#d4af37" strokeWidth="4" strokeDasharray="10 5 2 5" className="animate-spin-slow opacity-80" />
      <circle cx="256" cy="256" r="220" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Decorative Outer Jagged/Crack lines */}
      <path
        d="M 120 50 L 150 70 M 392 50 L 362 70 M 50 256 L 80 256 M 462 256 L 432 256 M 120 462 L 150 442 M 392 462 L 362 442"
        stroke="#d4af37"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* JAGGED LOGO TEXT: TEAM (Top) */}
      <g id="team-text" className="select-none">
        {/* T */}
        <path d="M 170 110 L 210 110 M 190 110 L 190 140 M 180 140 L 200 140" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* E */}
        <path d="M 220 110 L 245 110 M 220 125 L 240 125 M 220 140 L 245 140 M 220 110 L 220 140" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* A */}
        <path d="M 255 140 L 267 110 L 280 140 M 259 130 L 276 130" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* M */}
        <path d="M 290 140 L 290 110 L 305 128 L 320 110 L 320 140" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* JAGGED LOGO TEXT: JOHN (Bottom) */}
      <g id="john-text" className="select-none">
        {/* J */}
        <path d="M 185 385 L 210 385 M 198 385 L 198 410 C 198 420 185 420 180 415" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* O */}
        <ellipse cx="232" cy="402" rx="14" ry="17" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        {/* H */}
        <path d="M 260 385 L 260 420 M 280 385 L 280 420 M 260 402 L 280 402" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* N */}
        <path d="M 295 420 L 295 385 L 320 420 L 320 385" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* THE HEAVY BARBELL */}
      <g id="barbell">
        {/* Steel Bar */}
        <path d="M 40 256 L 472 256" stroke="url(#barbellGrad)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Left Collar & Sleeve */}
        <rect x="75" y="246" width="10" height="20" fill="#d4af37" rx="2" stroke="#140e0c" strokeWidth="1" />
        <rect x="35" y="248" width="40" height="16" fill="#888888" rx="1" />

        {/* Right Collar & Sleeve */}
        <rect x="427" y="246" width="10" height="20" fill="#d4af37" rx="2" stroke="#140e0c" strokeWidth="1" />
        <rect x="437" y="248" width="40" height="16" fill="#888888" rx="1" />

        {/* Left Bumper Plates */}
        <g id="left-plates" className="filter drop-shadow-[-3px_0_5px_rgba(0,0,0,0.5)]">
          <rect x="85" y="196" width="14" height="120" fill="#111111" stroke="#d4af37" strokeWidth="1.5" rx="4" />
          <rect x="102" y="201" width="12" height="110" fill="#d4af37" stroke="#111" strokeWidth="1.5" rx="3" />
          <rect x="117" y="206" width="10" height="100" fill="#222222" rx="2" />
          <rect x="130" y="211" width="8" height="90" fill="#d4af37" rx="2" />
        </g>

        {/* Right Bumper Plates */}
        <g id="right-plates" className="filter drop-shadow-[3px_0_5px_rgba(0,0,0,0.5)]">
          <rect x="413" y="196" width="14" height="120" fill="#111111" stroke="#d4af37" strokeWidth="1.5" rx="4" />
          <rect x="398" y="201" width="12" height="110" fill="#d4af37" stroke="#111" strokeWidth="1.5" rx="3" />
          <rect x="385" y="206" width="10" height="100" fill="#222222" rx="2" />
          <rect x="374" y="211" width="8" height="90" fill="#d4af37" rx="2" />
        </g>
      </g>

      {/* THE VIKING WARRIOR WITH RAM HORNS */}
      <g id="viking-warrior">
        {/* Horns Back Shadow */}
        <path d="M 180 200 C 140 180, 140 140, 180 150 C 190 152, 200 170, 210 185 Z" fill="#0d0908" />
        <path d="M 332 200 C 372 180, 372 140, 332 150 C 322 152, 312 170, 302 185 Z" fill="#0d0908" />

        {/* Left Curved Ram Horn */}
        <path 
          d="M 215 190 C 170 170, 150 120, 185 105 C 220 90, 230 140, 225 180" 
          fill="url(#hornGrad)" 
          stroke="#d4af37" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        {/* Horn ridges/stripes (Left) */}
        <path d="M 195 145 C 190 135, 180 125, 185 115" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 210 165 C 200 155, 190 145, 195 135" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 220 180 C 215 170, 205 160, 208 150" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />

        {/* Right Curved Ram Horn */}
        <path 
          d="M 297 190 C 342 170, 362 120, 327 105 C 292 90, 282 140, 287 180" 
          fill="url(#hornGrad)" 
          stroke="#d4af37" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        {/* Horn ridges/stripes (Right) */}
        <path d="M 317 145 C 322 135, 332 125, 327 115" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 302 165 C 312 155, 322 145, 317 135" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 292 180 C 297 170, 307 160, 304 150" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />

        {/* Muscular Shoulders & Traps (background of head) */}
        <path d="M 160 290 Q 210 240, 256 240 Q 302 240, 352 290 L 330 330 L 182 330 Z" fill="#140e0c" stroke="#d4af37" strokeWidth="2" />
        <path d="M 180 290 Q 210 265, 235 275" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.5" />
        <path d="M 332 290 Q 302 265, 277 275" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.5" />

        {/* Massive Chest (Pecs) */}
        <path d="M 190 320 C 210 300, 240 300, 256 312 C 272 300, 302 300, 322 320 C 300 350, 270 355, 256 355 C 242 355, 212 350, 190 320 Z" fill="#0d0908" stroke="#d4af37" strokeWidth="2" />
        <path d="M 256 312 L 256 355" stroke="#d4af37" strokeWidth="2" />

        {/* Muscular Arms holding the bar (Hands/Wrists) */}
        {/* Left Arm/Grip */}
        <path d="M 155 256 C 145 240, 165 220, 175 240 L 175 265 Z" fill="#d4af37" stroke="#111" strokeWidth="1.5" />
        {/* Right Arm/Grip */}
        <path d="M 357 256 C 367 240, 347 220, 337 240 L 337 265 Z" fill="#d4af37" stroke="#111" strokeWidth="1.5" />

        {/* Viking Head & Helmet base */}
        <path d="M 224 175 C 224 150, 288 150, 288 175 L 280 215 C 280 240, 232 240, 232 215 Z" fill="#222" stroke="#d4af37" strokeWidth="1.5" />
        
        {/* Viking Eyes / Glowing Golden Eyes */}
        <rect x="238" y="185" width="10" height="4" rx="1" fill="#d4af37" className="animate-pulse" />
        <rect x="264" y="185" width="10" height="4" rx="1" fill="#d4af37" className="animate-pulse" />
        <path d="M 234 180 L 248 184 M 278 180 L 264 184" stroke="#d4af37" strokeWidth="2" /> {/* Angry Eyebrows */}

        {/* Epic Long Braided Viking Beard */}
        <path 
          d="M 226 210 C 226 250, 240 330, 256 345 C 272 330, 286 250, 286 210 C 276 220, 236 220, 226 210 Z" 
          fill="url(#beardGrad)" 
          stroke="#d4af37" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        {/* Beard texture lines */}
        <path d="M 242 225 C 244 250, 248 280, 256 315" stroke="#111" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 270 225 C 268 250, 264 280, 256 315" stroke="#111" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 256 220 C 256 250, 256 280, 256 335" stroke="#111" strokeWidth="2" strokeOpacity="0.6" />

        {/* Iron Belt with Celtic Studs */}
        <path d="M 205 345 L 307 345 L 295 375 L 217 375 Z" fill="#222" stroke="#d4af37" strokeWidth="2" />
        <circle cx="225" cy="360" r="4" fill="#d4af37" />
        <circle cx="256" cy="360" r="7" fill="#d4af37" stroke="#111" strokeWidth="1" />
        <circle cx="287" cy="360" r="4" fill="#d4af37" />
      </g>

      {/* DEFINITIONS & GRADIENTS */}
      <defs>
        {/* Background Radial Gradient */}
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1210" />
          <stop offset="75%" stopColor="#0d0908" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Horn Gradient */}
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eee" />
          <stop offset="50%" stopColor="#9e8a55" />
          <stop offset="100%" stopColor="#1e1510" />
        </linearGradient>

        {/* Beard Gradient */}
        <linearGradient id="beardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e0d3a8" />
          <stop offset="70%" stopColor="#bfa96b" />
          <stop offset="100%" stopColor="#543e1e" />
        </linearGradient>

        {/* Barbell Gradient */}
        <linearGradient id="barbellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#444" />
          <stop offset="30%" stopColor="#aaa" />
          <stop offset="50%" stopColor="#fff" />
          <stop offset="70%" stopColor="#aaa" />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
      </defs>
    </svg>
  );
};
