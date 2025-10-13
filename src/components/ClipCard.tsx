export type Clip = {
  id: string
  title: string
  thumb: string
  duration: string
  score: number
  captions?: boolean
  scheduled?: boolean
}

export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="group relative card overflow-hidden">
      <div className="relative w-full h-64 bg-white/5">
        <img src={clip.thumb} alt={clip.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 text-xs flex gap-1">
          {clip.captions && <span className="badge">CC</span>}
          {clip.scheduled && <span className="badge">🗓</span>}
        </div>
        <div className="absolute top-2 left-2 text-xs">
          <span className="badge">{clip.duration}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium line-clamp-2 pr-2">{clip.title}</h3>
          <div className="text-green-400 font-semibold text-sm">{clip.score}</div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-10 group-hover:translate-y-0 transition">
        <div className="bg-black/50 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
          <button className="btn-ghost">Approve</button>
          <button className="btn-ghost">Edit</button>
          <button className="btn-ghost">Reject</button>
        </div>
      </div>
    </div>
  )
}
