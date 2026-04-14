// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, UtensilsCrossed, ClockIcon, BookMarked, MessageCircle, User } from 'lucide-react'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Home'    },
  { to: '/log',     icon: UtensilsCrossed, label: 'Log'     },
  { to: '/history', icon: ClockIcon,       label: 'History' },
  { to: '/menu',    icon: BookMarked,      label: 'Menu'    },
  { to: '/coach',   icon: MessageCircle,   label: 'Coach'   },
  { to: '/profile', icon: User,            label: 'Profil'  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(8,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl pressable"
                style={{ background: isActive ? 'var(--brand-dim)' : 'transparent' }}
                whileTap={{ scale: 0.88 }}
              >
                <Icon size={20}
                  style={{ color: isActive ? 'var(--brand)' : 'var(--muted)' }}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
                <span className="text-[10px] font-body font-medium"
                  style={{ color: isActive ? 'var(--brand)' : 'var(--muted)' }}>
                  {label}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-dot"
                    className="w-1 h-1 rounded-full absolute -bottom-0.5"
                    style={{ background: 'var(--brand)' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
