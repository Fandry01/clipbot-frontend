// api/file.ts
import { api } from './client'



export function fileOutUrl(objectKey?: string) {
  if (!objectKey || !objectKey.trim()) return ''
  // encode alleen gevaarlijke chars, behoud slashes
  const safe = objectKey.split('/').map(encodeURIComponent).join('/')
  return `/v1/files/out/${safe}`
}
export function fileOutDownloadUrl(objectKey?: string) {
  const u = fileOutUrl(objectKey)
  return u ? `${u}?download=1` : ''
}

