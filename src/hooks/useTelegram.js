// src/hooks/useTelegram.js
import { useEffect, useState } from 'react'

export function useTelegram() {
  const tg = window.Telegram?.WebApp

  // Pakai state biar component re-render waktu user data ready
  const [user, setUser] = useState(tg?.initDataUnsafe?.user || null)

  useEffect(() => {
    if (!tg) return

    // Panggil ready() dulu — Telegram SDK butuh ini sebelum data tersedia
    tg.ready()
    tg.expand()
    tg.setHeaderColor('#080B14')
    tg.setBackgroundColor('#080B14')

    // Setelah ready, baca ulang user data — kadang belum tersedia sebelum ready()
    const userData = tg.initDataUnsafe?.user
    if (userData) {
      setUser(userData)
    }
  }, [])

  const telegramId = user?.id || null

  return {
    tg,
    user,
    telegramId,
    firstName:   user?.first_name || 'User',
    username:    user?.username   || null,
    colorScheme: tg?.colorScheme  || 'dark',
    showBack:    (cb) => { tg?.BackButton.show(); tg?.BackButton.onClick(cb) },
    hideBack:    ()   => tg?.BackButton.hide(),
    haptic:      (type = 'light') => tg?.HapticFeedback?.impactOccurred(type),
  }
}