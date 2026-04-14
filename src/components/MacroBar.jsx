// src/components/MacroBar.jsx
import { motion } from 'framer-motion'

const MACROS = [
  { key: 'protein', label: 'Protein', color: '#00E5A0', unit: 'g' },
  { key: 'carbs',   label: 'Karbo',   color: '#00B8FF', unit: 'g' },
  { key: 'fat',     label: 'Lemak',   color: '#FF6B35', unit: 'g' },
]

export default function MacroBar({ protein = 0, carbs = 0, fat = 0 }) {
  const total = protein + carbs + fat || 1

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-body mb-3" style={{ color: 'var(--muted)' }}>
        Makro Nutrisi
      </p>

      {/* Stacked bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-4"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        {[
          { pct: protein / total, color: '#00E5A0' },
          { pct: carbs   / total, color: '#00B8FF' },
          { pct: fat     / total, color: '#FF6B35' },
        ].map(({ pct, color }, i) => (
          <motion.div key={i}
            style={{ background: color, height: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        {[
          { label: 'Protein', val: protein, color: '#00E5A0' },
          { label: 'Karbo',   val: carbs,   color: '#00B8FF' },
          { label: 'Lemak',   val: fat,     color: '#FF6B35' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-display font-bold" style={{ color }}>
              {parseFloat(val).toFixed(1)}g
            </span>
            <span className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
