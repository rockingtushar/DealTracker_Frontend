import { useEffect, useState, FormEvent } from 'react'
import api from '../api/axios'
import { Payment, Deal } from '../types'
import Toast from '../components/Toast'

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [deals, setDeals]       = useState<Deal[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast]       = useState<{msg:string;type:'success'|'error'}|null>(null)
  const [form, setForm]         = useState({
    deal_id: '', amount: '', method: 'upi', received_date: '', notes: '',
  })
  const [saving, setSaving]     = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get<{items:Payment[]}>('/payments/'),
      api.get<{items:Deal[]}>('/deals/'),
    ]).then(([p, d]) => {
      setPayments(p.data.items ?? p.data as unknown as Payment[])
      setDeals((d.data.items ?? d.data as unknown as Deal[]).filter((x) => x.status === 'payment_pending' || x.status === 'posted'))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const totalReceived = payments.reduce((s, p) => s + p.amount, 0)

  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.deal_id || !form.amount || !form.received_date) {
      setToast({ msg: 'Fill required fields', type: 'error' }); return
    }
    setSaving(true)
    try {
      await api.post('/payments/', { ...form, deal_id: parseInt(form.deal_id), amount: parseFloat(form.amount) })
      setToast({ msg: 'Payment recorded!', type: 'success' })
      setForm({ deal_id:'', amount:'', method:'upi', received_date:'', notes:'' })
      setShowModal(false)
      fetchAll()
    } catch {
      setToast({ msg: 'Failed to record payment', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Summary card */}
      <div className="card p-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.07),rgba(234,179,8,0.04))' }}>
        <div>
          <p className="text-[11px] text-white/35 uppercase tracking-widest mb-1">Total received</p>
          <p className="text-2xl font-semibold gradient-text">{fmt(totalReceived)}</p>
          <p className="text-[11px] text-white/25 mt-0.5">{payments.length} payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm px-4">
          + Mark received
        </button>
      </div>

      {/* Payments list */}
      <div className="card p-4">
        <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
          Payment history
        </h3>

        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_,i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse"/>)}
          </div>
        )}

        {/* Desktop table */}
        {!loading && payments.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-white/25 uppercase tracking-wider">
                    <th className="text-left pb-2 pr-4">Deal ID</th>
                    <th className="text-left pb-2 pr-4">Amount</th>
                    <th className="text-left pb-2 pr-4">Method</th>
                    <th className="text-left pb-2 pr-4">Date</th>
                    <th className="text-left pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-4 text-[12px] text-white/50">Deal #{p.deal_id}</td>
                      <td className="py-2.5 pr-4 text-[13px] font-medium text-green-400">{fmt(p.amount)}</td>
                      <td className="py-2.5 pr-4 text-[12px] text-white/50 capitalize">{p.method}</td>
                      <td className="py-2.5 pr-4 text-[12px] text-white/50">{new Date(p.received_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-2.5 text-[12px] text-white/35">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-white/50">Deal #{p.deal_id}</span>
                    <span className="text-[13px] font-medium text-green-400">{fmt(p.amount)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-white/30 capitalize">{p.method}</span>
                    <span className="text-[11px] text-white/30">{new Date(p.received_date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && payments.length === 0 && (
          <p className="text-white/25 text-sm py-4 text-center">No payments recorded yet.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="card w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-white/85">Mark payment received</h2>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Deal *</label>
                <select value={form.deal_id} onChange={(e) => upd('deal_id', e.target.value)}>
                  <option value="">Select deal</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>{d.brand_name} — ₹{d.amount}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Amount (₹) *</label>
                  <input type="number" placeholder="15000" value={form.amount} onChange={(e) => upd('amount', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Method</label>
                  <select value={form.method} onChange={(e) => upd('method', e.target.value)}>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Date received *</label>
                <input type="date" value={form.received_date} onChange={(e) => upd('received_date', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Notes</label>
                <input placeholder="Optional note" value={form.notes} onChange={(e) => upd('notes', e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
