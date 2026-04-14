// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Zap, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import CalorieRing from '../components/CalorieRing'
import MacroBar from '../components/MacroBar'
import FoodCard from '../components/FoodCard'
import { useTelegram } from '../hooks/useTelegram'
import { getUserSummary, getStreak, deleteLog } from '../api/client'

export default function Dashboard() {
  const { telegramId, firstName } = useTelegram()
  const [summary,  setSummary]  = useState(null)
  const [foodList, setFoodList] = useState([])
  const [streak,   setStreak]   = useState(0)
  const [user,     setUser]     = useState(null)
  const [loading,  setLoading]  = useState(true)

  const load = async () => {
    if (!telegramId) return
    try {
      const [sumRes, strRes] = await Promise.all([
        getUserSummary(telegramId),
        getStreak(telegramId)
      ])
      setSummary(sumRes.data.summary)
      setFoodList(sumRes.data.foodList)
      setStreak(strRes.data.streak)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [telegramId])

  const handleDelete = async (id) => {
    await deleteLog(id, telegramId)
    load()
  }

  const goal     = user?.daily_calorie_goal || 2000
  const consumed = Math.round(summary?.total_calories || 0)
  const mealCount = summary?.meal_count || 0

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <motion.div className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--brand)' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  return (
    <div className="pb-24 bg-grid min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-body" style={{ color: 'var(--muted)' }}>
            Selamat datang kembali 👋
          </p>
          <h1 className="font-display text-2xl font-bold mt-0.5">
            {firstName}
          </h1>
        </motion.div>
      </div>

      {/* Stats row */}
      <motion.div className="flex gap-3 px-5 mb-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {[
          { icon: Flame,  label: 'Streak',   val: `${streak}d`,    color: '#FF6B35' },
          { icon: Zap,    label: 'Makan',    val: `${mealCount}x`, color: '#00B8FF' },
          { icon: Trophy, label: 'Target',   val: `${goal} kkal`,  color: '#00E5A0' },
        ].map(({ icon: Icon, label, val, color }) => (
          <div key={label} className="glass-card flex-1 p-3 flex flex-col items-center gap-1">
            <Icon size={16} style={{ color }} />
            <span className="font-display text-base font-bold" style={{ color }}>{val}</span>
            <span className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Calorie ring */}
      <motion.div className="flex justify-center mb-5"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring' }}>
        <CalorieRing consumed={consumed} goal={goal} />
      </motion.div>

      {/* Macro bar */}
      <motion.div className="px-5 mb-5"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}>
        <MacroBar
          protein={summary?.total_protein || 0}
          carbs={summary?.total_carbs || 0}
          fat={summary?.total_fat || 0}
        />
      </motion.div>

      {/* Today's food list */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold">Log Hari Ini</h2>
          <Link to="/history" className="text-xs font-body"
            style={{ color: 'var(--brand)' }}>Lihat semua →</Link>
        </div>

        {foodList.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm font-body" style={{ color: 'var(--muted)' }}>
              Belum ada log hari ini
            </p>
            <Link to="/log">
              <motion.button
                className="mt-3 px-5 py-2 rounded-xl text-sm font-body font-medium pressable"
                style={{ background: 'var(--brand-dim)', color: 'var(--brand)' }}
                whileTap={{ scale: 0.95 }}>
                + Log Sekarang
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {foodList.slice(0, 4).map((food, i) => (
              <FoodCard key={food.id} food={food} index={i} onDelete={handleDelete} />
            ))}
            {foodList.length > 4 && (
              <Link to="/history" className="text-center text-xs font-body py-2"
                style={{ color: 'var(--muted)' }}>
                +{foodList.length - 4} lainnya
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
