// src/pages/AskCoach.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { askCoach } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'

const SUGGESTIONS = [
  'Olahraga apa yang cocok buat aku?',
  'Berapa protein yang aku butuhkan per hari?',
  'Kenapa aku lapar terus padahal udah makan?',
  'Boleh makan nasi di malam hari?',
  'Cara atasi plateau diet gimana?',
]

function ChatBubble({ msg, idx }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.02 }}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: isUser ? 'var(--brand-dim)' : 'rgba(0,184,255,0.15)' }}>
        {isUser
          ? <User size={13} style={{ color: 'var(--brand)' }} />
          : <Bot  size={13} style={{ color: '#00B8FF' }} />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed
        ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={{
          background:  isUser ? 'var(--brand-dim)' : 'var(--glass)',
          color:       'var(--text)',
          border:      `1px solid ${isUser ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
          whiteSpace:  'pre-wrap',
        }}>
        {msg.content}
      </div>
    </motion.div>
  )
}

export default function AskCoach() {
  const { telegramId, haptic } = useTelegram()
  const [messages,  setMessages]  = useState([
    { role: 'assistant', content: 'Heyy! Gua Coach NutriBot 🤖\n\nTanya aja soal diet, nutrisi, atau olahraga — gua jawab berdasarkan data profil lo! 💪' }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef               = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    haptic('light')

    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)

    try {
      const res = await askCoach(telegramId, q)
      setMessages(m => [...m, { role: 'assistant', content: res.data.answer }])
      haptic('success')
    } catch (e) {
      const msg = e.response?.status === 429
        ? 'API lagi overload nih. Tunggu sebentar ya! ⏳'
        : 'Waduh ada error. Coba lagi! 😵'
      setMessages(m => [...m, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-grid">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center brand-glow"
            style={{ background: 'var(--brand-dim)' }}>
            <Sparkles size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">Coach NutriBot</h1>
            <p className="text-[10px] font-body" style={{ color: 'var(--brand)' }}>
              ● Online · Personalized AI
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        style={{ paddingBottom: '120px' }}>
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} idx={i} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div className="flex gap-2.5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,184,255,0.15)' }}>
              <Bot size={13} style={{ color: '#00B8FF' }} />
            </div>
            <div className="glass-card px-4 py-3 flex gap-1 items-center rounded-tl-sm">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--muted)' }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggestions — only show on fresh start */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-[10px] font-body px-1" style={{ color: 'var(--muted)' }}>
              Coba tanya:
            </p>
            {SUGGESTIONS.map(s => (
              <motion.button key={s} onClick={() => handleSend(s)}
                className="glass-card px-4 py-2.5 text-left text-xs font-body pressable"
                whileTap={{ scale: 0.97 }}
                style={{ color: 'var(--text)' }}>
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2"
        style={{ background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <div className="flex gap-2 items-end glass-card p-2 pl-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Tanya soal diet & nutrisi..."
            className="flex-1 bg-transparent outline-none font-body text-sm py-1.5"
            style={{ color: 'var(--text)' }}
          />
          <motion.button onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center pressable shrink-0"
            style={{ background: input.trim() ? 'var(--brand)' : 'var(--surface)' }}
            whileTap={{ scale: 0.9 }}>
            <Send size={15} style={{ color: input.trim() ? '#080B14' : 'var(--muted)' }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
