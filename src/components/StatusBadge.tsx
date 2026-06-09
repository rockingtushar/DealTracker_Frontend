import { DealStatus } from '../types'

const config: Record<DealStatus, { label: string; cls: string }> = {
  negotiating:        { label: 'Negotiating',        cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  confirmed:          { label: 'Confirmed',           cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  content_sent:       { label: 'Content Sent',        cls: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  revision_requested: { label: 'Revision Requested',  cls: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  posted:             { label: 'Posted',               cls: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' },
  payment_pending:    { label: 'Payment Pending',      cls: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  completed:          { label: 'Completed',            cls: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  cancelled:          { label: 'Cancelled',            cls: 'bg-white/5 text-white/30 border border-white/10' },
}

export default function StatusBadge({ status }: { status: DealStatus }) {
  const { label, cls } = config[status] ?? config.negotiating
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
