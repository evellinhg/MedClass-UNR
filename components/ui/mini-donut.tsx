interface MiniDonutProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
}

export function MiniDonut({
  percentage,
  size = 56,
  strokeWidth = 6,
  color = "#22c55e",
  trackColor = "rgba(148,163,184,0.25)",
  label,
}: MiniDonutProps) {
  const clamped = Math.max(0, Math.min(100, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">{label ?? `${clamped}%`}</span>
    </div>
  )
}
