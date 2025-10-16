import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getErr } from './client'
import type {
  Page, ProjectResponse, ProjectListItem, MediaResponse, MetadataResponse, ClipResponse,
  TranscriptResponse, JobResponse, TemplateResponse, AppliedTemplateResponse, UUID
} from './types'
import axios from 'axios'
/** ====== PROJECTS ====== */
export function useProjects(ownerId: UUID, page=0, size=12) {
  return useQuery({
    queryKey: ['projects', ownerId, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<ProjectListItem>>(`/v1/projects`, { params: { ownerId, page, size }})
      return data
    }
  })
}
export function useProject(projectId: UUID, ownerId: UUID) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectResponse>(`/v1/projects/${projectId}`, { params: { ownerId }})
      return data
    }
  })
}
export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { ownerId: UUID; title: string; templateId?: UUID|null }) => {
      const { data } = await api.post<ProjectResponse>(`/v1/projects`, p)
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', vars.ownerId] })
  })
}
export function useLinkMediaToProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { projectId: UUID; ownerId: UUID; mediaId: UUID }) => {
      const { data } = await api.post(`/v1/projects/${p.projectId}/media`, { ownerId: p.ownerId, mediaId: p.mediaId })
      return data
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ['project', p.projectId] })
      qc.invalidateQueries({ queryKey: ['project-media', p.projectId] })
    }
  })
}
export function useProjectClips(args: {
  projectId: UUID; ownerId: UUID; status?: string; page?: number; size?: number;
  q?: string; minDurMs?: number; maxDurMs?: number; sort?: 'createdAt'|'score'|'duration'; order?: 'asc'|'desc'
}) {
  const { projectId, ownerId, page=0, size=24, ...filters } = args
  return useQuery({
    queryKey: ['project-clips', projectId, ownerId, page, size, filters],
    queryFn: async () => {
      const { data } = await api.get<Page<ClipResponse>>(`/v1/projects/${projectId}/clips`, {
        params: { ownerId, page, size, ...filters }
      })
      return data
    }
  })
}

/** ====== MEDIA & METADATA ====== */
export function useMedia(id: UUID) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async () => {
      const { data } = await api.get<MediaResponse>(`/v1/media/${id}`)
      return data
    }
  })
}

export function useMetadata(url?: string) {
  return useQuery({
    enabled: !!url,
    queryKey: ['metadata', url],
    queryFn: async () => {
      const { data } = await api.get<MetadataResponse>(`/v1/metadata`, { params: { url } })
      return data
    }
  })
}

export function useCreateMediaFromUrl() {
  return useMutation({
    mutationFn: async (p: { ownerId: UUID; url: string; source?: string }) => {
      const { data } = await api.post(`/v1/media/from-url`, p)
      return data as { mediaId: UUID; status: string; platform: string; durationMs?: number|null; thumbnail?: string|null; normalizedUrl?: string|null }
    }
  })
}
/** ====== Upload ====== */
export function useUploadLocal() {
  const controllerRef = { current: null as AbortController | null }

  const upload = async (p: { owner: string; file: File; objectKey?: string; onProgress?: (pct:number)=>void }) => {
    const form = new FormData()
    form.append('owner', p.owner)
    form.append('file', p.file)
    if (p.objectKey) form.append('objectKey', p.objectKey)

    const ctrl = new AbortController()
    controllerRef.current = ctrl

    const { data } = await axios.post(
      `/v1/uploads/local`,
      form,
      {
        signal: ctrl.signal,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (p.onProgress && e.total) p.onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    )
    return data as { mediaId: string; assetId: string; objectKey: string; sizeBytes: number }
  }

  const cancel = () => controllerRef.current?.abort()

  return { upload, cancel }
}





/** ====== TRANSCRIPTS ====== */
export function useTranscriptByMedia(mediaId?: UUID, lang?: string, provider?: string) {
  return useQuery({
    enabled: !!mediaId,
    queryKey: ['transcript', mediaId, lang, provider],
    queryFn: async () => {
      const { data } = await api.get<TranscriptResponse>(`/v1/transcripts`, { params: { mediaId, lang, provider }})
      return data
    }
  })
}

/** ====== CLIPS ====== */
export function usePatchClip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Partial<ClipResponse> & { id: UUID }) => {
      const { id, ...body } = p
      const { data } = await api.patch<ClipResponse>(`/v1/clips/${id}`, body)
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['project-clips'] })
      qc.invalidateQueries({ queryKey: ['clip', data.id] })
    }
  })
}

/** ====== JOBS ====== */
export function useStartJob() {
  return useMutation({
    mutationFn: async (p: { type: 'DETECT'|'RENDER'; mediaId?: UUID; clipId?: UUID; params?: any }) => {
      const { data } = await api.post<JobResponse>(`/v1/jobs`, p)
      return data
    }
  })
}
export function useJob(jobId?: UUID) {
  return useQuery({
    enabled: !!jobId,
    refetchInterval: (q) => q.state.data?.status === 'COMPLETE' || q.state.data?.status === 'FAILED' ? false : 750,
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await api.get<JobResponse>(`/v1/jobs/${jobId}`)
      return data
    }
  })
}

/** ====== TEMPLATES ====== */
export function useTemplates(ownerId: UUID, page=0, size=50) {
  return useQuery({
    queryKey: ['templates', ownerId, page, size],
    queryFn: async () => {
      const { data } = await api.get(`/v1/templates`, { params: { ownerId, page, size }})
      return data as Page<TemplateResponse>
    }
  })
}
export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { ownerId: UUID; name: string; config: any }) => {
      const { data } = await api.post<TemplateResponse>(`/v1/templates`, p)
      return data
    },
    onSuccess: (_, p) => qc.invalidateQueries({ queryKey: ['templates', p.ownerId] })
  })
}
export function useApplyTemplateToProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { projectId: UUID; ownerId: UUID; templateId: UUID }) => {
      await api.post(`/v1/projects/${p.projectId}/apply-template`, { ownerId: p.ownerId, templateId: p.templateId })
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ['project', p.projectId] })
      qc.invalidateQueries({ queryKey: ['applied-template', p.projectId] })
    }
  })
}
export function useAppliedTemplate(projectId: UUID, ownerId: UUID) {
  return useQuery({
    queryKey: ['applied-template', projectId],
    queryFn: async () => {
      const { data } = await api.get<AppliedTemplateResponse>(`/v1/projects/${projectId}/template`, { params: { ownerId }})
      return data
    }
  })
}
