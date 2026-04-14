// src/pages/SavedMenus.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle, BookMarked } from 'lucide-react'
import { getMenus, logFromMenu, deleteMenu } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'

function MenuCard({ menu, onLog, onDelete, loggedId }) {
  const justLogged = loggedId === menu.id

  return (
    <motion.div className="glass-card p-4 flex items-center gap-3"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}>
      {/* Left: name + macros */}
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm truncate">{menu.menu_name}</p>
        <p className="text-[10px] font-body mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
          {menu.food_description}
        </p>
        <div className="flex gap-2 mt-1.5">
          <span className="text-xs font-display font-bold" style={{ color: '#FF6B35' }}>
            {Math.round(menu.calories)} kkal
          </span>
          <span className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>
            P:{menu.protein_g}g · K:{menu.carbs_g}g · L:{menu.fat_g}g
          </span>
        </div>
        {menu.use_count > 0 && (
          <p className="text-[10px] font-body mt-1" style={{ color: 'var(--muted)' }}>
            Dipakai {menu.use_count}×
          </p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <motion.button onClick={() => onLog(menu.id)}
          className="px-3 py-2 rounded-xl text-xs font-body font-semibold pressable flex items-center gap-1"
          style={{ background: justLogged ? 'var(--brand)' : 'var(--brand-dim)', color: justLogged ? '#080B14' : 'var(--brand)' }}
          whileTap={{ scale: 0.92 }}>
          {justLogged ? <CheckCircle size={12} /> : null}
          {justLogged ? 'Done!' : 'Log'}
        </motion.button>
        <motion.button onClick={() => onDelete(menu.id)}
          className="px-3 py-2 rounded-xl text-xs font-body pressable flex items-center justify-center"
          style={{ background: 'var(--warn-dim)', color: 'var(--warn)' }}
          whileTap={{ scale: 0.92 }}>
          <Trash2 size={12} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function SavedMenus() {
  const { telegramId, haptic } = useTelegram()
  const [menus,    setMenus]   = useState([])
  const [loading,  setLoading] = useState(true)
  const [loggedId, setLoggedId]= useState(null)

  const load = async () => {
    if (!telegramId) return
    try {
      const res = await getMenus(telegramId)
      setMenus(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [telegramId])

  const handleLog = async (id) => {
    haptic('medium')
    try {
      await logFromMenu(id, telegramId)
      setLoggedId(id)
      haptic('success')
      setTimeout(() => setLoggedId(null), 2000)
    } catch { alert('Gagal log menu.') }
  }

  const handleDelete = async (id) => {
    haptic('heavy')
    setMenus(m => m.filter(x => x.id !== id))
    await deleteMenu(id, telegramId)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <motion.div className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--brand)' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  return (
    <div className="pb-24 min-h-screen bg-grid">
      <div className="px-5 pt-6 pb-4">
        <motion.h1 className="font-display text-2xl font-bold"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          Menu Tersimpan
        </motion.h1>
        <p className="text-xs font-body mt-1" style={{ color: 'var(--muted)' }}>
          {menus.length} menu · tap Log buat catat langsung
        </p>
      </div>

      <div className="px-5 flex flex-col gap-2">
        {menus.length === 0 ? (
          <motion.div className="glass-card p-10 text-center flex flex-col items-center gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BookMarked size={32} style={{ color: 'var(--muted)' }} />
            <div>
              <p className="font-body font-medium text-sm">Belum ada menu tersimpan</p>
              <p className="text-xs font-body mt-1" style={{ color: 'var(--muted)' }}>
                Log makanan dulu, lalu simpan ke menu
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {menus.map((menu, i) => (
              <motion.div key={menu.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <MenuCard menu={menu} onLog={handleLog} onDelete={handleDelete} loggedId={loggedId} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
