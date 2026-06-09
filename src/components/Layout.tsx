import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import Sidebar from './Sidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/deals':     'Deals',
  '/payments':  'Payments',
  '/invoices':  'Invoices',
  '/ratecard':  'Rate Card',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'DealTrack'

  return (
    <div className="flex h-screen overflow-hidden bg-dark-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0
          bg-dark-700 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white/70
                hover:bg-white/[0.05] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="text-[14px] font-medium text-white/85">{title}</h1>
          </div>

          <Link
            to="/deals"
            className="btn-primary text-[12px] px-3 py-2 min-h-[36px] rounded-lg"
          >
            + New deal
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
