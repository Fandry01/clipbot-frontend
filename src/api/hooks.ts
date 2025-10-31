import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api, getErr } from './client'
import type {
  Page, ProjectResponse, ProjectListItem, MediaResponse, MetadataResponse, ClipResponse,
  TranscriptResponse, JobResponse, TemplateResponse, AppliedTemplateResponse, UUID
} from './types'
import axios from 'axios'
import { fileOutUrl } from '../api/file'
import {useEffect, useRef, useState} from "react";

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

export function useProjectsBySubject(ownerExternalSubject: string, page=0, size=12) {
  return useQuery({
    queryKey: ['projects', 'bySubject', ownerExternalSubject, page, size],
    queryFn: async () => {
      const { data } = await api.get<Page<ProjectListItem>>(
        `/v1/projects`,
        { params: { ownerExternalSubject, page, size } }
      )
      return data
    }
  })
}
export function useProjectClips(args: {
  projectId: UUID; ownerExternalSubject: string; status?: string; page?: number; size?: number;
  q?: string; minDurMs?: number; maxDurMs?: number; sort?: 'createdAt'|'score'|'duration'; order?: 'asc'|'desc'
}) {
  const { projectId, ownerExternalSubject, page=0, size=24, ...filters } = args
  return useQuery({
    queryKey: ['project-clips', projectId, ownerExternalSubject, page, size, filters],
    queryFn: async () => {
      const { data } = await api.get<Page<ClipResponse>>(`/v1/projects/${projectId}/clips`, {
        params: { ownerExternalSubject, page, size, ...filters }
      })
      return data
    }
  })
}
export function useCreateProjectBySubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { ownerExternalSubject: string; title: string; templateId?: UUID|null }) => {
      const { data } = await api.post<ProjectResponse>(`/v1/projects`, p)
      return data
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['projects', 'bySubject', vars.ownerExternalSubject] })
  })
}

export function useProjectBySubject(projectId: UUID, ownerExternalSubject: string) {
  return useQuery({
    queryKey: ['project', projectId, ownerExternalSubject],
    queryFn: async () => {
      const { data } = await api.get<ProjectResponse>(`/v1/projects/${projectId}`, {
        params: { ownerExternalSubject }
      })
      return data
    }
  })
}

// export function useLinkMediaToProjectBySubject() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: async (p: { projectId: UUID; ownerExternalSubject: string; mediaId: UUID }) => {
//       // controller accepteert ownerExternalSubject in body
//       const { data } = await api.post(`/v1/projects/${p.projectId}/media`, {
//         ownerExternalSubject: p.ownerExternalSubject,
//         mediaId: p.mediaId
//       })
//       return data
//     },
//     onSuccess: (_, p) => {
//       qc.invalidateQueries({ queryKey: ['project', p.projectId] })
//       qc.invalidateQueries({ queryKey: ['project-media', p.projectId] })
//     }
//   })
// }

export function useLinkMediaToProjectStrict() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { projectId: UUID; mediaId: UUID }) => {
      await api.post(`/v1/projects/${p.projectId}/media`, { mediaId: p.mediaId })
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ['project', p.projectId] })
      qc.invalidateQueries({ queryKey: ['project-media', p.projectId] })
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

// export function useCreateMediaFromUrl() {
//   return useMutation({
//     mutationFn: async (p: { ownerId: UUID; url: string; source?: string }) => {
//       const { data } = await api.post(`/v1/media/from-url`, p)
//       return data as { mediaId: UUID; status: string; platform: string; durationMs?: number|null; thumbnail?: string|null; normalizedUrl?: string|null }
//     }
//   })
// }
export function useCreateMediaFromUrl() {
  return useMutation({
    mutationFn: async (p: { ownerExternalSubject: string; url: string; source?: string }) => {
      const { data } = await api.post(`/v1/media/from-url`, {
        ownerExternalSubject: p.ownerExternalSubject,
        url: p.url,
        source: p.source ?? 'url',
      })
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
/** ====== CLIPS: STATUS + RENDER ====== */
export function useUpdateClipStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { id: UUID; status: 'APPROVED' | 'REJECTED' | 'READY' | 'FAILED' }) => {
      await api.post(`/v1/clips/${p.id}/status/${p.status}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-clips'] })
    },
  })
}

export function useEnqueueRender() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (clipId: UUID) => {
      const { data } = await api.post(`/v1/clips/enqueue-render`, { clipId })
      return data as { jobId: UUID }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-clips'] })
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}



/** ====== JOBS ====== */
export function useEnqueueClipRender() {
  return useMutation({
    mutationFn: async (p: { type: 'DETECT'|'RENDER'; mediaId?: UUID; clipId?: UUID; params?: any }) => {
      const { data } = await api.post<string>(`/v1/clips/enqueue-render`, p)
      return data
    }
  })
}
export function useEnqueueDetect() {
  return useMutation({
    mutationFn: async (p: { mediaId: string; lang?: string; provider?: string; sceneThreshold?: number }) => {
      const { data } = await api.post<{ jobId: string; mediaId: string; status: string }>(
        `/v1/media/${p.mediaId}/detect`,
        { lang: p.lang, provider: p.provider, sceneThreshold: p.sceneThreshold }
      )
      return data
    },
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

export function useProjectClipsInfinite(args: {
  projectId: string; ownerExternalSubject: string;
  q?: string; minDurMs?: number; maxDurMs?: number;
  sort?: 'createdAt'|'score'|'duration'; order?: 'asc'|'desc';
  size?: number;
}) {
  const { projectId, ownerExternalSubject, size = 50, ...filters } = args
  return useInfiniteQuery({
    queryKey: ['project-clips-inf', projectId, ownerExternalSubject, filters, size],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/v1/projects/${projectId}/clips`, {
        params: { ownerExternalSubject, page: pageParam, size, ...filters }
      })
      return data as Page<ClipResponse>
    },
    getNextPageParam: (lastPage) => {
      const { number, totalPages } = lastPage
      return number + 1 < totalPages ? number + 1 : undefined
    },
  })
}
export type MeResponse = {
  id: string; name: string; handle?: string; email: string; avatarUrl?: string;
  plan: 'Free'|'Pro'; usage?: { creditsUsed: number; creditsTotal: number };
  connections?: Array<{ provider: string; connected: boolean }>
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<MeResponse>('/v1/me')).data,
    staleTime: 30_000,
  })
}
export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: Partial<MeResponse>) => (await api.put('/v1/me', p)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
export function useMeUsage() {
  return useQuery({
    queryKey: ['me-usage'],
    queryFn: async () => (await api.get('/v1/me/usage')).data as { creditsUsed:number; creditsTotal:number },
    refetchInterval: 15_000,
  })
}
export function useConnections() {
  return useQuery({
    queryKey: ['me-connections'],
    queryFn: async () => (await api.get('/v1/me/connections')).data as Array<{provider:string;connected:boolean}>,
  })
}

/*==== Player */
export type AssetResponse = {
  id: string
  kind: 'CLIP_MP4' | 'THUMBNAIL' | 'SUB_SRT' | 'SUB_VTT' | string
  objectKey: string
  size: number
  createdAt: string
  relatedClipId?: string | null
  relatedMediaId?: string | null
}

export function useLatestClipAsset(clipId?: string, kind: string = 'CLIP_MP4') {
  return useQuery({
    enabled: !!clipId && !!kind,
    queryKey: ['latest-asset', clipId, kind],
    queryFn: async () => {
      try {
        const { data } = await api.get<AssetResponse>(`/v1/assets/latest/clip/${clipId}`, { params: { kind } })
        return data
      } catch (e:any){
        if(e?.response?.status === 404) return null
        throw e
      }
    },
    retry: false,
  })
}

export function useOnScreen<T extends HTMLElement>(rootMargin = '0px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { root: null, rootMargin, threshold: 0.01 }
    )
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [rootMargin])

  return { ref, inView }
}

// export function useClipPlayback(clipId?: string) {
//   const enabled = !!clipId
//
//   const mp4 = useQuery({
//     queryKey: ['clip-asset', clipId, 'CLIP_MP4'],
//     enabled,
//     queryFn: () => fetchLatestAssetForClip(clipId!, 'CLIP_MP4'),
//     refetchInterval: (d) => (d ? false : 1500),
//     retry: (count, err: any) =>
//       count < 30 && err?.response?.status === 404, // 30x ~ 45s
//   })
//
//   const vtt = useQuery({
//     queryKey: ['clip-asset', clipId, 'SUB_VTT'],
//     enabled,
//     queryFn: () => fetchLatestAssetForClip(clipId!, 'SUB_VTT'),
//     retry: 1,
//   })
//
//   const thumb = useQuery({
//     queryKey: ['clip-asset', clipId, 'THUMBNAIL'],
//     enabled,
//     queryFn: () => fetchLatestAssetForClip(clipId!, 'THUMBNAIL'),
//     retry: 1,
//   })
//
//   const src        = mp4.data ? fileOutUrl(mp4.data.objectKey) : undefined
//   const download   = mp4.data ? fileOutUrl(mp4.data.objectKey, { dl: true }) : undefined
//   const vttUrl     = vtt.data ? fileOutUrl(vtt.data.objectKey) : undefined
//   const poster     = thumb.data ? fileOutUrl(thumb.data.objectKey) : undefined
//
//   return {
//     isReady: !!src,
//     loading: mp4.isLoading,
//     error: mp4.isError ? (mp4.error as any)?.message : undefined,
//     src,
//     vtt: vttUrl,
//     poster,
//     downloadUrl: download,
//   }
// }

