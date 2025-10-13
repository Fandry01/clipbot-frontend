import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ClipCard, { Clip } from '../components/ClipCard'
import ClipPreviewModal from '../components/ClipPreviewModal'
import { useNavigate } from 'react-router-dom'

// Helpers
const toSec = (t: string) => {
  const [m, s] = t.split(':').map(Number)
  return (m || 0) * 60 + (s || 0)
}
const inRange = (val: number, min?: number, max?: number) =>
    (min === undefined || val >= min) && (max === undefined || val <= max)

type DurFilter = 'all' | 'lt30' | '30to60' | 'gt60'
type ScoreFilter = 'all' | '70' | '80' | '90'
type SortKey = 'scoreDesc' | 'newest' | 'shortAsc' | 'longDesc'

const mockClips: Record<string, Clip[]> = {
  '1': [
    { id: 'c1', title: 'From Office to Store: How Viral Merch Created an Ice Cream Empire!', thumb: '/src/assets/thumb1.jpg', duration: '00:58', score: 96, captions: true },
    { id: 'c2', title: "Homeless to $150M? Danny Duncan's Wild YouTube Empire!", thumb: '/src/assets/thumb2.jpg', duration: '01:13', score: 89 },
    { id: 'c3', title: 'He Bought a TOWN?! Real Estate Adventure!', thumb: '/src/assets/thumb3.jpg', duration: '01:20', score: 85 },
    { id: 'c4', title: 'From YMCA to YouTube Superstar', thumb: '/src/assets/thumb2.jpg', duration: '00:45', score: 81, captions: true },
    { id: 'c5', title: "Danny's Building a CRAZY HQ!", thumb: '/src/assets/thumb1.jpg', duration: '01:00', score: 78 },
    { id: 'c6', title: 'Ice Cream Empire! From Truck to Mall Madness', thumb: '/src/assets/thumb3.jpg', duration: '00:33', score: 77, scheduled: true },
  ],
  '2': [
    { id: 'c7', title: '12 Threes In a Row — the drill', thumb: '/src/assets/thumb1.jpg', duration: '00:14', score: 83 },
  ],
  '3': [
    { id: 'c8', title: 'Lex asks about bass technique', thumb: '/src/assets/thumb3.jpg', duration: '01:26', score: 92, captions: true },
  ],
}

export default function ProjectClips() {
  const { id } = useParams()
  const clips = mockClips[id ?? '1'] ?? []
  const nav = useNavigate()

  // URL-state
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [dur, setDur] = useState<DurFilter>((sp.get('dur') as DurFilter) ?? 'all')
  const [score, setScore] = useState<ScoreFilter>((sp.get('score') as ScoreFilter) ?? 'all')
  const [ccOnly, setCcOnly] = useState(sp.get('cc') === '1')
  const [sort, setSort] = useState<SortKey>((sp.get('sort') as SortKey) ?? 'scoreDesc')

  // keep URL in sync
  useEffect(() => {
    const next = new URLSearchParams(sp)
    q ? next.set('q', q) : next.delete('q')
    dur !== 'all' ? next.set('dur', dur) : next.delete('dur')
    score !== 'all' ? next.set('score', score) : next.delete('score')
    ccOnly ? next.set('cc', '1') : next.delete('cc')
    sort !== 'scoreDesc' ? next.set('sort', sort) : next.delete('sort')
    setSp(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dur, score, ccOnly, sort])

  // filter
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase()
    return clips.filter((c) => {
      if (qLower && !c.title.toLowerCase().includes(qLower)) return false
      if (ccOnly && !c.captions) return false
      const secs = toSec(c.duration.replace('00:', '0:'))
      const durPass =
          dur === 'all' ||
          (dur === 'lt30' && inRange(secs, undefined, 29)) ||
          (dur === '30to60' && inRange(secs, 30, 60)) ||
          (dur === 'gt60' && inRange(secs, 61, undefined))
      if (!durPass) return false
      const sMin = score === 'all' ? 0 : score === '70' ? 70 : score === '80' ? 80 : 90
      if (c.score < sMin) return false
      return true
    })
  }, [clips, q, dur, score, ccOnly])

  // sort
  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      if (sort === 'scoreDesc') return b.score - a.score
      if (sort === 'shortAsc') return toSec(a.duration) - toSec(b.duration)
      if (sort === 'longDesc') return toSec(b.duration) - toSec(a.duration)
      // 'newest' (fake using id desc)
      return (b.id > a.id ? 1 : -1)
    })
    return arr
  }, [filtered, sort])

  // selection + modal
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggleSel = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }
  const clearSel = () => setSelected(new Set())

  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const active = sorted[activeIdx] ?? null

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') setOpen(false)
        if ((e.key === 'a' || e.key === 'A') && active) alert(`Approve ${active.id}`)
        if ((e.key === 'r' || e.key === 'R') && active) alert(`Reject ${active.id}`)
        return
      }
      if (['ArrowRight','ArrowDown'].includes(e.key)) setActiveIdx((i) => Math.min(i + 1, sorted.length - 1))
      if (['ArrowLeft','ArrowUp'].includes(e.key)) setActiveIdx((i) => Math.max(i - 1, 0))
      if (e.key === 'Enter' && sorted[activeIdx]) setOpen(true)
      if (e.key === 'Escape' && selectMode) { setSelectMode(false); clearSel() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, active, sorted, activeIdx, selectMode])

  // bulk actions (stubs)
  const bulkApprove = () => alert(`Approve ${selected.size} clips`)
  const bulkReject = () => alert(`Reject ${selected.size} clips`)
  const bulkEdit = () => alert(`Edit ${selected.size} clips`)

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Project #{id} — Clips</h1>
          <div className="text-sm text-muted">{sorted.length} results</div>
        </div>

        {/* Search + Filters + Sort + Select toggle */}
        <div className="card p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg px-3 py-2 flex-1 min-w-[260px]">
              <svg width="16" height="16" viewBox="0 0 24 24" className="text-muted"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
              <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Find keywords or moments…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>

            {/* Duration chips */}
            <div className="flex items-center gap-2">
              <Chip active={dur === 'all'} onClick={() => setDur('all')}>All dur.</Chip>
              <Chip active={dur === 'lt30'} onClick={() => setDur('lt30')}>{'<'}30s</Chip>
              <Chip active={dur === '30to60'} onClick={() => setDur('30to60')}>30–60s</Chip>
              <Chip active={dur === 'gt60'} onClick={() => setDur('gt60')}>{'>'}60s</Chip>
            </div>

            {/* Score chips */}
            <div className="flex items-center gap-2">
              <Chip active={score === 'all'} onClick={() => setScore('all')}>All scores</Chip>
              <Chip active={score === '70'} onClick={() => setScore('70')}>70+</Chip>
              <Chip active={score === '80'} onClick={() => setScore('80')}>80+</Chip>
              <Chip active={score === '90'} onClick={() => setScore('90')}>90+</Chip>
            </div>

            {/* CC toggle */}
            <label className="ml-auto flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={ccOnly} onChange={() => setCcOnly((v) => !v)} />
              Captions only
            </label>

            {/* Sort */}
            <select
                className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                title="Sort clips"
            >
              <option value="scoreDesc">Highest score</option>
              <option value="newest">Newest</option>
              <option value="shortAsc">Shortest</option>
              <option value="longDesc">Longest</option>
            </select>

            {/* Select mode */}
            <button className="btn-ghost" onClick={() => { setSelectMode((v) => !v); if (selectMode) clearSel() }}>
              {selectMode ? 'Exit select' : 'Select'}
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selectMode && selected.size > 0 && (
            <div className="card p-3 flex items-center justify-between">
              <div className="text-sm">{selected.size} selected</div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost" onClick={bulkApprove}>Approve</button>
                <button className="btn-ghost" onClick={bulkEdit}>Edit</button>
                <button className="btn-ghost" onClick={bulkReject}>Reject</button>
                <button className="btn-ghost" onClick={clearSel}>Clear</button>
              </div>
            </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {sorted.map((c, idx) => (
              <ClipCard
                  key={c.id}
                  clip={c}
                  selectable={selectMode}
                  selected={selected.has(c.id)}
                  onSelectToggle={(id) => toggleSel(id)}
                  onClick={() => { setActiveIdx(idx); setOpen(true) }}
              />
          ))}
        </div>

        {/* Modal */}
        <ClipPreviewModal
            open={open}
            clip={active ?? null}
            onClose={() => setOpen(false)}
            onApprove={(c) => { alert('Approve ' + c.id); setOpen(false) }}
            onReject={(c) => { alert('Reject ' + c.id); setOpen(false) }}
            onEdit={(c) => nav(`/dashboard/clip/${c.id}/edit`)}
        />
      </div>
  )
}

function Chip({
                active,
                onClick,
                children,
              }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
      <button
          onClick={onClick}
          className={`px-3 py-1 rounded-full text-sm border ${
              active ? 'bg-white text-black border-white' : 'bg-transparent text-text border-border hover:bg-white/5'
          }`}
      >
        {children}
      </button>
  )
}
