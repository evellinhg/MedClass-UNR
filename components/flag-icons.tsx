export function BrazilFlag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 14" width="18" height="13" {...props}>
      <rect width="20" height="14" rx="1.5" fill="#009739" />
      <polygon points="10,2 18,7 10,12 2,7" fill="#FEDD00" />
      <circle cx="10" cy="7" r="3.2" fill="#012169" />
    </svg>
  )
}

export function ArgentinaFlag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 14" width="18" height="13" {...props}>
      <rect width="20" height="14" rx="1.5" fill="#fff" />
      <rect width="20" height="4.67" rx="1.5" fill="#74ACDF" />
      <rect y="9.33" width="20" height="4.67" fill="#74ACDF" />
      <path d="M0 9.33h20v3.17a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 0 12.5z" fill="#74ACDF" />
      <circle cx="10" cy="7" r="1.6" fill="#F6B40E" stroke="#85340A" strokeWidth="0.15" />
    </svg>
  )
}
