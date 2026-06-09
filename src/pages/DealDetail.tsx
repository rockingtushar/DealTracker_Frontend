import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../api/axios"
import { Deal } from "../types"
import StatusBadge from "../components/StatusBadge"
import Toast from "../components/Toast"

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return `₹${n}`
}

const timeline = [
  "negotiating",
  "confirmed",
  "content_sent",
  "revision_requested",
  "posted",
  "payment_pending",
  "completed",
]

const timelineLabels: Record<string, string> = {
  negotiating: "Negotiating",
  confirmed: "Confirmed",
  content_sent: "Content Sent",
  revision_requested: "Revision",
  posted: "Posted",
  payment_pending: "Payment",
  completed: "Completed",
}

export default function DealDetail() {
  const { id } = useParams()

  const [deal, setDeal] = useState<Deal | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [aiReply, setAiReply] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [isEditingReply, setIsEditingReply] = useState(false)


  const generateAiReply = async () => {
    if (!deal) return

    try {
      setAiLoading(true)

      const res = await api.post(`/ai/reply/${deal.id}`, {
        tone: "professional",
      })

      setAiReply(res.data.reply)
      setIsEditingReply(true)

      setToast({
        msg: "AI reply generated",
        type: "success",
      })
    } catch {
      setToast({
        msg: "Failed to generate reply",
        type: "error",
      })
    } finally {
      setAiLoading(false)
    }
  }


  const shareReminderLink = async () => {
    if (!deal) return

    try {
      const res = await api.get(`/whatsapp/reminder/${deal.id}`)

      const link = res.data.link

      if (navigator.share) {
        await navigator.share({
          title: `Payment Reminder • ${deal.brand_name}`,
          text: `Reminder for pending payment from ${deal.brand_name}`,
          url: link,
        })
      } else {
        await navigator.clipboard.writeText(link)

        setToast({
          msg: "Reminder link copied!",
          type: "success",
        })
      }
    } catch {
      setToast({
        msg: "Failed to share reminder",
        type: "error",
      })
    }
  }

  const currentIndex = deal
    ? timeline.indexOf(deal.status)
    : 0

  // Fetch deal
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await api.get(`/deals/${id}`)
        setDeal(res.data)
      } finally {
        setLoading(false)
      }
    }

    fetchDeal()
  }, [id])

  // Progress animation
  useEffect(() => {
    if (!deal) return

    const percent =
      ((currentIndex + 1) / timeline.length) * 100

    const timer = setTimeout(() => {
      setProgress(percent)
    }, 200)

    return () => clearTimeout(timer)
  }, [deal, currentIndex])

  if (loading) {
    return (
      <div className="page-container">
        <div className="h-40 rounded-xl bg-white/5 animate-pulse" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="page-container text-sm text-white/30">
        Deal not found
      </div>
    )
  }

  return (
    <div className="page-container space-y-4">


      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* TOP CARD */}
      <div
        className="card p-5"
        style={{
          background:
            "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(234,179,8,0.03))",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-white/90">
                {deal.brand_name}
              </h1>

              <StatusBadge status={deal.status} />
            </div>

            <p className="text-sm text-white/35 mt-1">
              {deal.platform} · Deadline{" "}
              {new Date(deal.deadline).toLocaleDateString("en-IN")}
            </p>
          </div>

          <p className="text-2xl font-semibold gradient-text">
            {fmt(deal.amount)}
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="card p-5">
        {/* Top */}
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-white/35">
            Deal Progress
            </h3>

            <span className="text-sm font-medium gradient-text">
            {Math.round(((currentIndex + 1) / timeline.length) * 100)}%
            </span>
        </div>

        {/* Progress bar */}
            <div className="relative">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                        width: `${progress}%`,
                        background:
                            "linear-gradient(90deg,#f97316,#eab308)",
                        }}
                    />
                </div>

                
                {/* Desktop milestones */}
                <div className="flex justify-between mt-4 gap-1 md:gap-2">
                    {timeline.map((step, i) => {
                        const active = i <= currentIndex

                        return (
                        <div
                            key={step}
                            className="flex flex-col items-center flex-1 min-w-0"
                        >
                            {/* Dot */}
                            <div
                            className={`w-3 h-3 md:w-4 md:h-4 rounded-full border transition-all duration-300
                            ${active
                                ? "bg-orange-500 border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                                : "bg-white/5 border-white/10"
                            }`}
                            />

                            {/* Label */}
                            <p
                            className={`text-[7px] md:text-[10px] mt-1 md:mt-2 text-center leading-tight
                            ${active
                                ? "text-white/80"
                                : "text-white/25"
                            }`}
                            >
                            {timelineLabels[step]}
                            </p>
                        </div>
                        )
                    })}
                </div>

               
            </div>

        
        </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="card p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-white/35">
            Brand Details
          </h3>

          <div>
            <p className="text-[11px] text-white/30">Contact Person</p>
            <p className="text-sm text-white/80">
              {deal.contact_person || "—"}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-white/30">Contact Email</p>
            <p className="text-sm text-white/80">
              {deal.contact_email || "—"}
            </p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-white/35">
            Deliverables
          </h3>

          <p className="text-sm text-white/75">
            {deal.deliverables}
          </p>

          <div>
            <p className="text-[11px] text-white/30">Notes</p>
            <p className="text-sm text-white/75">
              {deal.notes || "No notes"}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> */}
      <div className="flex items-center gap-3 flex-shrink-0">

        <button
          onClick={generateAiReply}
          className="btn-outline"
          disabled={aiLoading}
        >
          {aiLoading ? "Generating..." : "Generate AI Reply"}
        </button>

      </div>

        {/* {aiReply && (
          <div className="card p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-white/35">
              AI Reply
            </h3>
            <div className="bg-dark-900 rounded-lg p-4 text-sm text-white/75 whitespace-pre-wrap">
              {aiReply}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(aiReply)}
              className="btn-primary text-sm px-5"
            >
              Copy Reply
            </button>
          </div>
        )} */}

        {aiReply && (
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs uppercase tracking-widest text-white/35">
                AI Reply
              </h3>

              <button
                onClick={() => setIsEditingReply((prev) => !prev)}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                {isEditingReply ? "Preview" : "Edit"}
              </button>
            </div>

            {isEditingReply ? (
              <textarea
                value={aiReply}
                onChange={(e) => setAiReply(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-lg bg-dark-900 border border-white/10 p-4 text-sm text-white/80 outline-none"
              />
            ) : (
              <div className="bg-dark-900 rounded-lg p-4 text-sm text-white/75 whitespace-pre-wrap">
                {aiReply}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(aiReply)}
                className="btn-primary text-sm px-5"
              >
                Copy Reply
              </button>

              {isEditingReply && (
                <button
                  onClick={() => setIsEditingReply(false)}
                  className="btn-outline text-sm px-5"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-shrink-0">

        <button
          onClick={() => window.location.href = "/invoices"}
          className="btn-primary"
        >
          Generate Invoice
        </button>

        {/* <button
          onClick={async () => {
            const res = await api.get(`/whatsapp/reminder/${deal.id}`)
            window.open(res.data.link, "_blank")
          }}
          className="btn-outline"
        >
          Send Reminder
        </button> */}

        <button
          onClick={async () => {
            try {
              const res = await api.get(`/whatsapp/reminder/${deal.id}`)

              const link = res.data.link

              if (navigator.share) {
                await navigator.share({
                  title: `Payment Reminder • ${deal.brand_name}`,
                  text: `Reminder for pending payment from ${deal.brand_name}`,
                  url: link,
                })
              } else {
                await navigator.clipboard.writeText(link)

                setToast({
                  msg: "Reminder link copied!",
                  type: "success",
                })
              }
            } catch {
              setToast({
                msg: "Failed to share reminder",
                type: "error",
              })
            }
          }}
          className="btn-outline"
        >
          Send Reminder
        </button>

        <button
            disabled={deal.status === "completed"}
            onClick={async () => {
                if (deal.status === "completed") return

                await api.patch(`/deals/${deal.id}/status`, {
                status: "completed",
                })

                window.location.reload()
            }}
            className={`btn-outline transition-all
                ${deal.status === "completed"
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
            {deal.status === "completed"
                ? "Completed"
                : "Mark Completed"}
        </button>
      </div>
    </div>
  )
}