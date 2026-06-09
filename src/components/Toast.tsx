import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
      border text-sm font-medium shadow-2xl
      ${type === 'success'
        ? 'bg-green-500/10 border-green-500/20 text-green-400'
        : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}
