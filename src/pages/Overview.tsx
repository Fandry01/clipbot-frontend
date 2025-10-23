// src/pages/Overview.tsx
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
  useCreateProjectBySubject,
  useCreateMediaFromUrl,
  useLinkMediaToProjectBySubject,
  useMetadata,
  useUploadLocal,
  useEnqueueDetect,         // ✅ gebruik deze
  // useEnqueueClipRender,   // ← laat staan als je ‘m elders nodig hebt
} from '../api/hooks'
import ProjectCardSkeleton from '../components/ProjectCardSkeleton'
import { useToast } from '../components/Toast'

const externalSubject =
  localStorage.getItem('externalSubject') || 'demo-user-1'
localStorage.setItem('externalSubject', externalSubject)

export default function Overview() {
  const [source, setSource] = useState<{ type: 'url' | 'file'; value: string; name?: string; file?: File } | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const nav = useNavigate()
  const { success, error, info } = useToast()

  // data hooks
  const projectsQ = useProjectsBySubject(externalSubject, 0, 12)
  const createProject = useCreateProjectBySubject()
  const createFromUrl = useCreateMediaFromUrl()
  const linkMedia = useLinkMediaToProjectBySubject()
  const uploadLocal = useUploadLocal()
  const enqueueDetect = useEnqueueDetect()      // ✅

  const metaQ = useMetadata(source?.type === 'url' ? source.value : undefined)
  const isBusy = createProject.isPending || createFromUrl.isPending || linkMedia.isPending
  const projects = useMemo(() => projectsQ.data?.content ?? [], [projectsQ.data])
  const showEmpty = !projectsQ.isLoading && projectsQ.isError && projects.length === 0
  const [flowOpen, setFlowOpen] = useState(false)
  const [flowStep, setFlowStep] = useState<{ title: string; subtitle?: string; pct?: number } | null>(null)

  const setStep = (title: string, subtitle?: string, pct?: number) => {
    setFlowOpen(true)
    setFlowStep({ title, subtitle, pct })
  }

  const startDetectImmediately = true

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
                      thumb: (p as any).thumbUrl || '/src/assets/thumb1.jpg',
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
          disabled={isBusy || uploadPct !== null}
          busyLabel={
            uploadPct !== null
              ? `Uploading… ${uploadPct}%`
              : createFromUrl.isPending
              ? 'Registering media…'
              : linkMedia.isPending
              ? 'Linking to project…'
              : createProject.isPending
              ? 'Creating project…'
              : undefined
          }
          metadata={source?.type === 'url' ? metaQ.data : undefined}
          metaLoading={source?.type === 'url' ? metaQ.isLoading : false}
          metaError={source?.type === 'url' && metaQ.isError ? 'Failed to fetch metadata' : undefined}
          onStartJob={async (payload) => {
            try {
              setStep('Creating project…', 'Initializing workspace')
              const title =
                (payload?.title && String(payload.title).trim()) ||
                metaQ.data?.title ||
                'New project'

              // 1) project kiezen of maken
              const project =
                projects[0] ||
                (await createProject.mutateAsync({
                  ownerExternalSubject: externalSubject,
                  title,
                  templateId: null,
                }))

              // 2) media registreren
              let mediaId: string
              if (source.type === 'url') {
                setStep('Registering media…', 'Saving external link')
                const m = await createFromUrl.mutateAsync({
                  ownerId: project.ownerId,
                  url: source.value,
                })
                mediaId = m.mediaId
              } else {
                const file = source.file // ✅ we gaan zo CenterUploadCard aanpassen
                if (!file) throw new Error('No file in source')
                setUploadPct(0)
                setStep('Uploading…', file.name, 0)
                const up = await uploadLocal.upload({
                  owner: project.ownerId,
                  file,
                  onProgress: (pct) => setUploadPct(pct),
                })
                mediaId = up.mediaId
              }

              // 3) media → project koppelen
              setStep('Linking to project…', 'Associating media')
              await linkMedia.mutateAsync({
                projectId: project.id,
                ownerExternalSubject: externalSubject,
                mediaId,
              })
              success('Media linked to project ✅')

              // 4) detectie optioneel starten (géén /v1/jobs)
              if (startDetectImmediately) {
                setStep('Detecting & transcribing…', 'Running background jobs')
                info('Detecting segments & transcript…')
                try {
                  const res = await enqueueDetect.mutateAsync({
                    mediaId,
                    lang: 'auto',
                    provider: 'openai',
                  })
                  // res heeft { jobId, mediaId, status } – geen polling nodig voor MVP
                  console.log('Detect enqueued', res)
                } catch (e) {
                  console.warn('Detect enqueue failed', e)
                }
              }

              // 5) navigeren
              setStep('All set ✅', 'Opening your clips…', 100)
              nav(`/dashboard/project/${project.id}`)
            } catch (e: any) {
              error(e?.message || 'Failed to start')
            } finally {
              setUploadPct(null)
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
