import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import api from '../api/axios'
import type { ReportsData } from '../types'

// ─── Format helper ───────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return `₹${n}`
}

// ─── Tooltip styles ───────────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    background: '#1a1a2e',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.8)',
  },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}

// ─── Pie colors ───────────────────────────────────────────────────────────────
const PIE_COLORS: Record<string, string> = {
  instagram: '#f97316',
  youtube: '#eab308',
  both: 'rgba(255,255,255,0.2)',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  featured = false,
  subColor,
}: {
  label: string
  value: string
  sub?: string
  featured?: boolean
  subColor?: string
}) {
  const borderStyle = featured
    ? {
        background:
          'linear-gradient(#0f0f13, #0f0f13) padding-box, linear-gradient(135deg, #f97316, #eab308) border-box',
        border: '1px solid transparent',
      }
    : {}

  return (
    <div className="card rounded-2xl p-5 flex flex-col gap-1 min-h-[44px]" style={borderStyle}>
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</span>
      <span
        className={`text-2xl font-bold leading-tight mt-1 ${featured ? 'gradient-text' : 'text-white'}`}
      >
        {value}
      </span>
      {sub && (
        <span className={`text-xs mt-0.5 ${subColor ?? 'text-white/40'}`}>{sub}</span>
      )}
    </div>
  )
}

function BrandRow({
  brand_name,
  total_amount,
  deals_count,
  isLast,
}: {
  brand_name: string
  total_amount: number
  deals_count: number
  isLast: boolean
}) {
  const initials = brand_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <div className="flex items-center gap-3 py-3 min-h-[44px]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{brand_name}</p>
          <p className="text-xs text-white/40">{deals_count} deal{deals_count !== 1 ? 's' : ''}</p>
        </div>
        <span className="text-sm font-semibold text-white/80 shrink-0">{fmt(total_amount)}</span>
      </div>
      {!isLast && <div className="h-px bg-white/[0.06]" />}
    </>
  )
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      <span className="text-xs text-white/50 w-[100px] shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-white/70 w-6 text-right shrink-0">{count}</span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="page-container space-y-8 animate-pulse">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl h-28" />
        ))}
      </div>
      {/* Bar chart */}
      <div className="card rounded-2xl p-6">
        <div className="bg-white/5 rounded-xl h-6 w-40 mb-6" />
        <div className="bg-white/5 rounded-xl h-52" />
      </div>
      {/* Bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6 space-y-4">
          <div className="bg-white/5 rounded-xl h-6 w-32" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-10" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="card rounded-2xl p-6">
            <div className="bg-white/5 rounded-xl h-6 w-32 mb-4" />
            <div className="bg-white/5 rounded-xl h-36" />
          </div>
          <div className="card rounded-2xl p-6 space-y-4">
            <div className="bg-white/5 rounded-xl h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Custom Pie Legend ─────────────────────────────────────────────────────────
function PieLegend({
  data,
  total,
}: {
  data: { name: string; value: number }[]
  total: number
}) {
  return (
    <div className="flex flex-col justify-center gap-2.5 pl-4">
      {data.map((entry) => {
        const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
        return (
          <div key={entry.name} className="flex items-center gap-2 min-h-[44px] md:min-h-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: PIE_COLORS[entry.name] ?? '#fff' }}
            />
            <span className="text-xs text-white/60 capitalize w-20">{entry.name}</span>
            <span className="text-xs font-semibold text-white/80 ml-auto">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Reports() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<ReportsData>('/reports/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    )
  }

  const isEmpty = !data || data.total_deals_completed === 0

  if (isEmpty) {
    return (
      <div className="page-container flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-4xl">📊</div>
        <p className="text-white/60 font-medium">No data yet. Add your first deal!</p>
        <p className="text-white/30 text-sm">Your reports will appear here once you have deals.</p>
      </div>
    )
  }

  // Platform pie data
  const pieData = [
    { name: 'instagram', value: data.platform_split.instagram },
    { name: 'youtube', value: data.platform_split.youtube },
    { name: 'both', value: data.platform_split.both },
  ].filter((d) => d.value > 0)
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0)

  // Status totals
  const statusTotal =
    data.status_breakdown.completed +
    data.status_breakdown.active +
    data.status_breakdown.cancelled

  return (
    <div className="page-container space-y-8">

      {/* ── Section 1: Summary stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Earned"
          value={fmt(data.total_earned_all_time)}
          featured
        />
        <StatCard
          label="Deals Completed"
          value={String(data.total_deals_completed)}
        />
        <StatCard
          label="Avg Deal Value"
          value={fmt(data.avg_deal_value)}
        />
        <StatCard
          label="Best Month"
          value={data.best_month.month}
          sub={fmt(data.best_month.amount)}
          subColor="text-green-400"
        />
      </div>

      {/* ── Section 2: Monthly Income Bar Chart ─────────────────────────── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-6">
          Monthly Income
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.monthly_income} barCategoryGap="35%">
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => fmt(v)}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [fmt(Number(value)), 'Income']}
            />
            <Bar dataKey="amount" fill="url(#orangeGrad)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Section 3: Brands + Platform + Status ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT — Top Brands */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">
            Top Brands
          </h2>
          {data.top_brands.length === 0 ? (
            <p className="text-white/30 text-sm py-4">No brands yet.</p>
          ) : (
            data.top_brands.map((brand, idx) => (
              <BrandRow
                key={brand.brand_name}
                {...brand}
                isLast={idx === data.top_brands.length - 1}
              />
            ))
          )}
        </div>

        {/* RIGHT — Platform Split + Status Breakdown */}
        <div className="space-y-4">

          {/* Card A — Platform Split (Donut) */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
              Platform Split
            </h2>
            <div className="flex items-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name] ?? '#fff'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value) => [fmt(Number(value)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={pieData} total={pieTotal} />
            </div>
          </div>

          {/* Card B — Deal Status */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
              Deal Status
            </h2>
            <div className="space-y-1">
              <StatusBar
                label="Completed"
                count={data.status_breakdown.completed}
                total={statusTotal}
                color="#34d399"
              />
              <StatusBar
                label="Active"
                count={data.status_breakdown.active}
                total={statusTotal}
                color="#60a5fa"
              />
              <StatusBar
                label="Cancelled"
                count={data.status_breakdown.cancelled}
                total={statusTotal}
                color="#f87171"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}