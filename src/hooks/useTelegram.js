// src/hooks/useTelegram.js
// Wrapper untuk Telegram Mini App SDK
import { useEffect, useState } from 'react'

export function useTelegram() {
  const tg   = window.Telegram?.WebApp
  const user = tg?.initDataUnsafe?.user

  useEffect(() => {
    if (!tg) return
    tg.ready()                          // kasih tau Telegram app udah siap
    tg.expand()                         // expand ke full screen
    tg.setHeaderColor('#080B14')        // warna header sesuai bg
    tg.setBackgroundColor('#080B14')
  }, [])

  return {
    tg,
    user,
    telegramId:  user?.id || null,
    firstName:   user?.first_name || 'User',
    username:    user?.username || null,
    colorScheme: tg?.colorScheme || 'dark',
    // Helper: show Telegram's native back button
    showBack:    (cb) => { tg?.BackButton.show(); tg?.BackButton.onClick(cb) },
    hideBack:    ()   => tg?.BackButton.hide(),
    // Helper: haptic feedback
    haptic:      (type = 'light') => tg?.HapticFeedback.impactOccurred(type),
  }
}
