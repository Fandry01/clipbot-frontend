import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ClipCard, { Clip } from '../components/ClipCard'
import ClipPreviewModal from '../components/ClipPreviewModal'
import { useProjectClipsInfinite } from '../api/hooks'
import LoadMore from '../components/LoadMore'
import { SAMPLE_PROJECT_ID, sampleClips } from '../sample/sampleData'
import { useUpdateClipStatus, useEnqueueRender } from '../api/hooks'
import { useToast } from '../components/Toast'


const ownerId =
    (localStorage.getItem('ownerId') as string) ||
    '00000000-0000-0000-0000-000000000001'

type DurFilter = 'all' | 'lt30' | '30to60' | 'gt60'
type ScoreFilter = 'all' | '70' | '80' | '90'
type SortKey = 'scoreDesc' | 'newest' | 'shortAsc' | 'longDesc'

// helpers
const fmtSec = (s: number) => {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${String(ss).padStart(2, '0')}`
}

const mapToUIClip = (c: any): Clip & { _durationSec: number; _createdAt?: string } => {
  const durationMs =
      c.durationMs ??
      (typeof c.endMs === 'number' && typeof c.startMs === 'number'
          ? c.endMs - c.startMs
          : 0)
  const durationSec = Math.max(0, Math.round(durationMs / 1000))
  return {
    id: c.id,
    title: c.title || 'Untitled',
    thumb: c.thumbUrl || '/thumb-fallback.jpg', // zet een fallback in /public
    duration: fmtSec(durationSec),
    score: c.score ?? 0,
    captions: c.captions ?? false,
    scheduled: false,
    _durationSec: durationSec,
    _createdAt: c.createdAt,
  }
}

export default function ProjectClips() {
  const { id: projectId = '' } = useParams()
  const isSample = projectId === SAMPLE_PROJECT_ID
  const nav = useNavigate()

  // URL-state
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [dur, setDur] = useState<DurFilter>((sp.get('dur') as DurFilter) ?? 'all')
  const [score, setScore] = useState<ScoreFilter>((sp.get('score') as ScoreFilter) ?? 'all')
  const [ccOnly, setCcOnly] = useState(sp.get('cc') === '1')
  const [sort, setSort] = useState<SortKey>((sp.get('sort') as SortKey) ?? 'scoreDesc')

  // URL sync
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

  // Server-side params
  const minDurMs =
      dur === 'lt30' ? 0 : dur === '30to60' ? 30000 : dur === 'gt60' ? 61000 : undefined
  const maxDurMs = dur === 'lt30' ? 29000 : dur === '30to60' ? 60000 : undefined
  const apiSort =
      sort === 'scoreDesc'
          ? 'score'
          : sort === 'shortAsc' || sort === 'longDesc'
              ? 'duration'
              : 'createdAt'
  const order = sort === 'shortAsc' ? 'asc' : 'desc'

  // Infinite data (alleen bij echte projecten)
  const size = 50
  const inf = !isSample
      ? useProjectClipsInfinite({
        projectId,
        ownerId,
        q,
        minDurMs,
        maxDurMs,
        sort: apiSort as any,
        order: order as any,
        size,
      })
      : null

  // Pages samenvoegen → UI model
  const pages = inf?.data?.pages ?? []
  const apiUiClips = useMemo(
      () => pages.flatMap((p) => (p.content || [])).map(mapToUIClip),
      [pages]
  )

  // Kies bron: sample of api
  const uiClipsRaw = isSample ? sampleClips : apiUiClips

  // Client-side lichte filters (score/CC)
  const filtered = useMemo(() => {
    const sMin = score === 'all' ? 0 : score === '70' ? 70 : score === '80' ? 80 : 90
    return (uiClipsRaw || []).filter((c) => {
      if (ccOnly && !c.captions) return false
      if (c.score < sMin) return false
      return true
    })
  }, [uiClipsRaw, ccOnly, score])

  const isLoading = inf?.isLoading ?? false
  const isFetchingNext = inf?.isFetchingNextPage ?? false
  const hasNext = inf?.hasNextPage ?? false
  const totalDisplay = isSample
      ? filtered.length
      : pages[0]?.totalElements ?? filtered.length // Spring Page heeft totalElements op page 0

  const { success, error, info } = useToast()
  const updateStatus = useUpdateClipStatus()
  const enqueueRender = useEnqueueRender()


  // Selection + modal
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
  const active = filtered[activeIdx] ?? null

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') setOpen(false)
        if ((e.key === 'a' || e.key === 'A') && active) alert(`Approve ${active.id}`)
        if ((e.key === 'r' || e.key === 'R') && active) alert(`Reject ${active.id}`)
        return
      }
      if (['ArrowRight', 'ArrowDown'].includes(e.key))
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
      if (['ArrowLeft', 'ArrowUp'].includes(e.key))
        setActiveIdx((i) => Math.max(i - 1, 0))
      if (e.key === 'Enter' && filtered[activeIdx]) setOpen(true)
      if (e.key === 'Escape' && selectMode) {
        setSelectMode(false)
        clearSel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, active, filtered, activeIdx, selectMode])

  // Bulk stubs (later toasts + echte API)
  const bulkApprove = () => alert(`Approve ${selected.size} clips`)
  const bulkReject = () => alert(`Reject ${selected.size} clips`)
  const bulkEdit = () => alert(`Edit ${selected.size} clips`)

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Project #{projectId} — Clips</h1>
            {isSample && <span className="badge">Sample</span>}
          </div>
          <div className="text-sm text-muted">
            {isLoading ? 'Loading…' : `${totalDisplay} results`}
          </div>
        </div>

        {/* Search + Filters + Sort + Select toggle */}
        <div className="card p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg px-3 py-2 flex-1 min-w-[260px]">
              <svg width="16" height="16" viewBox="0 0 24 24" className="text-muted">
                <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
                />
              </svg>
              <input
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Find keywords or moments…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {/* Duration chips */}
            <div className="flex items-center gap-2">
              <Chip active={dur === 'all'} onClick={() => setDur('all')}>
                All dur.
              </Chip>
              <Chip active={dur === 'lt30'} onClick={() => setDur('lt30')}>
                {'<'}30s
              </Chip>
              <Chip active={dur === '30to60'} onClick={() => setDur('30to60')}>
                30–60s
              </Chip>
              <Chip active={dur === 'gt60'} onClick={() => setDur('gt60')}>
                {'>'}60s
              </Chip>
            </div>

            {/* Score chips */}
            <div className="flex items-center gap-2">
              <Chip active={score === 'all'} onClick={() => setScore('all')}>
                All scores
              </Chip>
              <Chip active={score === '70'} onClick={() => setScore('70')}>
                70+
              </Chip>
              <Chip active={score === '80'} onClick={() => setScore('80')}>
                80+
              </Chip>
              <Chip active={score === '90'} onClick={() => setScore('90')}>
                90+
              </Chip>
            </div>

            {/* CC toggle */}
            <label className="ml-auto flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                  type="checkbox"
                  checked={ccOnly}
                  onChange={() => setCcOnly((v) => !v)}
              />
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
            <button
                className="btn-ghost"
                onClick={() => {
                  setSelectMode((v) => !v)
                  if (selectMode) clearSel()
                }}
            >
              {selectMode ? 'Exit select' : 'Select'}
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selectMode && selected.size > 0 && (
            <div className="card p-3 flex items-center justify-between">
              <div className="text-sm">{selected.size} selected</div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost" onClick={bulkApprove}>
                  Approve
                </button>
                <button className="btn-ghost" onClick={bulkEdit}>
                  Edit
                </button>
                <button className="btn-ghost" onClick={bulkReject}>
                  Reject
                </button>
                <button className="btn-ghost" onClick={clearSel}>
                  Clear
                </button>
              </div>
            </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-lg bg-white/5 animate-pulse" />
              ))
          ) : (
              filtered.map((c, idx) => (
                  <ClipCard
                      key={c.id}
                      clip={c}
                      selectable={!isSample && selectMode}
                      selected={selected.has(c.id)}
                      onSelectToggle={isSample ? undefined : () => toggleSel(c.id)}
                      onClick={() => {
                        setActiveIdx(idx)
                        setOpen(true)
                      }}
                  />
              ))
          )}
        </div>

        {/* Infinite loader (geen voor sample) */}
        {!isSample && (
            <LoadMore
                disabled={isLoading || isFetchingNext || !hasNext}
                onVisible={() => inf?.fetchNextPage()}
            />
        )}

        {/* Modal */}
        <ClipPreviewModal
            open={open}
            clip={active ?? null}
            onClose={() => setOpen(false)}
            onApprove={(c) => {
              if (isSample) { info('Demo — not available'); setOpen(false); return }
              updateStatus.mutate(
                  { id: c.id, status: 'APPROVED' },
                  {
                    onSuccess: () => { success('Clip approved'); setOpen(false) },
                    onError: () => error('Failed to approve'),
                  }
              )
            }}
            onReject={(c) => {
              if (isSample) { info('Demo — not available'); setOpen(false); return }
              updateStatus.mutate(
                  { id: c.id, status: 'REJECTED' },
                  {
                    onSuccess: () => { success('Clip rejected'); setOpen(false) },
                    onError: () => error('Failed to reject'),
                  }
              )
            }}
            onEdit={(c) => nav(`/dashboard/clip/${c.id}/edit`)}
            // Optioneel: Render-knop in je modal-component toevoegen -> handler:
            onRender={(c) => {
              if (isSample) { info('Demo — not available'); return }
              enqueueRender.mutate(c.id, {
                onSuccess: () => success('Render enqueued'),
                onError: () => error('Failed to enqueue render'),
              })
            }}
        />

      </div>
  )
}

/* ---------- Chip ---------- */
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
          className={`px-3 py-1 rounded-full text-sm border ${
              active ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'
          }`}
          onClick={onClick}
      >
        {children}
      </button>
  )
}
