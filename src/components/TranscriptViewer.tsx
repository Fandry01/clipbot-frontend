export type Word = { t: number; w: string } // t in seconds

export default function TranscriptViewer({
                                             words,
                                             q,
                                             onSeek,
                                         }: {
    words: Word[]
    q: string
    onSeek: (t: number) => void
}) {
    const ql = q.trim().toLowerCase()
    return (
        <div className="card p-3 h-[360px] overflow-auto text-sm space-y-2">
            {chunkWords(words, 12).map((line, i) => (
                <p key={i} className="leading-6">
                    {line.map((token, j) => {
                        const hit = ql && token.w.toLowerCase().includes(ql)
                        return (
                            <button
                                key={j}
                                onClick={() => onSeek(token.t)}
                                className={`mr-1 underline-offset-2 ${
                                    hit ? 'underline text-white' : 'hover:underline text-muted'
                                }`}
                                title={`${token.w} @ ${formatTime(token.t)}`}
                            >
                                {token.w}
                            </button>
                        )
                    })}
                </p>
            ))}
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
