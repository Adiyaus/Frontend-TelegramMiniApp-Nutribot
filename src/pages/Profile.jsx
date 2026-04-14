// src/pages/Profile.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { getUser, getWeeklyLogs, getStreak } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'

const ACTIVITY_LABELS = {
  sedentary:   'Santai banget',
  light:       'Gerak dikit',
  moderate:    'Lumayan aktif',
  active:      'Aktif banget',
  very_active: 'Super aktif',
}

function StatItem({ label, value, sub, color = 'var(--brand)' }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-1">
      <p className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

// Custom tooltip buat chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs font-body">
      <p style={{ color: 'var(--muted)' }}>{label}</p>
      <p style={{ color: 'var(--brand)' }}>{payload[0].value} kkal</p>
    </div>
  )
}

export default function Profile() {
  const { telegramId } = useTelegram()
  const [user,   setUser]   = useState(null)
  const [logs,   setLogs]   = useState([])
  const [streak, setStreak] = useState(0)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    if (!telegramId) return
    Promise.all([
      getUser(telegramId),
      getWeeklyLogs(telegramId),
      getStreak(telegramId)
    ]).then(([u, l, s]) => {
      setUser(u.data)
      setLogs(l.data)
      setStreak(s.data.streak)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [telegramId])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <motion.div className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--brand)' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <p className="font-body text-sm" style={{ color: 'var(--muted)' }}>
        User tidak ditemukan. Daftar dulu lewat bot ya!
      </p>
    </div>
  )

  // Prepare weekly chart data — group by date
  const chartData = (() => {
    const byDate = {}
    logs.forEach(l => {
      byDate[l.log_date] = (byDate[l.log_date] || 0) + Number(l.calories)
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cal]) => ({
        day:  new Date(date).toLocaleDateString('id', { weekday: 'short' }),
        kkal: Math.round(cal)
      }))
  })()

  const bmi = user.height_cm
    ? (user.weight_kg / Math.pow(user.height_cm / 100, 2)).toFixed(1)
    : null

  const bmiLabel = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null

  const bmiColor = bmi
    ? bmi < 18.5 ? '#00B8FF' : bmi < 25 ? '#00E5A0' : bmi < 30 ? '#FFB800' : '#FF6B35'
    : 'var(--brand)'

  return (
    <div className="pb-24 min-h-screen bg-grid">
      {/* Header avatar */}
      <div className="px-5 pt-8 pb-5 flex flex-col items-center text-center">
        <motion.div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-3 brand-glow"
          style={{ background: 'var(--brand-dim)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}>
          <span className="font-display text-3xl font-bold" style={{ color: 'var(--brand)' }}>
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </motion.div>
        <h1 className="font-display text-2xl font-bold">{user.name}</h1>
        <p className="text-xs font-body mt-1" style={{ color: 'var(--muted)' }}>
          {user.gender} · {user.age} tahun · {ACTIVITY_LABELS[user.activity_level] || '-'}
        </p>
      </div>

      {/* Stats grid */}
      <motion.div className="grid grid-cols-2 gap-2.5 px-5 mb-5"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>
        <StatItem label="Berat Badan"  value={`${user.weight_kg} kg`}   />
        <StatItem label="Tinggi Badan" value={`${user.height_cm} cm`}   color="#00B8FF" />
        <StatItem label="BMI"          value={bmi || '-'}
          sub={bmiLabel} color={bmiColor} />
        <StatItem label="Streak"       value={`${streak} hari 🔥`}      color="#FF6B35" />
        <StatItem label="Target Kalori" value={`${Math.round(user.daily_calorie_goal)} kkal`} />
        <StatItem label="Target Berat"  value={user.target_weight ? `${user.target_weight} kg` : 'Belum diset'}
          color={user.target_weight ? '#FFB800' : 'var(--muted)'} />
      </motion.div>

      {/* Calorie breakdown */}
      <motion.div className="glass-card mx-5 p-4 mb-5 grid grid-cols-3 gap-3 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {[
          { label: 'BMR',  val: Math.round(user.bmr),  color: 'var(--muted)' },
          { label: 'TDEE', val: Math.round(user.tdee), color: '#00B8FF' },
          { label: 'Target', val: Math.round(user.daily_calorie_goal), color: 'var(--brand)' },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <p className="font-display text-lg font-bold" style={{ color }}>{val}</p>
            <p className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Weekly chart */}
      {chartData.length > 0 && (
        <motion.div className="glass-card mx-5 p-4"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <p className="font-display text-sm font-semibold mb-4">Kalori 7 Hari Terakhir</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00E5A0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00E5A0" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="kkal"
                stroke="#00E5A0" strokeWidth={2}
                fill="url(#areaGrad)" dot={{ fill: '#00E5A0', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Goal line indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-5 h-px" style={{ background: '#FF6B35' }} />
            <span className="text-[10px] font-body" style={{ color: 'var(--muted)' }}>
              Target: {Math.round(user.daily_calorie_goal)} kkal/hari
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
