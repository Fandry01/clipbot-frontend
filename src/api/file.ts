import { api } from './client'

const BASE = (api.defaults.baseURL || '').replace(/\/$/, '')

export const fileOutUrl = (objectKey: string, opts?: { dl?: boolean }) => {
  const q = opts?.dl ? '?dl=1' : ''
  return `${BASE}/v1/files/out/${encodeURI(objectKey)}${q}`
}