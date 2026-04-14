// src/api/client.js
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 30000 })

// ── User ──────────────────────────────────────────────────
export const getUser         = (id)         => api.get(`/user/${id}`)
export const getUserSummary  = (id)         => api.get(`/user/${id}/summary`)
export const getWeeklyLogs   = (id)         => api.get(`/user/${id}/weekly`)
export const getStreak       = (id)         => api.get(`/user/${id}/streak`)

// ── Food Logs ─────────────────────────────────────────────
export const analyzeImage    = (formData)   => api.post('/food-logs/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const estimateText    = (text)       => api.post('/food-logs/estimate-text', { text })
export const logFood         = (data)       => api.post('/food-logs', data)
export const deleteLog       = (id, tgId)   => api.delete(`/food-logs/${id}`, { data: { telegram_id: tgId } })
export const resetLogs       = (tgId)       => api.delete(`/food-logs/reset/${tgId}`)

// ── Saved Menus ───────────────────────────────────────────
export const getMenus        = (id)         => api.get(`/menus/${id}`)
export const saveMenu        = (data)       => api.post('/menus', data)
export const logFromMenu     = (id, tgId)   => api.post(`/menus/${id}/log`, { telegram_id: tgId })
export const deleteMenu      = (id, tgId)   => api.delete(`/menus/${id}`, { data: { telegram_id: tgId } })

// ── AI ────────────────────────────────────────────────────
export const askCoach        = (tgId, q)    => api.post('/ai/ask', { telegram_id: tgId, question: q })

export default api
