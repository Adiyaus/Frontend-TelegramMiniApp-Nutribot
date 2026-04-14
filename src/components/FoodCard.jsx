// src/components/FoodCard.jsx
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export default function FoodCard({ food, onDelete, index = 0 }) {
  // Format jam WIB dari logged_at
  const time = food.logged_at ? (() => {
    const d = new Date(food.logged_at)
    const h = String((d.getUTCHours() + 7) % 24).padStart(2, '0')
    const m = String(d.getUTCMinutes()).padStart(2, '0')
    return `${h}:${m}`
  })() : ''

  return (
    <motion.div
      className="glass-card p-4 flex items-center gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Calorie badge */}
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center"
        style={{ background: 'var(--brand-dim)' }}>
        <span className="text-sm font-display font-bold leading-none"
          style={{ color: 'var(--brand)' }}>
          {Math.round(food.calories)}
        </span>
        <span className="text-[9px] font-body" style={{ color: 'var(--brand)' }}>kkal</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-body font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
          {food.food_description}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {[
            { label: 'P', val: food.protein_g, color: '#00E5A0' },
            { label: 'K', val: food.carbs_g,   color: '#00B8FF' },
            { label: 'L', val: food.fat_g,     color: '#FF6B35' },
          ].map(({ label, val, color }) => (
            <span key={label} className="text-[10px] font-body font-medium"
              style={{ color }}>
              {label} {parseFloat(val).toFixed(0)}g
            </span>
          ))}
          {time && (
            <span className="text-[10px] font-body ml-auto" style={{ color: 'var(--muted)' }}>
              {time}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      {onDelete && (
        <motion.button
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center pressable"
          style={{ background: 'var(--warn-dim)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onDelete(food.id)}
        >
          <Trash2 size={14} style={{ color: 'var(--warn)' }} />
        </motion.button>
      )}
    </motion.div>
  )
}
