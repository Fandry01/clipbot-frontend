import { useParams } from 'react-router-dom'
import ClipCard, { Clip } from '../components/ClipCard'

const mockClips: Record<string, Clip[]> = {
  '1': [
    { id: 'c1', title: 'From Office to Store: How Viral Merch Created an Ice Cream Empire!', thumb: '/src/assets/thumb1.jpg', duration: '00:58', score: 96, captions: true },
    { id: 'c2', title: 'Homeless to $150M? Danny Duncan\'s Wild YouTube Empire!', thumb: '/src/assets/thumb2.jpg', duration: '01:13', score: 89 },
    { id: 'c3', title: 'He Bought a TOWN?! Real Estate Adventure!', thumb: '/src/assets/thumb3.jpg', duration: '01:20', score: 85 },
    { id: 'c4', title: 'From YMCA to YouTube Superstar', thumb: '/src/assets/thumb2.jpg', duration: '00:45', score: 81, captions: true },
    { id: 'c5', title: 'Danny\'s Building a CRAZY HQ!', thumb: '/src/assets/thumb1.jpg', duration: '01:00', score: 78 },
    { id: 'c6', title: 'Ice Cream Empire! From Truck to Mall Madness', thumb: '/src/assets/thumb3.jpg', duration: '00:33', score: 77, scheduled: true },
  ],
  '2': [
    { id: 'c7', title: '12 Threes In a Row — the drill', thumb: '/src/assets/thumb1.jpg', duration: '00:14', score: 83 },
  ],
  '3': [
    { id: 'c8', title: 'Lex asks about bass technique', thumb: '/src/assets/thumb3.jpg', duration: '01:26', score: 92, captions: true },
  ]
}

export default function ProjectClips() {
  const { id } = useParams()
  const clips = mockClips[id ?? '1'] ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Project #{id} — Clips</h1>
        <div className="text-sm text-muted">{clips.length} suggestions</div>
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {clips.map(c => <ClipCard key={c.id} clip={c} />)}
      </div>
    </div>
  )
}
