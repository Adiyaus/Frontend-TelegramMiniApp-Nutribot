// src/components/CalorieRing.jsx
import { motion } from 'framer-motion'

export default function CalorieRing({ consumed = 0, goal = 2000, size = 220 }) {
  const pct      = Math.min(consumed / goal, 1)
  const over     = consumed > goal
  const r        = (size - 24) / 2
  const circ     = 2 * Math.PI * r
  const dash     = pct * circ
  const cx       = size / 2
  const cy       = size / 2
  const remaining = Math.max(goal - consumed, 0)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Track ring */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={12} />

        {/* Progress ring */}
        <motion.circle cx={cx} cy={cy} r={r} fill="none"
          stroke={over ? '#FF6B35' : 'url(#brandGrad)'}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Gradient def */}
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00E5A0" />
            <stop offset="100%" stopColor="#00B8FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="flex flex-col items-center z-10">
        <motion.span
          className="font-display text-4xl font-bold leading-none"
          style={{ color: over ? '#FF6B35' : '#00E5A0' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {consumed.toLocaleString()}
        </motion.span>
        <span className="text-xs font-body mt-1" style={{ color: 'var(--muted)' }}>
          dari {goal.toLocaleString()} kkal
        </span>
        <span className="text-xs font-body mt-0.5 font-medium"
          style={{ color: over ? '#FF6B35' : 'var(--brand)' }}>
          {over ? `+${(consumed - goal).toLocaleString()} over` : `${remaining.toLocaleString()} sisa`}
        </span>
      </div>
    </div>
  )
}
