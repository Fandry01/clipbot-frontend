// src/pages/Overview.tsx
import { v4 as uuidv4 } from 'uuid'
import { useMemo, useState } from 'react'
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

const externalSubject =
  localStorage.getItem('externalSubject') || 'demo-user-1'
localStorage.setItem('externalSubject', externalSubject)

export default function Overview() {
  const [source, setSource] = useState<{ type: 'url' | 'file'; value: string; name?: string; file?: File } | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [idemKey, setIdemKey] = useState<string | null>(null)

  const nav = useNavigate()
  const { success, error, info } = useToast()

  // data hooks
  const projectsQ = useProjectsBySubject(externalSubject, 0, 12)
  const uploadLocal = useUploadLocal()
  const orchestrate = useOneClickOrchestrate()

  const metaQ = useMetadata(source?.type === 'url' ? source.value : undefined)
  const projects = useMemo(() => projectsQ.data?.content ?? [], [projectsQ.data])
  const showEmpty = !projectsQ.isLoading && projectsQ.isError && projects.length === 0

  const [flowOpen, setFlowOpen] = useState(false)
  const [flowStep, setFlowStep] = useState<{ title: string; subtitle?: string; pct?: number } | null>(null)

  const setStep = (title: string, subtitle?: string, pct?: number) => {
    setFlowOpen(true)
    setFlowStep({ title, subtitle, pct })
  }

  return (
    <div>
      {!source ? (
        <>
          <CenterUploadCard onStart={(src) => setSource(src)} />
          <QuickActionsRail />
          <div className="flex justify-end mt-4"><StorageChips /></div>

          <section className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">All projects</h2>
              <div className="text-sm text-muted">All · Saved</div>
            </div>

            {projectsQ.isLoading && (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
              </div>
            )}

            {projectsQ.isError && (
              <div className="text-sm text-red-400">
                Failed to load projects. <button className="underline" onClick={() => projectsQ.refetch()}>Retry</button>
              </div>
            )}

            {showEmpty && (
              <div className="space-y-3">
                <div className="text-sm text-muted border border-dashed border-border rounded-lg p-6">
                  No projects yet. Start by pasting a URL or uploading a file above.
                </div>
                <div>
                  <div className="text-xs text-muted mb-2">Sample (click to explore)</div>
                  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    <ProjectCard project={sampleProject} />
                  </div>
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={{
                      id: p.id,
                      title: p.title,
                      // 👇 correcte prop-naam uit backend
                      thumb: (p as any).thumbnailUrl || '/src/assets/thumb1.jpg',
                      plan: 'Free',
                      status: '—',
                      duration: '',
                      coherence: 0,
                      hook: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <IntakePanel
          source={source}
          // knop disablen tijdens orchestrate, upload of metadata-fetch
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

              // Titel bepalen (getrimd)
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

              // Orchestrator call
              setStep('Ingest + detect + recommendations', 'Scheduling background jobs')
              const res = await orchestrate.mutateAsync({
                ownerExternalSubject: externalSubject,
                url,
                mediaId,
                title,
                idempotencyKey,
                opts: {
                  lang: 'auto',
                  // 👇 correcte provider naam
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
              nav(`/dashboard/project/${res.projectId}`)
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
              // Overlay open laten kan; of toon failure
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
