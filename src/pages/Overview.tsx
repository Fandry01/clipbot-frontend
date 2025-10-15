// src/pages/Overview.tsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CenterUploadCard from '../components/CenterUploadCard'
import QuickActionsRail from '../components/QuickActionsRail'
import { sampleProject } from '../sample/sampleData'
import StorageChips from '../components/StorageChips'
import ProjectCard from '../components/ProjectCard'
import IntakePanel from '../components/IntakePanel'
import {
  useProjects,
  useCreateProject,
  useCreateMediaFromUrl,
  useLinkMediaToProject,
  useMetadata,
} from '../api/hooks'
import ProjectCardSkeleton from "../components/ProjectCardSkeleton";



const ownerId =
  (localStorage.getItem('ownerId') as string) ||
  '00000000-0000-0000-0000-000000000001'

export default function Overview() {
  const [source, setSource] = useState<{ type: 'url' | 'file'; value: string; name?: string } | null>(null)
  const nav = useNavigate()

  // data hooks
  const projectsQ = useProjects(ownerId, 0, 12)
  const createProject = useCreateProject()
  const createFromUrl = useCreateMediaFromUrl()
  const linkMedia = useLinkMediaToProject()
  const metaQ = useMetadata(source?.type === 'url' ? source.value : undefined)

  const isBusy = createProject.isPending || createFromUrl.isPending || linkMedia.isPending

  const projects = useMemo(() => projectsQ.data?.content ?? [], [projectsQ.data])
 const showEmpty = !projectsQ.isLoading && projectsQ.isError && projects.length === 0

  return (
    <div>
      {!source ? (
        <>
          <CenterUploadCard onStart={(src) => setSource(src)} />
          <QuickActionsRail />
          <div className="flex justify-end mt-4">
            <StorageChips />
          </div>

          <section className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">All projects</h2>
              <div className="text-sm text-muted">All · Saved</div>
            </div>

            {projectsQ.isLoading && (
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                  {Array.from({ length: 6 }).map((_, i) => (
                      <ProjectCardSkeleton key={i} />
                  ))}
                </div>
            )}

            {projectsQ.isError && (
              <div className="text-sm text-red-400">
                Failed to load projects.{' '}
                <button className="underline" onClick={() => projectsQ.refetch()}>
                  Retry
                </button>
              </div>
            )}

            {showEmpty && (
                <div className="space-y-3">
                  <div className="text-sm text-muted border border-dashed border-border rounded-lg p-6">
                    No projects yet. Start by pasting a URL or uploading a file above.
                  </div>

                  {/* Sample fallback */}
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
          disabled={isBusy}
          busyLabel={
            createFromUrl.isPending
              ? 'Registering media…'
              : linkMedia.isPending
              ? 'Linking to project…'
              : createProject.isPending
              ? 'Creating project…'
              : undefined
          }
          onStartJob={async (payload) => {
            try {
              const title = metaQ.data?.title || (payload as any)?.title || 'New project'

              // 1) kies of maak project
              const project =
                projects[0] ||
                (await createProject.mutateAsync({ ownerId, title, templateId: null }))

              // 2) media registreren
              let mediaId: string
              if (source.type === 'url') {
                const m = await createFromUrl.mutateAsync({ ownerId, url: source.value })
                mediaId = m.mediaId
              } else {
                // TODO: file-upload flow koppelen aan /v1/uploads/local + /v1/media
                throw new Error('Bestandsupload nog niet gekoppeld')
              }

              // 3) link media → project
              await linkMedia.mutateAsync({ projectId: project.id, ownerId, mediaId })

              // 4) navigeer naar project clips
              nav(`/dashboard/project/${project.id}`)
            } catch (e: any) {
              alert(e?.message || 'Failed to start')
            }
          }}
          onCancel={() => setSource(null)}
        />
      )}
    </div>
  )
}
