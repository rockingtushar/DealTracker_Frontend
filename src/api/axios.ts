import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    if (status === 401 && error.config?.url?.includes('/auth/')) {
      
      if (url.includes('/auth/login')) {
        return Promise.reject(error)
      }

     
      const token = localStorage.getItem('token')

      if (token) {
        localStorage.removeItem('token')
        localStorage.removeItem('influencer')

        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api