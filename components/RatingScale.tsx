'use client'

import { useState } from 'react'

interface RatingScaleProps {
  value: number
  onChange: (value: number) => void
  compact?: boolean
}

const ratingColor = (n: number) => {
  if (n <= 3) return 'bg-red-500'
  if (n <= 5) return 'bg-orange-400'
  if (n <= 7) return 'bg-yellow-400'
  return 'bg-green-500'
}

export default function RatingScale({ value, onChange, compact = false }: RatingScaleProps) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`} onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const isActive = n <= active
        const isSelected = n === value
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onClick={() => onChange(n)}
            className={`
              relative ${compact ? 'w-5 h-5' : 'w-7 h-7'} rounded text-xs font-bold transition-all duration-150
              ${isActive
                ? `${ratingColor(active)} text-white scale-110 shadow-lg`
                : 'bg-surface border border-border text-muted hover:border-accent'
              }
              ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-card' : ''}
            `}
          >
            {n}
          </button>
        )
      })}
      {!compact && value > 0 && (
        <span className="ml-1 text-sm text-muted">
          <span className={`font-bold ${ratingColor(value).replace('bg-', 'text-')}`}>{value}</span>
          /10
        </span>
      )}
    </div>
  )
}
