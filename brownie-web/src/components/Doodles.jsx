// Hand-drawn SVG doodle illustrations for Brownie Master
// All inline SVGs — no external files needed

export function BrownieDoodle({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Brownie square */}
      <rect x="15" y="30" width="70" height="50" rx="8" fill="#6D4C41" stroke="#12283C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Chocolate drizzle */}
      <path d="M25 45 Q40 35 55 45 Q70 55 85 45" stroke="#12283C" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Chips */}
      <circle cx="35" cy="62" r="5" fill="#12283C" />
      <circle cx="55" cy="68" r="4" fill="#4E342E" />
      <circle cx="72" cy="60" r="4.5" fill="#12283C" />
      {/* Steam lines */}
      <path d="M35 28 Q37 20 35 12" stroke="#5B7C97" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M50 26 Q52 18 50 10" stroke="#5B7C97" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M65 28 Q67 20 65 12" stroke="#5B7C97" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Sparkle */}
      <path d="M88 20 L90 15 L92 20 L97 22 L92 24 L90 29 L88 24 L83 22 Z" fill="#6FB1DC" />
    </svg>
  )
}

export function CrownDoodle({ size = 40 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 32 L12 10 L22 24 L30 4 L38 24 L48 10 L55 32 Z"
        fill="#6FB1DC" stroke="#C25E12" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="12" cy="10" r="3" fill="#FFD54F" />
      <circle cx="30" cy="4" r="3" fill="#FFD54F" />
      <circle cx="48" cy="10" r="3" fill="#FFD54F" />
    </svg>
  )
}

export function SparkleCluster({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 5 L27 15 L37 17 L27 19 L25 29 L23 19 L13 17 L23 15 Z" fill="#6FB1DC" opacity="0.8" />
      <path d="M40 30 L41 35 L46 36 L41 37 L40 42 L39 37 L34 36 L39 35 Z" fill="#FF8C42" opacity="0.7" />
      <path d="M10 35 L11 39 L15 40 L11 41 L10 45 L9 41 L5 40 L9 39 Z" fill="#6FB1DC" opacity="0.6" />
    </svg>
  )
}

export function HeartDoodle({ size = 24, color = "#D64545" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21 C12 21 3 14 3 8.5 C3 5 6 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18 3 21 5 21 8.5 C21 14 12 21 12 21Z"
        fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

export function MoneyDoodle({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coin */}
      <circle cx="25" cy="25" r="18" fill="#FFD54F" stroke="#F9A825" strokeWidth="2.5" />
      <circle cx="25" cy="25" r="13" stroke="#F9A825" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="25" y="31" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#C25E12">$</text>
      {/* Sparkles */}
      <path d="M44 8 L45 12 L49 13 L45 14 L44 18 L43 14 L39 13 L43 12 Z" fill="#6FB1DC" />
      <path d="M6 38 L7 41 L10 42 L7 43 L6 46 L5 43 L2 42 L5 41 Z" fill="#FF8C42" />
    </svg>
  )
}

export function BoxDoodle({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box */}
      <path d="M8 18 L25 10 L42 18 L42 38 L25 46 L8 38 Z" fill="#5B7C97" stroke="#1A4E7A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 18 L25 26 L42 18" stroke="#1A4E7A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M25 26 L25 46" stroke="#1A4E7A" strokeWidth="2" />
      {/* Ribbon */}
      <path d="M16 14 L25 18 L34 14" stroke="#6FB1DC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 18 L25 26" stroke="#6FB1DC" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function ClipboardDoodle({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="30" height="38" rx="4" fill="#FFFFFF" stroke="#1A4E7A" strokeWidth="2.5" />
      <rect x="18" y="4" width="14" height="8" rx="3" fill="#4A7FA8" stroke="#1A4E7A" strokeWidth="2" />
      {/* Lines */}
      <line x1="16" y1="20" x2="34" y2="20" stroke="#C9DCEA" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="27" x2="30" y2="27" stroke="#C9DCEA" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="34" x2="32" y2="34" stroke="#C9DCEA" strokeWidth="2" strokeLinecap="round" />
      {/* Checkmark */}
      <path d="M16 20 L20 24 L28 16" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChartDoodle({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bars */}
      <rect x="8" y="28" width="8" height="16" rx="2" fill="#4A7FA8" stroke="#1A4E7A" strokeWidth="1.5" />
      <rect x="21" y="18" width="8" height="26" rx="2" fill="#6FB1DC" stroke="#C25E12" strokeWidth="1.5" />
      <rect x="34" y="10" width="8" height="34" rx="2" fill="#FF8C42" stroke="#1A4E7A" strokeWidth="1.5" />
      {/* Arrow */}
      <path d="M6 46 L44 46" stroke="#1A4E7A" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 38 Q20 30 25 22 Q30 14 40 8" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" fill="none" />
      {/* Star */}
      <path d="M42 6 L43 9 L46 10 L43 11 L42 14 L41 11 L38 10 L41 9 Z" fill="#6FB1DC" />
    </svg>
  )
}

export function EmptyCartDoodle({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cart */}
      <path d="M25 35 L35 35 L50 75 L90 75" stroke="#C9DCEA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 45 L92 45 L85 70 L48 70 Z" fill="#EEF5FA" stroke="#C9DCEA" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="55" cy="82" r="5" fill="#C9DCEA" />
      <circle cx="82" cy="82" r="5" fill="#C9DCEA" />
      {/* Dotted brownie */}
      <rect x="55" y="50" width="20" height="14" rx="3" stroke="#C9DCEA" strokeWidth="2" strokeDasharray="4 3" />
      {/* Question mark */}
      <text x="65" y="62" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="10" fill="#C9DCEA">?</text>
      {/* Arrow pointing down */}
      <path d="M65 90 L65 105 M60 100 L65 105 L70 100" stroke="#5B7C97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  )
}

export function CelebrationDoodle({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Confetti pieces */}
      <rect x="15" y="20" width="8" height="4" rx="2" fill="#6FB1DC" transform="rotate(-30 15 20)" />
      <rect x="75" y="15" width="8" height="4" rx="2" fill="#FF8C42" transform="rotate(20 75 15)" />
      <rect x="45" y="10" width="6" height="3" rx="1.5" fill="#D64545" transform="rotate(-15 45 10)" />
      <rect x="85" y="40" width="7" height="3.5" rx="1.5" fill="#FFD54F" transform="rotate(35 85 40)" />
      <rect x="10" y="55" width="6" height="3" rx="1.5" fill="#FF8C42" transform="rotate(-25 10 55)" />
      {/* Stars */}
      <path d="M20 35 L22 30 L24 35 L29 37 L24 39 L22 44 L20 39 L15 37 Z" fill="#6FB1DC" />
      <path d="M80 60 L81 57 L82 60 L85 61 L82 62 L81 65 L80 62 L77 61 Z" fill="#FFD54F" />
      <path d="M50 25 L51 22 L52 25 L55 26 L52 27 L51 30 L50 27 L47 26 Z" fill="#FF8C42" />
      {/* Circles */}
      <circle cx="30" cy="70" r="3" fill="#6FB1DC" opacity="0.7" />
      <circle cx="70" cy="30" r="2.5" fill="#D64545" opacity="0.6" />
      <circle cx="60" cy="75" r="3.5" fill="#FF8C42" opacity="0.5" />
      <circle cx="90" cy="25" r="2" fill="#FFD54F" opacity="0.7" />
      {/* Streamers */}
      <path d="M35 15 Q40 25 35 35" stroke="#D64545" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M65 10 Q70 22 65 30" stroke="#6FB1DC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  )
}

export function WavyUnderline({ width = 200, color = "#6FB1DC" }) {
  return (
    <svg width={width} height="8" viewBox={`0 0 ${width} 8`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={`M0 4 ${Array.from({ length: Math.ceil(width / 20) }, (_, i) =>
          `Q${i * 20 + 5} ${i % 2 === 0 ? 0 : 8} ${i * 20 + 10} 4 Q${i * 20 + 15} ${i % 2 === 0 ? 8 : 0} ${(i + 1) * 20} 4`
        ).join(' ')}`}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function SleepyFace({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Brownie body */}
      <rect x="10" y="20" width="60" height="45" rx="10" fill="#6D4C41" stroke="#12283C" strokeWidth="2.5" />
      {/* Closed eyes */}
      <path d="M25 38 Q30 42 35 38" stroke="#12283C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M45 38 Q50 42 55 38" stroke="#12283C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sleepy mouth */}
      <path d="M32 50 Q40 54 48 50" stroke="#12283C" strokeWidth="2" strokeLinecap="round" />
      {/* Zzz */}
      <text x="62" y="18" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="12" fill="#5B7C97" opacity="0.6">z</text>
      <text x="68" y="10" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="10" fill="#5B7C97" opacity="0.4">z</text>
    </svg>
  )
}
