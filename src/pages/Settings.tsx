// import { useState, useEffect, FormEvent } from 'react'
// import api from '../api/axios'
// import { useAuth } from '../context/AuthContext'
// import Toast from '../components/Toast'

// interface InstagramStats {
//   handle: string
//   followers: number
//   following: number
//   posts: number
//   bio: string
//   profile_pic: string
//   verified: boolean
// }

// export default function Settings() {
//   const { influencer } = useAuth()
//   const [handle, setHandle]     = useState(influencer?.instagram_handle ?? '')
//   const [stats, setStats]       = useState<InstagramStats | null>(null)
//   const [fetching, setFetching] = useState(false)
//   const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

//   // Load saved stats on mount
//   useEffect(() => {
//     if (influencer?.instagram_handle) {
//       setHandle(influencer.instagram_handle)
//     }
//   }, [influencer])

//   const fetchStats = async (e: FormEvent) => {
//     e.preventDefault()
//     if (!handle.trim()) {
//       setToast({ msg: 'Handle daalo pehle', type: 'error' })
//       return
//     }
//     setFetching(true)
//     setStats(null)
//     try {
//       const cleanHandle = handle.replace('@', '').trim()
//       const { data } = await api.get<InstagramStats>(
//         `/instagram/fetch?handle=${cleanHandle}`
//       )
//       setStats(data)
//       setToast({ msg: 'Instagram stats fetch ho gaye!', type: 'success' })
//     } catch (err: unknown) {
//       const msg = (err as { response?: { data?: { detail?: string } } })
//         ?.response?.data?.detail
//       setToast({ msg: msg ?? 'Profile nahi mila — handle check karo', type: 'error' })
//     } finally {
//       setFetching(false)
//     }
//   }

//   return (
//     <div className="page-container max-w-2xl">
//       {toast && (
//         <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
//       )}

//       {/* Profile info */}
//       <div className="card p-5">
//         <h2 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-4">
//           Profile
//         </h2>
//         <div className="flex items-center gap-4">
//           <div
//             className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white flex-shrink-0"
//             style={{ background: 'linear-gradient(135deg,#f97316,#eab308)' }}
//           >
//             {influencer?.name?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <p className="text-[15px] font-medium text-white/85">{influencer?.name}</p>
//             <p className="text-[12px] text-white/35 mt-0.5">{influencer?.email}</p>
//             <p className="text-[12px] text-white/35 mt-0.5 capitalize">
//               {influencer?.niche} · {influencer?.followers_count?.toLocaleString()} followers
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Instagram section */}
//       <div className="card p-5 space-y-4">
//         <div className="flex items-center gap-3">
//           <div
//             className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
//             style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366)' }}
//           >
//             📸
//           </div>
//           <div>
//             <h2 className="text-[14px] font-medium text-white/85">Instagram Stats</h2>
//             <p className="text-[11px] text-white/35 mt-0.5">
//               Handle se real stats fetch karo
//             </p>
//           </div>
//         </div>

//         {/* Handle input */}
//         <form onSubmit={fetchStats} className="flex gap-3">
//           <div className="flex-1 relative">
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
//             <input
//               placeholder="yourhandle"
//               value={handle}
//               onChange={(e) => setHandle(e.target.value.replace('@', ''))}
//               className="pl-7"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={fetching}
//             className="btn-primary px-5 text-sm whitespace-nowrap"
//           >
//             {fetching ? 'Fetching...' : 'Fetch stats'}
//           </button>
//         </form>

//         {/* Loading */}
//         {fetching && (
//           <div className="space-y-3 animate-pulse">
//             <div className="h-16 bg-white/5 rounded-xl" />
//             <div className="grid grid-cols-3 gap-3">
//               {[...Array(3)].map((_, i) => (
//                 <div key={i} className="h-16 bg-white/5 rounded-xl" />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Stats result */}
//         {stats && !fetching && (
//           <div className="space-y-4">
//             {/* Profile header */}
//             <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
//               {stats.profile_pic ? (
//                 <img
//                   src={stats.profile_pic}
//                   alt={stats.handle}
//                   className="w-12 h-12 rounded-full object-cover flex-shrink-0"
//                 />
//               ) : (
//                 <div
//                   className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
//                   style={{ background: 'linear-gradient(135deg,#f09433,#dc2743)' }}
//                 >
//                   {stats.handle?.charAt(0).toUpperCase()}
//                 </div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span className="text-[14px] font-medium text-white/85">
//                     @{stats.handle}
//                   </span>
//                   {stats.verified && (
//                     <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
//                       ✓ Verified
//                     </span>
//                   )}
//                 </div>
//                 {stats.bio && (
//                   <p className="text-[11px] text-white/35 mt-1 truncate">{stats.bio}</p>
//                 )}
//               </div>
//               <div className="flex-shrink-0">
//                 <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
//                   ✓ Connected
//                 </span>
//               </div>
//             </div>

//             {/* Stats grid */}
//             <div className="grid grid-cols-3 gap-3">
//               <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
//                 <p
//                   className="text-xl font-semibold"
//                   style={{ background: 'linear-gradient(90deg,#f97316,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
//                 >
//                   {stats.followers >= 1000
//                     ? `${(stats.followers / 1000).toFixed(1)}k`
//                     : stats.followers}
//                 </p>
//                 <p className="text-[10px] text-white/30 mt-1">Followers</p>
//               </div>
//               <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
//                 <p className="text-xl font-semibold text-white/75">{stats.posts}</p>
//                 <p className="text-[10px] text-white/30 mt-1">Posts</p>
//               </div>
//               <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
//                 <p className="text-xl font-semibold text-white/75">
//                   {stats.following >= 1000
//                     ? `${(stats.following / 1000).toFixed(1)}k`
//                     : stats.following}
//                 </p>
//                 <p className="text-[10px] text-white/30 mt-1">Following</p>
//               </div>
//             </div>

//             <p className="text-[10px] text-white/20 text-center">
//               ✓ Stats saved — Dashboard mein dikhenge
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Coming soon - OAuth */}
//       <div className="card p-5 border-dashed border-white/[0.08]">
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <p className="text-[13px] font-medium text-white/50">
//               Connect via Instagram OAuth
//             </p>
//             <p className="text-[11px] text-white/25 mt-0.5">
//               Reach, impressions, story views — coming soon
//             </p>
//           </div>
//           <span className="text-[10px] bg-amber-500/10 text-amber-500/60 border border-amber-500/20 px-3 py-1 rounded-full">
//             Coming soon
//           </span>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from "react"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"

export default function Settings() {
  const { influencer, fetchMe } = useAuth()
  const [handle, setHandle] = useState(influencer?.instagram_handle || "")
  const [loading, setLoading] = useState(false)
  const [instaData, setInstaData] = useState<any>(null)
  const [oauthConnected, setOauthConnected] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(true)
  const startOAuth = async () => {
  const res = await api.get("/instagram/oauth/start")
    window.location.href = res.data.auth_url
  }

  function formatNum(n?: number) {
    if (!n) return '0'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return n
  }

  const fetchInstagram = async () => {
    if (!handle) return alert("Enter handle")

    try {
      setLoading(true)
      const res = await api.get(`/instagram/fetch?handle=${handle}`)
      // setInstaData(res.data)
      setHandle(res.data.handle)
      await fetchMe() 

      alert("Instagram synced successfully")
    } catch (err) {
      alert("Failed to fetch Instagram")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("instagram_oauth") === "success") {
      alert("Instagram OAuth connected successfully")
      window.history.replaceState({}, "", window.location.pathname)
    }

    api.get("/instagram/oauth/status")
      .then((res) => setOauthConnected(res.data.connected))
      .finally(() => setOauthLoading(false))
  }, [])

  console.log("PIC URL:", influencer?.instagram_pic_url)
  return (
    <div className="page-container space-y-4">
      <h1 className="text-lg font-semibold text-white/90">Settings</h1>

      {/* Instagram Section */}
      <div className="card p-4 space-y-3">
        <h3 className="text-xs uppercase text-white/40">Instagram</h3>

        <div className="flex gap-2">
          <input
            value={influencer?.instagram_handle || ""}
            readOnly
            className="input flex-1 opacity-60 cursor-not-allowed"
            placeholder="narendramodi (without @)"
          />
          <button
            onClick={fetchInstagram}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Syncing..." : "Sync Instagram"}
          </button>
        </div>

       
        {influencer && (
          <div className="mt-4 space-y-3">

            {/* Profile */}
            <div className="flex items-center gap-3">
              <img
                src={
                  influencer?.instagram_pic_url
                    ? `http://127.0.0.1:8000/instagram-image?url=${encodeURIComponent(influencer.instagram_pic_url)}`
                    : "https://ui-avatars.com/api/?name=User"
                }
                alt="profile"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-12 h-12 rounded-full object-cover border border-white/10"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(influencer?.name || "User")
                }}
              />
              <div>
                <p className="text-[10px] text-white/25 mt-1">
                  Synced just now
                </p>
                <p className="text-sm text-white/90 font-medium">
                  @{influencer?.instagram_handle}
                  {influencer?.instagram_verified && (
                    <span className="text-blue-400 ml-1 text-xs">✔︎</span>
                  )}
                </p>
                <p className="text-xs text-white/40">
                  {influencer?.instagram_bio || 'No bio'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.02] p-3 rounded-lg text-center">
                <p className="text-white/90 font-semibold">
                  {formatNum(influencer?.instagram_followers)}
                </p>
                <p className="text-xs text-white/30">Followers</p>
              </div>

              <div className="bg-white/[0.02] p-3 rounded-lg text-center">
                <p className="text-white/90 font-semibold">
                  {formatNum(influencer?.instagram_following)}
                </p>
                <p className="text-xs text-white/30">Following</p>
              </div>

              <div className="bg-white/[0.02] p-3 rounded-lg text-center">
                <p className="text-white/90 font-semibold">
                  {formatNum(influencer?.instagram_posts)}
                </p>
                <p className="text-xs text-white/30">Posts</p>
              </div>
            </div>

          </div>
        )}
      </div>


      <div className="card p-5 border-dashed border-white/[0.08]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[13px] font-medium text-white/50">
              Connect your Instagram 
            </p>
            <p className="text-[11px] text-white/25 mt-0.5">
              Reach, impressions, story views — official connect for professional accounts
            </p>
          </div>

          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

    </div>
  )
}