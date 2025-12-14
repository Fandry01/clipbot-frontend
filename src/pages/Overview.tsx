// src/pages/Overview.tsx
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CenterUploadCard from '../components/CenterUploadCard'
import QuickActionsRail from '../components/QuickActionsRail'
import { sampleProject } from '../sample/sampleData'
import StorageChips from '../components/StorageChips'
import ProjectCard from '../components/ProjectCard'
import IntakePanel from '../components/IntakePanel'
import FlowProgressOverlay from '../components/FlowProgressOverlay'
import {
  useProjectsBySubject,
  useMetadata,
  useUploadLocal,
  useOneClickOrchestrate,
} from '../api/hooks'
import ProjectCardSkeleton from '../components/ProjectCardSkeleton'
import { useToast } from '../components/Toast'
import ClipDistributionBeams from '../components/ClipDistributionBeams'

const externalSubject =
    localStorage.getItem('externalSubject') || 'demo-user-1'
localStorage.setItem('externalSubject', externalSubject)

const VISITED_PROJECTS_KEY = 'visitedProjectIds'

const readVisitedProjects = () => {
  try {
    const raw = localStorage.getItem(VISITED_PROJECTS_KEY)
    if (!raw) return { ids: new Set<string>(), hasStoredValue: false }
    const parsed = JSON.parse(raw)
    return {
      ids: Array.isArray(parsed) ? new Set<string>(parsed as string[]) : new Set<string>(),
      hasStoredValue: true,
    }
  } catch (e) {
    console.warn('Failed to parse visited projects', e)
    return { ids: new Set<string>(), hasStoredValue: false }
  }
}

const persistVisitedProjects = (ids: Set<string>) => {
  try {
    localStorage.setItem(VISITED_PROJECTS_KEY, JSON.stringify(Array.from(ids)))
  } catch (e) {
    console.warn('Failed to persist visited projects', e)
  }
}

export default function Overview() {
  const [source, setSource] = useState<{ type: 'url' | 'file'; value: string; name?: string; file?: File } | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [idemKey, setIdemKey] = useState<string | null>(null)
  const [processingProjectId, setProcessingProjectId] = useState<string | null>(null)
  const [pendingProject, setPendingProject] = useState<{ id: string; title: string } | null>(null)
  const [visitedState, setVisitedState] = useState(() => readVisitedProjects())

  const nav = useNavigate()
  const { success, error, info } = useToast()

  // data hooks
  const projectsQ = useProjectsBySubject(externalSubject, 0, 12)
  const uploadLocal = useUploadLocal()
  const orchestrate = useOneClickOrchestrate()

  const metaQ = useMetadata(source?.type === 'url' ? source.value : undefined)
  const projects = useMemo(() => projectsQ.data?.content ?? [], [projectsQ.data])
  useEffect(() => {
    if (processingProjectId && projects.some((p) => p.id === processingProjectId)) {
      setProcessingProjectId(null)
      setPendingProject(null)
    }
  }, [processingProjectId, projects])
  useEffect(() => {
    if (!visitedState.hasStoredValue && projects.length > 0) {
      const next = new Set(projects.map((p) => p.id))
      setVisitedState({ ids: next, hasStoredValue: true })
      persistVisitedProjects(next)
    }
  }, [projects, visitedState.hasStoredValue])
  const showEmpty = !projectsQ.isLoading && !projectsQ.isError && projects.length === 0
  const projectCards = useMemo(() => {
    const cards = projects.map((p) => {
      const isProcessing = processingProjectId === p.id
      const isVisited = visitedState.ids.has(p.id)
      return {
        id: p.id,
        title: p.title,
        thumb: (p as any).thumbnailUrl || '/src/assets/thumb1.jpg',
        plan: 'Free',
        status: !isProcessing && !isVisited ? 'NEW' : '—',
        duration: '',
        coherence: 0,
        hook: 0,
        processingLabel: isProcessing ? 'Processing clips…' : undefined,
      }
    })

    if (pendingProject && !projects.some((p) => p.id === pendingProject.id)) {
      cards.unshift({
        id: pendingProject.id,
        title: pendingProject.title,
        thumb: '/src/assets/thumb-fallback.jpg',
        plan: 'Free',
        status: '—',
        duration: '',
        coherence: 0,
        hook: 0,
        processingLabel: 'Processing clips…',
      })
    }

    return cards
  }, [pendingProject, processingProjectId, projects, visitedState.ids])

  const [flowOpen, setFlowOpen] = useState(false)
  const [flowStep, setFlowStep] = useState<{ title: string; subtitle?: string; pct?: number } | null>(null)

  const setStep = (title: string, subtitle?: string, pct?: number) => {
    setFlowOpen(true)
    setFlowStep({ title, subtitle, pct })
  }

  return (
      <div className="space-y-6">
        {!source ? (
            <>
              <CenterUploadCard onStart={(src) => setSource(src)} />
              <QuickActionsRail />
              <ClipDistributionBeams className="mt-6" />
              <div className="flex justify-end mt-4">
                <StorageChips />
              </div>

              <section className="mt-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-lg font-semibold text-text">All projects</h2>
                  <div className="text-sm text-muted">All · Saved</div>
                </div>

                {projectsQ.isLoading && (
                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                      {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                    </div>
                )}

                {projectsQ.isError && (
                    <div className="text-sm text-red-200 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
                      Failed to load projects.{' '}
                      <button
                          className="underline underline-offset-2"
                          onClick={() => projectsQ.refetch()}
                      >
                        Retry
                      </button>
                    </div>
                )}

                {showEmpty && !pendingProject && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted border border-dashed border-border rounded-lg p-6 bg-white/2">
                        No projects yet. Start by pasting a URL or uploading a file above.
                      </div>
                      <div>

                        <div className="text-xs text-muted mb-2 flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Sample (click to explore)</span>
                      </div>
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                          <ProjectCard project={sampleProject} />
                        </div>
                      </div>
                    </div>
                )}

                {projectCards.length > 0 && (
                    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                      {projectCards.map((p) => (
                          <ProjectCard
                              key={p.id}
                              project={p}
                          />
                      ))}
                    </div>
                )}
              </section>
            </>
        ) : (
            <IntakePanel
                source={source}
                disabled={orchestrate.isPending || uploadPct !== null || metaQ.isFetching}
                busyLabel={
                  uploadPct !== null
                      ? `Uploading… ${uploadPct}%`
                      : orchestrate.isPending
                          ? 'Starting…'
                          : undefined
                }
                metadata={source?.type === 'url' ? metaQ.data : undefined}
                metaLoading={source?.type === 'url' ? metaQ.isLoading : false}
                metaError={source?.type === 'url' && metaQ.isError ? 'Failed to fetch metadata' : undefined}
                onStartJob={async (payload) => {
                  const idempotencyKey = idemKey ?? uuidv4()
                  setIdemKey(idempotencyKey)

                  try {
                    setStep('Preparing…', 'Initializing workflow')
                    let mediaId: string | undefined = undefined
                    let url: string | undefined = undefined

                    let title = (payload?.title ?? metaQ.data?.title ?? (source?.type === 'file' ? 'New upload' : 'New project')).trim()

                    if (source?.type === 'url') {
                      url = source.value
                    } else {
                      const file = source.file
                      if (!file) throw new Error('No file in source')
                      setUploadPct(0)
                      setStep('Uploading…', file.name, 0)
                      const up = await uploadLocal.upload({
                        owner: externalSubject,
                        file,
                        onProgress: (pct) => setUploadPct(pct),
                      })
                      mediaId = up.mediaId
                    }

                    setStep('Ingest + detect + recommendations', 'Scheduling background jobs')
                    const res = await orchestrate.mutateAsync({
                      ownerExternalSubject: externalSubject,
                      url,
                      mediaId,
                      title,
                      idempotencyKey,
                      opts: {
                        lang: 'auto',
                        provider: 'fw',
                        sceneThreshold: 0.3,
                        topN: 6,
                        enqueueRender: true,
                      },
                    })

                    if (res.detectJob?.jobId) info('Detect enqueued')
                    if (res.recommendations && res.recommendations.computed === 0) {
                      info('Recommendations komen zodra detect klaar is')
                    }

                    setStep('All set ✅', 'Opening your clips…', 100)
                    success('Flow started')
                    setProcessingProjectId(res.projectId)
                    setPendingProject({ id: res.projectId, title })
                    setSource(null)
                    nav('/dashboard/overview')
                    projectsQ.refetch().catch(() => {})
                  } catch (e: any) {
                    const msg = e?.response?.data || e?.message || 'Failed to start'
                    if (typeof msg === 'string' && msg.includes('ORCHESTRATION_IN_PROGRESS')) {
                      info('Flow is al bezig voor deze key. Probeer zo opnieuw.')
                    } else if (typeof msg === 'string' && msg.includes('IDEMPOTENCY_KEY_REUSED_DIFFERENT_REQUEST')) {
                      error('Zelfde idempotency key met andere payload. Genereer een nieuwe.')
                    } else {
                      error(msg)
                    }
                    setStep('Failed', typeof msg === 'string' ? msg : 'Something went wrong')
                  } finally {
                    setUploadPct(null)
                    setFlowOpen(false)
                    setIdemKey(null)
                  }
                }}
                onCancel={() => {
                  if (uploadPct !== null) uploadLocal.cancel()
                  setSource(null)
                }}
            />
        )}

        <FlowProgressOverlay
            open={flowOpen}
            title={flowStep?.title || 'Working…'}
            subtitle={flowStep?.subtitle}
            percent={flowStep?.pct}
        />
      </div>
  )
}
