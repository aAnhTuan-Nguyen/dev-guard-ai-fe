import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5282",
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth-storage")
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string } }
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return config
})

export default api
