import { useEffect, useState, FormEvent } from 'react'
import api from '../api/axios'
import { Deal, DealStatus, Platform } from '../types'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'

const statusOptions: DealStatus[] = [
  'negotiating','confirmed','content_sent','revision_requested',
  'posted','payment_pending','completed','cancelled',
]

function fmt(n: number) {
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n/1000).toFixed(1)}k`
  return `₹${n}`
}

const emptyForm = {
  brand_name: '', contact_person: '', contact_email: '',
  platform: 'instagram' as Platform,
  deliverables: '', amount: '', deadline: '', notes: '',
}

export default function Deals() {
  const [deals, setDeals]     = useState<Deal[]>([])
  const [filter, setFilter]   = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<{msg:string;type:'success'|'error'}|null>(null)

  const fetchDeals = () => {
    setLoading(true)
    api.get<{items: Deal[]}>('/deals/')
      .then((r) => setDeals(r.data.items ?? r.data as unknown as Deal[]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDeals() }, [])

  const filtered = filter === 'all' ? deals
    : filter === 'active' ? deals.filter((d) => !['completed','cancelled'].includes(d.status))
    : filter === 'pending' ? deals.filter((d) => d.status === 'payment_pending')
    : deals.filter((d) => ['completed','cancelled'].includes(d.status))

  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.brand_name || !form.deliverables || !form.amount || !form.deadline) {
      setToast({ msg: 'Fill required fields', type: 'error' }); return
    }
    setSaving(true)
    try {
      await api.post('/deals/', { ...form, amount: parseFloat(form.amount) })
      setToast({ msg: 'Deal added!', type: 'success' })
      setForm(emptyForm)
      setShowModal(false)
      fetchDeals()
    } catch {
      setToast({ msg: 'Failed to add deal', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: number, status: DealStatus) => {
    await api.patch(`/deals/${id}/status`, { status })
    fetchDeals()
  }

  return (
    <div className="page-container">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['all','active','pending','done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border
              ${filter === f
                ? 'text-white border-transparent'
                : 'text-white/35 border-white/10 hover:border-white/20'
              }`}
            style={filter === f ? { background: 'linear-gradient(90deg,#f97316,#eab308)', borderColor:'transparent' } : {}}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary ml-auto text-xs px-4 py-1.5 min-h-0 rounded-full"
        >
          + New deal
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      )}

      {/* Deal cards */}
      {!loading && filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-white/25 text-sm">No deals here yet.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4 text-sm px-5">
            Add your first deal
          </button>
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} onClick={() => window.location.href = `/deals/${d.id}`}  className="card p-4 flex items-center gap-3 hover:border-orange-500/20 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold text-orange-400 flex-shrink-0"
                style={{ background: 'rgba(249,115,22,0.1)' }}>
                {d.brand_name.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-white/85">{d.brand_name}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-[11px] text-white/30 mt-0.5 truncate">{d.deliverables} · {d.platform}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[13px] font-medium text-white/80">{fmt(d.amount)}</p>
                  <p className="text-[11px] text-white/30">{new Date(d.deadline).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</p>
                </div>

                <select
                  value={d.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation()
                    updateStatus(d.id, e.target.value as DealStatus)
                  }}
                  className="text-[11px] bg-dark-700 border border-white/10 rounded-lg px-2 py-1.5
                    text-white/60 min-h-0 w-auto"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g,' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-white/85">New deal</h2>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Brand name *</label>
                  <input placeholder="Boat Lifestyle" value={form.brand_name} onChange={(e) => upd('brand_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Contact person</label>
                  <input placeholder="Priya Sharma" value={form.contact_person} onChange={(e) => upd('contact_person', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Contact email</label>
                  <input placeholder="brand@email.com" value={form.contact_email} onChange={(e) => upd('contact_email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Platform</label>
                  <select value={form.platform} onChange={(e) => upd('platform', e.target.value)}>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1">Deliverables *</label>
                <textarea
                  rows={2}
                  placeholder="1 Reel + 2 Stories"
                  value={form.deliverables}
                  onChange={(e) => upd('deliverables', e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Amount (₹) *</label>
                  <input type="number" placeholder="15000" value={form.amount} onChange={(e) => upd('amount', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Deadline *</label>
                  <input type="date" value={form.deadline} onChange={(e) => upd('deadline', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1">Notes</label>
                <textarea rows={2} placeholder="Any additional notes..." value={form.notes}
                  onChange={(e) => upd('notes', e.target.value)} className="resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Add deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
