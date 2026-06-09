import { useEffect, useState } from 'react'
import api from '../api/axios'
import { RateCard as RateCardType } from '../types'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

function fmt(n: number) {
  if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`
  return `₹${n}`
}

export default function RateCard() {
  const [rates, setRates]     = useState<RateCardType | null>(null)
  const [loading, setLoading] = useState(true)
  const { influencer }        = useAuth()
  const [toast, setToast]     = useState<{msg:string;type:'success'|'error'}|null>(null)

  useEffect(() => {
    api.get<RateCardType>('/ratecard/')
      .then((r) => setRates(r.data))
      .finally(() => setLoading(false))
  }, [])

  const copyRateCard = () => {
    if (!rates) return
    const text = `Hi! Here are my collaboration rates:
📸 Instagram Reel: ${fmt(rates.per_reel_rate)}
📱 Story (per story): ${fmt(rates.per_story_rate)}
🖼️ Feed Post: ${fmt(rates.per_post_rate)}
🎬 YouTube Video: ${fmt(rates.per_youtube_video_rate)}

Open to discuss. DM for details!`
    navigator.clipboard.writeText(text)
    setToast({ msg: 'Rate card copied to clipboard!', type: 'success' })
  }

  const rateItems = rates ? [
    { label: 'Per Reel', value: rates.per_reel_rate, avg: rates.industry_average_reel, icon: '🎬' },
    { label: 'Per Story', value: rates.per_story_rate, avg: rates.industry_average_story, icon: '📱' },
    { label: 'Per Post', value: rates.per_post_rate, avg: Math.round(rates.industry_average_reel * 0.7), icon: '🖼️' },
    { label: 'YouTube Video', value: rates.per_youtube_video_rate, avg: Math.round(rates.industry_average_reel * 2.5), icon: '▶️' },
  ] : []

  return (
    <div className="page-container">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="card p-5 flex items-start justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(234,179,8,0.04))' }}>
        <div>
          <h2 className="text-[15px] font-medium text-white/85">Your suggested rates</h2>
          <p className="text-[12px] text-white/35 mt-0.5">
            Based on {influencer?.followers_count?.toLocaleString()} followers · {influencer?.niche} niche
          </p>
        </div>
        <button onClick={copyRateCard} disabled={!rates} className="btn-outline text-sm px-4">
          Copy rate card
        </button>
      </div>

      {/* Rate cards grid */}
      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && rates && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rateItems.map(({ label, value, avg, icon }) => {
            const pct = Math.min(100, Math.round((value / (avg * 1.5)) * 100))
            return (
              <div key={label} className="card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-[11px] text-white/40">{label}</span>
                </div>
                <p className="text-xl font-semibold gradient-text">{fmt(value)}</p>
                <div>
                  <div className="flex justify-between text-[9px] text-white/25 mb-1">
                    <span>Your rate</span>
                    <span>Avg: {fmt(avg)}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#f97316,#eab308)' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rate card preview */}
      {rates && (
        <div className="card p-5">
          <h3 className="text-[12px] font-medium text-white/50 mb-3">Rate card message preview</h3>
          <div className="bg-dark-900 rounded-lg p-4 text-[13px] text-white/60 leading-relaxed font-mono whitespace-pre-wrap">
{`Hi! Here are my collaboration rates:
🎬 Instagram Reel: ${fmt(rates.per_reel_rate)}
📱 Story (per story): ${fmt(rates.per_story_rate)}
🖼️ Feed Post: ${fmt(rates.per_post_rate)}
▶️ YouTube Video: ${fmt(rates.per_youtube_video_rate)}

Open to discuss. DM for details!`}
          </div>
          <button onClick={copyRateCard} className="btn-primary mt-3 text-sm px-5">
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
