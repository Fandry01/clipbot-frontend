export type UUID = string

export type Page<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export type ProjectResponse = {
  id: UUID
  ownerId: UUID
  title: string
  ownerExternalSubject: string   // <-- toegevoegdd
  createdAt: string
  templateId: UUID | null
} 

export type ProjectListItem = ProjectResponse & {
  // optioneel als je counters toevoegt:
  clips?: number
  avgScore?: number
  thumbUrl?: string | null
}

export type MediaResponse = {
  id: UUID
  ownerId: UUID
  objectKey: string | null
  durationMs: number | null
  status: string
  source: string
  platform?: string | null
  externalUrl?: string | null
}

export type MetadataResponse = {
  platform: string
  url: string
  title?: string | null
  author?: string | null
  durationSec?: number | null
  thumbnail?: string | null
}

export type ClipResponse = {
  id: UUID
  mediaId: UUID
  title: string | null
  startMs: number
  endMs: number
  status: 'QUEUED'|'RENDERING'|'READY'|'FAILED'   // <-- match BE
  meta?: Record<string, any> | null
  captionSrtKey?: string | null
  captionVttKey?: string | null
  thumbUrl?: string | null
  mp4url?: string | null
  createdAt: string
}

export type TranscriptResponse = {
  id: UUID
  mediaId: UUID
  lang: string
  provider: string
  text?: string
  words?: { schema: string; items: Array<{ startMs:number; endMs:number; text:string }>; [k:string]: any }
  createdAt: string
  version?: number
}

export type JobResponse = {
  id: UUID
  type: 'DETECT'|'RENDER'
  status: 'QUEUED'|'RUNNING'|'COMPLETE'|'FAILED'
  progress: number
  result?: any
  error?: { code: string; message?: string }
}

export type TemplateResponse = {
  id: UUID
  ownerId: UUID
  name: string
  config: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type AppliedTemplateResponse = {
  templateId: UUID | null
  resolved: Record<string, any>
}

export type MeResponse = {
  userId: UUID
  email: string
  plan: 'free'|'pro'|'enterprise'
  credits: { remaining: number; periodEndsAt: string }
}
