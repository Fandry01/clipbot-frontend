import { useEffect, useMemo, useRef } from 'react'

export type Word = { t: number; w: string }

export default function TranscriptViewer({
  words,
  q,
  currentTime,
  onSeek,
}: {
  words: Word[]
  q: string
  currentTime: number
  onSeek: (t: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement | null>(null)

  const ql = q.trim().toLowerCase()

  // Bepaal index van actief woord t.o.v. currentTime
  const activeIdx = useMemo(() => {
    if (!words?.length) return -1
    // Neem dichtstbijzijnde woord vóór/bij currentTime
    let lo = 0, hi = words.length - 1, ans = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (words[mid].t <= currentTime) {
        ans = mid
        lo = mid + 1
      } else hi = mid - 1
    }
    return ans
  }, [words, currentTime])

  // Auto-scroll naar actieve token
  useEffect(() => {
    if (!containerRef.current || activeIdx < 0) return
    // kleine delay tot element refs staan
    const el = activeRef.current
    if (!el) return
    const parent = containerRef.current
    const elTop = el.offsetTop
    const elBottom = elTop + el.offsetHeight
    const viewTop = parent.scrollTop
    const viewBottom = viewTop + parent.clientHeight
    // scroll alleen als buiten viewport
    if (elTop < viewTop + 40 || elBottom > viewBottom - 40) {
      parent.scrollTo({ top: Math.max(elTop - parent.clientHeight / 2, 0), behavior: 'smooth' })
    }
  }, [activeIdx])

  return (
    <div
      ref={containerRef}
      className="card p-3 h-[360px] overflow-auto text-sm space-y-2"
      role="region"
      aria-label="Transcript"
    >
      {chunkWords(words || [], 12).map((line, i) => (
        <p key={i} className="leading-6">
          {line.map((token, j) => {
            const idx = i * 12 + j
            const isActive = idx === activeIdx
            const hit = !!ql && token.w.toLowerCase().includes(ql)
            const cls =
              'mr-1 rounded-sm underline-offset-2 transition-colors ' +
              (isActive
                ? 'bg-white/15 text-white'
                : hit
                ? 'underline text-white'
                : 'hover:underline text-muted')

            return (
              <button
                key={j}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(token.t)}
                className={cls}
                title={`${token.w} @ ${formatTime(token.t)}`}
              >
                {token.w}
              </button>
            )
          })}
        </p>
      ))}
      {!words?.length && <div className="text-muted">No transcript available.</div>}
    </div>
  )
}

function chunkWords(words: Word[], size: number) {
  const out: Word[][] = []
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size))
  return out
}
function formatTime(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
