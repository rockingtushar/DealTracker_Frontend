import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const niches = ['food', 'tech', 'fashion', 'beauty', 'travel', 'fitness', 'other']

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    instagram_handle: '', niche: 'food', followers_count: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.instagram_handle) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', {
        ...form,
        followers_count: parseInt(form.followers_count) || 0,
      })
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold gradient-text">DealTrack</h1>
          <p className="text-white/30 text-sm mt-1">Start managing your brand deals</p>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-[18px] font-medium text-white/85">Create account</h2>
            <p className="text-sm text-white/35 mt-0.5">Free to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Full name *</label>
                <input placeholder="Raj Kumar" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Instagram *</label>
                <input placeholder="@yourhandle" value={form.instagram_handle} onChange={(e) => update('instagram_handle', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Email *</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Password *</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Niche</label>
                <select value={form.niche} onChange={(e) => update('niche', e.target.value)}>
                  {niches.map((n) => (
                    <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Followers</label>
                <input type="number" placeholder="80000" value={form.followers_count} onChange={(e) => update('followers_count', e.target.value)} />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/30">
            Already have account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
