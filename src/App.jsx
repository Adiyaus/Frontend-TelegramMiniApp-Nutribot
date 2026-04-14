// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomNav   from './components/BottomNav'
import Dashboard   from './pages/Dashboard'
import LogFood     from './pages/LogFood'
import History     from './pages/History'
import SavedMenus  from './pages/SavedMenus'
import AskCoach    from './pages/AskCoach'
import Profile     from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/"        element={<Dashboard  />} />
            <Route path="/log"     element={<LogFood    />} />
            <Route path="/history" element={<History    />} />
            <Route path="/menu"    element={<SavedMenus />} />
            <Route path="/coach"   element={<AskCoach   />} />
            <Route path="/profile" element={<Profile    />} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
