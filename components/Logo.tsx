export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="#141414"/>
      <rect x="4" y="12" width="24" height="16" rx="2.5" fill="#1c1c1c"/>
      <rect x="4" y="5" width="24" height="8" rx="2.5" fill="#e50914"/>
      <clipPath id="clapper-clip">
        <rect x="4" y="5" width="24" height="8" rx="2.5"/>
      </clipPath>
      <g clipPath="url(#clapper-clip)">
        <line x1="9"  y1="4"  x2="4"  y2="14" stroke="white" strokeWidth="2.2" opacity="0.30"/>
        <line x1="15" y1="4"  x2="10" y2="14" stroke="white" strokeWidth="2.2" opacity="0.30"/>
        <line x1="21" y1="4"  x2="16" y2="14" stroke="white" strokeWidth="2.2" opacity="0.30"/>
        <line x1="27" y1="4"  x2="22" y2="14" stroke="white" strokeWidth="2.2" opacity="0.30"/>
        <line x1="33" y1="4"  x2="28" y2="14" stroke="white" strokeWidth="2.2" opacity="0.30"/>
      </g>
      <rect x="4" y="12" width="24" height="1.5" fill="#141414"/>
      <polygon
        points="16,15.5 17.29,19.22 21.23,19.3 18.09,21.68 19.23,25.45 16,23.2 12.77,25.45 13.91,21.68 10.77,19.3 14.71,19.22"
        fill="#e50914"
      />
    </svg>
  )
}
