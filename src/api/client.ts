import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: false,
})

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

// Kleine helper voor error messages
export function getErr(e: any): string {
  return e?.response?.data?.message || e?.response?.data?.code || e?.message || 'Request failed'
}