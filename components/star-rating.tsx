"use client"

import { useState } from "react"
import { Star } from "lucide-react"

const STAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"]

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readOnly = false, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => !readOnly && setHover(0)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value} de 5 estrelas` : "Avaliação de 1 a 5 estrelas"}
    >
      {STAR_COLORS.map((color, i) => {
        const starValue = i + 1
        const filled = starValue <= display

        if (readOnly) {
          return (
            <Star
              key={i}
              width={size}
              height={size}
              color={color}
              fill={filled ? color : "none"}
              strokeWidth={1.5}
            />
          )
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHover(starValue)}
            aria-label={`${starValue} estrela${starValue > 1 ? "s" : ""}`}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star width={size} height={size} color={color} fill={filled ? color : "none"} strokeWidth={1.5} />
          </button>
        )
      })}
    </div>
  )
}
