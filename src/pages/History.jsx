// src/pages/History.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw } from 'lucide-react'
import { getUserSummary, deleteLog, resetLogs } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import FoodCard from '../components/FoodCard'

export default function History() {
  const { telegramId, haptic } = useTelegram()
  const [foodList, setFoodList] = useState([])
  const [summary,  setSummary]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [confirm,  setConfirm]  = useState(false)

  const load = async () => {
    if (!telegramId) return
    try {
      const res = await getUserSummary(telegramId)
      setFoodList(res.data.foodList)
      setSummary(res.data.summary)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [telegramId])

  const handleDelete = async (id) => {
    haptic('medium')
    setFoodList(f => f.filter(x => x.id !== id))
    await deleteLog(id, telegramId)
    load()
  }

  const handleReset = async () => {
    haptic('heavy')
    setConfirm(false)
    await resetLogs(telegramId)
    setFoodList([])
    load()
  }

  const totalCal = Math.round(summary?.total_calories || 0)

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <motion.div className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--brand)' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  return (
    <div className="pb-24 min-h-screen bg-grid">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-end justify-between">
        <div>
          <motion.h1 className="font-display text-2xl font-bold"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            Riwayat Hari Ini
          </motion.h1>
          <p className="text-xs font-body mt-1" style={{ color: 'var(--muted)' }}>
            {foodList.length} log · {totalCal} kkal total
          </p>
        </div>
        {foodList.length > 0 && (
          <motion.button onClick={() => setConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body pressable"
            style={{ background: 'var(--warn-dim)', color: 'var(--warn)' }}
            whileTap={{ scale: 0.95 }}>
            <RotateCcw size={12} /> Reset Semua
          </motion.button>
        )}
      </div>

      {/* Confirm reset dialog */}
      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setConfirm(false)} />
            <motion.div className="relative w-full glass-card rounded-b-none p-6"
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <p className="font-display text-lg font-bold mb-1">Reset log hari ini?</p>
              <p className="text-sm font-body mb-5" style={{ color: 'var(--muted)' }}>
                {foodList.length} log ({totalCal} kkal) akan dihapus. Gak bisa di-undo!
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-body font-medium text-sm"
                  style={{ background: 'var(--surface)' }}>
                  Batalin
                </button>
                <button onClick={handleReset}
                  className="flex-1 py-3 rounded-xl font-body font-semibold text-sm"
                  style={{ background: 'var(--warn)', color: '#080B14' }}>
                  Ya, Reset!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food list */}
      <div className="px-5">
        {foodList.length === 0 ? (
          <motion.div className="glass-card p-10 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-2xl mb-2">🍽️</p>
            <p className="font-body text-sm" style={{ color: 'var(--muted)' }}>
              Belum ada log makanan hari ini
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {foodList.map((food, i) => (
              <motion.div key={food.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.04 }}
                className="mb-2">
                <FoodCard food={food} index={i} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
