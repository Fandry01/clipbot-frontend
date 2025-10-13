import { Link } from 'react-router-dom'

export type Project = {
  id: string
  title: string
  thumb: string
  plan: 'Free' | 'Pro'
  status: 'Demo' | 'Ready' | 'Rendering' | 'Error'
  duration: string
  coherence: number
  hook: number
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/dashboard/project/${project.id}`} className="group block relative card overflow-hidden">
      <div className="relative w-full h-40 bg-white/5">
        <img src={project.thumb} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="badge">{project.plan}</span>
          <span className="badge">{project.status}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium line-clamp-1">{project.title}</h3>
        <div className="flex items-center gap-1">
          <span className="badge">Coh {project.coherence.toFixed(2)}</span>
          <span className="badge">Hook {project.hook.toFixed(2)}</span>
        </div>
        <div className="text-xs text-muted">{project.duration}</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-10 group-hover:translate-y-0 transition">
        <div className="bg-black/50 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
          <span className="text-xs text-white/80">Open project</span>
        </div>
      </div>
    </Link>
  )
}
