import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard',  icon: '▪' },
  { to: '/deals',     label: 'Deals',       icon: '▪' },
  { to: '/payments',  label: 'Payments',    icon: '▪' },
  { to: '/invoices',  label: 'Invoices',    icon: '▪' },
  { to: '/ratecard',  label: 'Rate Card',   icon: '▪' },
  { to: '/mediakit', label: 'Media Kit',    icon: '▪' },
  { to: '/settings', label: 'Settings',    icon: '▪' },
  { to: '/reports',  label: 'Reports',     icon: '▪' },

]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { influencer, logout } = useAuth()

  const initials = influencer?.name
    ? influencer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'IN'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[215px] z-50 flex flex-col
          bg-dark-700 border-r border-white/[0.06]
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <span className="text-[15px] font-semibold gradient-text">DealTrack</span>
          <p className="text-[11px] text-white/25 mt-0.5">Influencer manager</p>
        </div>

        {/* Profile */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
          {influencer?.instagram_pic_url ? (
            <img
              src={`https://dealtracker-backend.onrender.com/instagram-image?url=${encodeURIComponent(
                influencer.instagram_pic_url
              )}`}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f97316, #eab308)'
              }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white/85 truncate">{influencer?.name}</p>
            <p className="text-[11px] text-white/30 truncate">
              @{influencer?.instagram_handle} {influencer?.instagram_followers && (  <> · {(influencer.instagram_followers / 1000).toFixed(1)}k followers</>)}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150
                ${isActive
                  ? 'text-orange-400 font-medium border-l-2 border-orange-400 pl-[10px]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'linear-gradient(90deg, rgba(249,115,22,0.08), rgba(234,179,8,0.04))' }
                  : {}
              }
            >
              {label}
            </NavLink>
          ))}

          {/* <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-white/20 cursor-default">
            Reports
            <span className="ml-auto text-[9px] bg-amber-500/10 text-amber-500/60 px-2 py-0.5 rounded-full">soon</span>
          </div> */}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-white/[0.06]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
              text-[13px] text-white/35 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
