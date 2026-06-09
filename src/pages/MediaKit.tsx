import { useEffect, useState } from "react"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Toast from "../components/Toast"

interface PreviewData {
  name: string
  handle: string
  bio: string
  followers: number
  posts: number
  eng_rate: string
  rates: {
    reel: number
    story: number
    post: number
    youtube: number
  }
  brands: string[]
  email: string
}

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return n.toString()
}

export default function MediaKit() {
  const { influencer } = useAuth()
  const [data, setData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await api.get<PreviewData>("/mediakit/preview")
        setData(res.data)
      } catch {
        setToast({ msg: "Failed to load media kit", type: "error" })
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [])

  const downloadPDF = async () => {
    try {
      setDownloading(true)
      const res = await api.get("/mediakit/generate", {
      responseType: "blob",
    })

    const blob = new Blob([res.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)

    // filename extract from backend
    const contentDisposition = res.headers["content-disposition"]

    let filename = "mediakit.pdf"



    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/)
      if (match && match[1]) {
        filename = match[1]
      }
    }

    // FORCE DOWNLOAD
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // cleanup
    link.remove()
    window.URL.revokeObjectURL(url)

    } catch {
      setToast({ msg: "Failed to generate PDF", type: "error" })
    } finally {
      setDownloading(false)
    }
  }

  const copyRates = async () => {
    if (!data) return

    const text = `Hi! My collaboration rates:
📸 Reel: ₹${data.rates.reel}
📱 Story: ₹${data.rates.story}
🖼️ Post: ₹${data.rates.post}
▶️ YouTube: ₹${data.rates.youtube}`

    try {
      await navigator.clipboard.writeText(text)
      setToast({ msg: "Rate card copied!", type: "success" })
    } catch {
      setToast({ msg: "Copy failed", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="h-40 animate-pulse bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 animate-pulse bg-white/5 rounded-xl" />
          <div className="h-40 animate-pulse bg-white/5 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="page-container space-y-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-4">
          {influencer?.instagram_pic_url ? (
            <img
              src={`http://127.0.0.1:8000/instagram-image?url=${encodeURIComponent(
                influencer.instagram_pic_url
              )}`}
              alt="profile"
              className="w-14 h-14 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                background: "linear-gradient(135deg,#f09433,#dc2743)",
              }}
            >
              {data.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-white/90">{data.name}</p>
            <p className="text-sm text-white/40">@{data.handle}</p>
            <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">
              {influencer?.niche}
            </span>
          </div>
        </div>

        <p className="text-sm text-white/50">{data.bio}</p>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xl font-semibold gradient-text">{formatNum(data.followers)}</p>
            <p className="text-xs text-white/30">Followers</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xl font-semibold gradient-text">{data.posts}</p>
            <p className="text-xs text-white/30">Posts</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xl font-semibold gradient-text">{data.eng_rate}</p>
            <p className="text-xs text-white/30">Engagement</p>
          </div>
        </div>
      </div>

      {/* Middle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rates */}
        <div className="card p-4">
          <h3 className="text-xs text-white/40 uppercase mb-3">Collaboration Rates</h3>

          {[
            ["Reel", data.rates.reel],
            ["Story", data.rates.story],
            ["Post", data.rates.post],
            ["YouTube", data.rates.youtube],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-white/[0.04] py-2.5 text-sm">
              <span className="text-white/60">{label}</span>
              <span className="text-white/90 font-medium">₹{value}</span>
            </div>
          ))}
        </div>

        {/* Brands */}
        <div className="card p-4">
          <h3 className="text-xs text-white/40 uppercase mb-3">Past Brands</h3>

          <div className="flex flex-wrap gap-2">
            {data.brands.map((b) => (
              <span
                key={b}
                className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-xs"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={downloadPDF}
          className="btn-primary w-full"
          disabled={downloading}
        >
          {downloading ? "Generating..." : "Download PDF"}
        </button>

        <button onClick={copyRates} className="btn-outline w-full">
          Copy Rate Card
        </button>

        <p className="text-xs text-white/30 text-center">
          PDF includes your Instagram stats, rates and past brand collaborations
        </p>
      </div>
    </div>
  )
}