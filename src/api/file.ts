import { api } from './client'

const BASE = (api.defaults.baseURL || '').replace(/\/$/, '')

export function fileOutUrl(objectKey: string) {
  // objectKey bevat al paden (niet volledig encoden)
  return `${BASE}/v1/files/out/${objectKey}`
}
export function fileOutDownloadUrl(objectKey: string) {
  return `${fileOutUrl(objectKey)}?download=1`
}
