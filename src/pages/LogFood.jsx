// src/pages/LogFood.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Type, ClipboardList, Upload, CheckCircle, Save } from 'lucide-react'
import { analyzeImage, estimateText, logFood, saveMenu } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'

const TABS = [
  { id: 'foto',  label: 'Foto',   icon: Camera       },
  { id: 'teks',  label: 'Teks',   icon: Type         },
  { id: 'manual',label: 'Manual', icon: ClipboardList },
]

// ── Komponen hasil analisis ──────────────────────────────
function ResultCard({ result, onLog, onSave, loading }) {
  const [menuName, setMenuName] = useState('')
  const [saved,    setSaved]    = useState(false)

  const handleSave = async () => {
    if (!menuName.trim()) return
    await onSave(menuName)
    setSaved(true)
  }

  return (
    <motion.div className="glass-card p-5 mt-5"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <p className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--brand)' }}>
        Hasil Analisis
      </p>
      <p className="font-body text-sm font-medium mb-4">{result.food_description}</p>

      {/* Macro grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Kalori', val: result.calories,  unit: 'kkal', color: '#FF6B35' },
          { label: 'Protein', val: result.protein_g, unit: 'g',    color: '#00E5A0' },
          { label: 'Karbo',   val: result.carbs_g,   unit: 'g',    color: '#00B8FF' },
          { label: 'Lemak',   val: result.fat_g,     unit: 'g',    color: '#FFB800' },
        ].map(({ label, val, unit, color }) => (
          <div key={label} className="rounded-xl p-2.5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="font-display text-base font-bold" style={{ color }}>{val}</p>
            <p className="text-[9px] font-body mt-0.5" style={{ color: 'var(--muted)' }}>{unit}</p>
            <p className="text-[9px] font-body" style={{ color: 'var(--muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Log button */}
      <motion.button onClick={onLog} disabled={loading}
        className="w-full py-3 rounded-xl font-body font-semibold text-sm pressable brand-glow"
        style={{ background: 'var(--brand)', color: '#080B14' }}
        whileTap={{ scale: 0.97 }}>
        {loading ? 'Menyimpan...' : '✓ Log Makanan Ini'}
      </motion.button>

      {/* Save to menu */}
      {!saved ? (
        <div className="flex gap-2 mt-2">
          <input value={menuName} onChange={e => setMenuName(e.target.value)}
            placeholder="Nama menu (opsional)..."
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-body outline-none"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          <motion.button onClick={handleSave} disabled={!menuName.trim()}
            className="px-3 py-2.5 rounded-xl pressable flex items-center gap-1.5"
            style={{ background: 'var(--brand-dim)', color: 'var(--brand)' }}
            whileTap={{ scale: 0.95 }}>
            <Save size={14} />
          </motion.button>
        </div>
      ) : (
        <p className="text-center text-xs font-body mt-2" style={{ color: 'var(--brand)' }}>
          ✓ Tersimpan ke menu
        </p>
      )}
    </motion.div>
  )
}

// ── Tab: Foto ────────────────────────────────────────────
function FotoTab({ telegramId, haptic, onLogged }) {
  const fileRef   = useRef()
  const [preview, setPreview]  = useState(null)
  const [result,  setResult]   = useState(null)
  const [loading, setLoading]  = useState(false)
  const [logged,  setLogged]   = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null); setLogged(false)
    setLoading(true)
    haptic('medium')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await analyzeImage(fd)
      setResult(res.data)
    } catch { alert('Gagal analisis. Coba lagi!') }
    finally { setLoading(false) }
  }

  const handleLog = async () => {
    if (!result) return
    setLoading(true)
    try {
      await logFood({ telegram_id: telegramId, ...result })
      haptic('success')
      setLogged(true)
      onLogged()
    } catch { alert('Gagal log. Coba lagi!') }
    finally { setLoading(false) }
  }

  const handleSave = async (name) => {
    if (!result || !telegramId) return
    await saveMenu({ telegram_id: telegramId, menu_name: name, ...result })
  }

  return (
    <div>
      {/* Upload zone */}
      <motion.div onClick={() => fileRef.current?.click()}
        className="glass-card border-dashed flex flex-col items-center justify-center gap-3 p-10 cursor-pointer pressable"
        style={{ borderColor: 'rgba(0,229,160,0.3)' }}
        whileTap={{ scale: 0.98 }}>
        {preview
          ? <img src={preview} alt="" className="w-full max-h-52 object-cover rounded-xl" />
          : <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center brand-glow"
                style={{ background: 'var(--brand-dim)' }}>
                <Camera size={24} style={{ color: 'var(--brand)' }} />
              </div>
              <p className="font-body text-sm text-center" style={{ color: 'var(--muted)' }}>
                Tap untuk ambil / pilih foto makanan
              </p>
            </>
        }
      </motion.div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFile} />

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <motion.div className="w-4 h-4 rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--brand)' }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
          <p className="text-sm font-body" style={{ color: 'var(--muted)' }}>
            Gemini lagi analisis...
          </p>
        </div>
      )}

      {result && !logged && (
        <ResultCard result={result} onLog={handleLog} onSave={handleSave} loading={loading} />
      )}

      {logged && (
        <motion.div className="glass-card p-5 mt-5 flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={32} style={{ color: 'var(--brand)' }} />
          <p className="font-display font-semibold">Berhasil di-log!</p>
        </motion.div>
      )}
    </div>
  )
}

// ── Tab: Teks ────────────────────────────────────────────
function TeksTab({ telegramId, haptic, onLogged }) {
  const [text,   setText]   = useState('')
  const [result, setResult] = useState(null)
  const [loading,setLoading]= useState(false)
  const [logged, setLogged] = useState(false)

  const handleEstimate = async () => {
    if (!text.trim()) return
    setLoading(true); haptic('light')
    try {
      const res = await estimateText(text.trim())
      setResult(res.data)
    } catch { alert('Gagal estimasi. Coba lagi!') }
    finally { setLoading(false) }
  }

  const handleLog = async () => {
    if (!result) return
    setLoading(true)
    try {
      await logFood({ telegram_id: telegramId, ...result })
      haptic('success'); setLogged(true); onLogged()
    } catch { alert('Gagal log.') }
    finally { setLoading(false) }
  }

  const handleSave = async (name) => {
    await saveMenu({ telegram_id: telegramId, menu_name: name, ...result })
  }

  return (
    <div>
      <div className="glass-card p-4">
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); setLogged(false) }}
          placeholder="Deskripsikan makanannya...&#10;Contoh: nasi goreng 1 porsi, telur mata sapi, es teh manis"
          rows={4}
          className="w-full bg-transparent outline-none resize-none font-body text-sm leading-relaxed"
          style={{ color: 'var(--text)' }} />
      </div>

      <motion.button onClick={handleEstimate} disabled={!text.trim() || loading}
        className="w-full mt-3 py-3 rounded-xl font-body font-semibold text-sm pressable"
        style={{ background: text.trim() ? 'var(--brand)' : 'var(--surface)', color: text.trim() ? '#080B14' : 'var(--muted)' }}
        whileTap={{ scale: 0.97 }}>
        {loading ? 'Estimasi...' : '🔍 Estimasi Nutrisi'}
      </motion.button>

      {result && !logged && (
        <ResultCard result={result} onLog={handleLog} onSave={handleSave} loading={loading} />
      )}
      {logged && (
        <motion.div className="glass-card p-5 mt-5 flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={32} style={{ color: 'var(--brand)' }} />
          <p className="font-display font-semibold">Berhasil di-log!</p>
        </motion.div>
      )}
    </div>
  )
}

// ── Tab: Manual ──────────────────────────────────────────
function ManualTab({ telegramId, haptic, onLogged }) {
  const [form, setForm] = useState({ food_description: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const [loading, setLoading] = useState(false)
  const [logged,  setLogged]  = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.food_description && form.calories

  const handleLog = async () => {
    if (!valid) return
    setLoading(true); haptic('medium')
    try {
      await logFood({
        telegram_id:      telegramId,
        food_description: form.food_description,
        calories:         parseFloat(form.calories)  || 0,
        protein_g:        parseFloat(form.protein_g) || 0,
        carbs_g:          parseFloat(form.carbs_g)   || 0,
        fat_g:            parseFloat(form.fat_g)     || 0,
      })
      haptic('success'); setLogged(true); onLogged()
    } catch { alert('Gagal log.') }
    finally { setLoading(false) }
  }

  const fields = [
    { key: 'food_description', label: 'Nama Makanan', placeholder: 'Nasi Padang', type: 'text', required: true },
    { key: 'calories',  label: 'Kalori (kkal)', placeholder: '450',   type: 'number' },
    { key: 'protein_g', label: 'Protein (g)',   placeholder: '25',    type: 'number' },
    { key: 'carbs_g',   label: 'Karbo (g)',     placeholder: '60',    type: 'number' },
    { key: 'fat_g',     label: 'Lemak (g)',     placeholder: '15',    type: 'number' },
  ]

  if (logged) return (
    <motion.div className="glass-card p-5 flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <CheckCircle size={32} style={{ color: 'var(--brand)' }} />
      <p className="font-display font-semibold">Berhasil di-log!</p>
    </motion.div>
  )

  return (
    <div className="flex flex-col gap-3">
      {fields.map(({ key, label, placeholder, type, required }) => (
        <div key={key} className="glass-card p-4">
          <label className="text-[10px] font-body font-medium mb-1.5 block"
            style={{ color: 'var(--muted)' }}>
            {label}{required && <span style={{ color: 'var(--brand)' }}> *</span>}
          </label>
          <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none font-body text-sm"
            style={{ color: 'var(--text)' }} />
        </div>
      ))}

      <motion.button onClick={handleLog} disabled={!valid || loading}
        className="w-full py-3 rounded-xl font-body font-semibold text-sm pressable"
        style={{ background: valid ? 'var(--brand)' : 'var(--surface)', color: valid ? '#080B14' : 'var(--muted)' }}
        whileTap={{ scale: 0.97 }}>
        {loading ? 'Menyimpan...' : '✓ Log Makanan'}
      </motion.button>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────
export default function LogFood() {
  const { telegramId, haptic } = useTelegram()
  const [tab,        setTab]   = useState('foto')
  const [loggedCount, setLoggedCount] = useState(0)

  const onLogged = () => setLoggedCount(c => c + 1)

  return (
    <div className="pb-24 min-h-screen bg-grid">
      <div className="px-5 pt-6 pb-4">
        <motion.h1 className="font-display text-2xl font-bold"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          Log Makanan
        </motion.h1>
        {loggedCount > 0 && (
          <p className="text-xs font-body mt-1" style={{ color: 'var(--brand)' }}>
            ✓ {loggedCount}x di-log hari ini
          </p>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 px-5 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <motion.button key={id}
            onClick={() => { setTab(id); haptic('light') }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-medium pressable"
            style={{
              background: tab === id ? 'var(--brand)' : 'var(--surface)',
              color:      tab === id ? '#080B14'       : 'var(--muted)',
            }}
            whileTap={{ scale: 0.95 }}>
            <Icon size={13} />
            {label}
          </motion.button>
        ))}
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}>
            {tab === 'foto'   && <FotoTab   telegramId={telegramId} haptic={haptic} onLogged={onLogged} />}
            {tab === 'teks'   && <TeksTab   telegramId={telegramId} haptic={haptic} onLogged={onLogged} />}
            {tab === 'manual' && <ManualTab telegramId={telegramId} haptic={haptic} onLogged={onLogged} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
