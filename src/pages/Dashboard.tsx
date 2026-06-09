import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { DashboardData, Deal } from '../types'
import StatusBadge from '../components/StatusBadge'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}k`
  return `₹${n}`
}

function daysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  return diff
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5 page-container">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-white/5 rounded-xl" />
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [instagram, setInstagram] = useState<any>(null)
  // const { influencer } = useAuth()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/')

        setData({
          total_earned_this_month: res.data.stats.total_earned_this_month,
          total_earned_all_time: res.data.stats.total_earned_all_time,
          active_deals_count: res.data.stats.active_deals_count,
          pending_payment_amount: res.data.stats.pending_payment_amount,
          pending_payment_count: res.data.stats.pending_payment_count,
          deadlines_this_week: res.data.deadlines_this_week,
          pending_payments: res.data.pending_deals,
          recent_deals: res.data.recent_deals,
          monthly_income: [],
          top_brands: [],
        } as DashboardData)
        console.log("API RESPONSE:", res.data)
        setInstagram(res.data.instagram)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) return <Skeleton />
  console.log("DASHBOARD DATA:", data)
  if (!data) return <p className="page-container text-white/30 text-sm">Failed to load dashboard.</p>
  
  return (
    <div className="page-container">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 border-orange-500/20" style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(234,179,8,0.04))' }}>
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Total earned</p>
          <p className="text-xl font-semibold gradient-text">{fmt(data.total_earned_this_month)}</p>
          <p className="text-[10px] text-white/25 mt-0.5">this month</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Active deals</p>
          <p className="text-xl font-semibold text-white/85">{data.active_deals_count}</p>
          <p className="text-[10px] text-white/25 mt-0.5">in progress</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Pending payment</p>
          <p className="text-xl font-semibold text-red-400">{fmt(data.pending_payment_amount)}</p>
          <p className="text-[10px] text-white/25 mt-0.5">{data.pending_payment_count} brands</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Deadlines</p>
          <p className="text-xl font-semibold text-amber-400">{data.deadlines_this_week.length}</p>
          <p className="text-[10px] text-white/25 mt-0.5">this week</p>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div className="card p-4">
          <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
            Upcoming deadlines
          </h3>
          {(data.deadlines_this_week || []).length === 0 ? (
            <p className="text-sm text-white/25 py-2">No upcoming deadlines 🎉</p>
          ) : (
            <div className="space-y-0">
              {(data.deadlines_this_week || []).map((d: Deal) => {
                const days = d?.deadline ? daysLeft(d.deadline) : 0
                return (
                  <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-[13px] font-medium text-white/80">{d?.brand_name || "Unknown"}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{d?.deliverables || ""}</p>
                    </div>
                    <span className={`text-[11px] font-medium ${days <= 3 ? 'text-red-400' : 'text-white/35'}`}>
                      {days <= 0 ? 'Overdue!' : `${days}d left`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending payments */}
        <div className="card p-4">
          <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
            Pending payments
          </h3>
          {(data.pending_payments || []).length === 0 ? (
            <p className="text-sm text-white/25 py-2">All payments received 🎉</p>
          ) : (
            <div className="space-y-0">
              {(data.pending_payments || []).map((d: any) => {
                const overdue = d?.deadline ? daysLeft(d.deadline) : 0
                return (
                  <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-[13px] font-medium text-white/80">{d?.brand_name || "Unknown"}</p>
                      <p className="text-[11px] text-red-400/70 mt-0.5">
                        {overdue < 0 ? `${Math.abs(overdue)} days overdue` : `Due in ${overdue}d`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-red-400">{fmt(d.amount)}</p>
                      <Link to="/invoices" className="text-[10px] text-orange-400/70 hover:text-orange-400 mt-0.5 block">
                        Send invoice →
                      </Link>
                      <button
                        onClick={async () => {
                          const res = await api.get(`/whatsapp/reminder/${d.id}`)
                          window.open(res.data.link, "_blank")
                        }}
                        className="text-[10px] text-green-400/70 hover:text-green-400 mt-0.5 block"
                      >
                        Send Reminder →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent deals */}
      <div className="card p-4">
        <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
          Recent deals
        </h3>

      {/* Instagram card */}
      {instagram?.followers ? (
        <div className="card p-4">
          <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
            Instagram
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.02] rounded-lg p-3 text-center">
              <p className="text-lg font-semibold gradient-text">
                {instagram.followers >= 1000
                  ? `${(instagram.followers / 1000).toFixed(1)}k`
                  : instagram.followers}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">Followers</p>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-white/70">
                {instagram.posts ?? '—'}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">Posts</p>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-white/70 truncate">
                @{instagram.handle}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">Handle</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4 flex items-center justify-between">
          <p className="text-sm text-white/30">Instagram not connected</p>
          <a href="/settings" className="btn-outline text-xs px-3 min-h-0 py-1.5">
            Connect →
          </a>

          <button
            onClick={async () => {
              const handle = prompt("Enter Instagram handle")
              if (!handle) return

              await api.get(`/instagram/fetch?handle=${handle}`)
              window.location.reload()
            }}
            className="btn-outline text-xs mt-3"
          >
            Sync Instagram
          </button>
        </div>
      )}

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-white/25 uppercase tracking-wider">
                <th className="text-left pb-2 pr-4">Brand</th>
                <th className="text-left pb-2 pr-4">Deliverables</th>
                <th className="text-left pb-2 pr-4">Amount</th>
                <th className="text-left pb-2 pr-4">Deadline</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(data.recent_deals || []).map((d: Deal) => (
                <tr key={d.id}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold text-orange-400 flex-shrink-0"
                        style={{ background: 'rgba(249,115,22,0.1)' }}>
                        {d.brand_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[13px] text-white/80 font-medium">{d?.brand_name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-[12px] text-white/40">{d?.deliverables || ""}</td>
                  <td className="py-2.5 pr-4 text-[13px] text-white/80 font-medium">{fmt(d.amount)}</td>
                  <td className="py-2.5 pr-4 text-[12px] text-white/40">{new Date(d.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="py-2.5"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {data.recent_deals.map((d: Deal) => (
            <div key={d.id} className="bg-white/[0.02] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-white/80">{d?.brand_name || "Unknown"}</span>
                <span className="text-[13px] font-medium text-white/70">{fmt(d.amount)}</span>
              </div>
              <p className="text-[11px] text-white/35">{d?.deliverables || ""}</p>
              <div className="flex items-center justify-between">
                <StatusBadge status={d.status} />
                <span className="text-[11px] text-white/30">{new Date(d.deadline).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
