import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Invoice, Deal } from '../types'
import Toast from '../components/Toast'

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [deals, setDeals]       = useState<Deal[]>([])
  const [loading, setLoading]   = useState(true)
  const [generating, setGenerating] = useState<number | null>(null)
  const [selectedDeal, setSelectedDeal] = useState('')
  const [toast, setToast]       = useState<{msg:string;type:'success'|'error'}|null>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get<{items:Invoice[]}>('/invoices/'),
      api.get<{items:Deal[]}>('/deals/'),
    ]).then(([inv, d]) => {
      setInvoices(inv.data.items ?? inv.data as unknown as Invoice[])
      setDeals(d.data.items ?? d.data as unknown as Deal[])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const generate = async () => {
    if (!selectedDeal) {
      setToast({ msg: 'Select a deal first', type: 'error' })
      return
    }

    setGenerating(parseInt(selectedDeal))

    try {
      const { data } = await api.post(`/invoices/${selectedDeal}`)

      
      const res = await api.get(
        `/invoices/${data.id}/download`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')

      link.href = url
      link.download = `${data.invoice_number}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

      setToast({
        msg: `Invoice ${data.invoice_number} generated!`,
        type: 'success'
      })

      setSelectedDeal('')
      fetchAll()

    } catch {
      setToast({ msg: 'Failed to generate invoice', type: 'error' })
    } finally {
      setGenerating(null)
    }
  }

  const download = async (invoice: Invoice) => {
    try {
      const res = await api.get(
        `/invoices/${invoice.id}/download`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')

      link.href = url
      link.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

    } catch {
      setToast({ msg: 'Failed to download invoice', type: 'error' })
    }
  }

  return (
    <div className="page-container">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Generate section */}
      <div className="card p-5">
        <h3 className="text-[13px] font-medium text-white/70 mb-3">Generate new invoice</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)}>
              <option value="">Select deal</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.brand_name} — ₹{d.amount.toLocaleString()} ({d.status})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={!!generating}
            className="btn-primary text-sm px-5"
          >
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* Invoices list */}
      <div className="card p-4">
        <h3 className="text-[10px] font-medium text-white/35 uppercase tracking-widest mb-3 pb-2.5 border-b border-white/[0.06]">
          All invoices
        </h3>

        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_,i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
        )}

        {!loading && invoices.length === 0 && (
          <p className="text-white/25 text-sm py-4 text-center">No invoices generated yet.</p>
        )}

        {/* Desktop */}
        {!loading && invoices.length > 0 && (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-white/25 uppercase tracking-wider">
                    <th className="text-left pb-2 pr-4">Invoice #</th>
                    <th className="text-left pb-2 pr-4">Deal</th>
                    <th className="text-left pb-2 pr-4">Date</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 pr-4">
                        <span className="text-orange-400 text-[12px] font-medium">{inv.invoice_number}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-[12px] text-white/50">Deal #{inv.deal_id}</td>
                      <td className="py-2.5 pr-4 text-[12px] text-white/35">
                        {new Date(inv.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => download(inv)}
                          className="btn-outline text-[11px] px-3 min-h-0 py-1.5"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white/[0.02] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-[12px] font-medium">{inv.invoice_number}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {new Date(inv.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <button onClick={() => download(inv)} className="btn-outline text-[11px] px-3 min-h-0 py-1.5">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
