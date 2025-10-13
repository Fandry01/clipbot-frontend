import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Player from '../components/Player'
import TranscriptViewer, { Word } from '../components/TranscriptViewer'
import HighlightsList, { Highlight } from '../components/HighlightsList'
import QualityChecklist from '../components/QualityChecklist'

const words: Word[] = Array.from({ length: 180 }, (_, i) => ({
    t: i * 1.2,
    w: ['and','then','we','decided','to','go','all-in','on','the','ice-cream','truck'][i % 11],
}))

const highlights: Highlight[] = [
    { id: 'h1', start: 12, end: 58, title: 'Smarter merch pivot', coh: 0.88, hook: 0.74 },
    { id: 'h2', start: 62, end: 95, title: 'Sold out day one', coh: 0.91, hook: 0.79 },
    { id: 'h3', start: 110, end: 160, title: 'From truck to mall', coh: 0.83, hook: 0.71 },
]

export default function MediaDetail() {
    const { id } = useParams()
    const nav = useNavigate()
    const [q, setQ] = useState('')
    const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9')
    const [qc] = useState({ boundary: true, noWordCut: true, leadInOut: true, loudness: true, subtitleCps: false })

    const seek = (t: number) => {
        console.log('seek to', t) // hook into real player later
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            {/* LEFT: transcript + highlights */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <input
                        className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                        placeholder="Search transcript…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="btn-ghost" onClick={() => nav(-1)}>Back</button>
                </div>
                <TranscriptViewer words={words} q={q} onSeek={seek} />
                <div className="text-sm font-medium">Highlights</div>
                <HighlightsList
                    items={highlights}
                    onSelect={(hid) => console.log('select', hid)}
                    onApprove={(hid) => alert('Approved '+hid)}
                    onEdit={(hid) => nav(`/dashboard/clip/${hid}/edit`)}
                    onReject={(hid) => alert('Rejected '+hid)}
                />
            </div>

            {/* RIGHT: player + tools (sticky) */}
            <div className="space-y-3 lg:sticky lg:top-20 h-fit">
                <Player poster="/src/assets/thumb1.jpg" aspect={aspect} />
                <div className="card p-3 flex items-center gap-2">
                    <span className="text-sm">Aspect</span>
                    {(['16:9','1:1','9:16'] as const).map(a => (
                        <button
                            key={a}
                            className={`px-3 py-1 rounded-full text-sm border ${aspect===a ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'}`}
                            onClick={() => setAspect(a)}
                        >
                            {a}
                        </button>
                    ))}
                </div>
                <div className="card p-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium mr-2">1-tap fixes</span>
                    <button className="btn-ghost">Snap to sentence</button>
                    <button className="btn-ghost">+2s context</button>
                    <button className="btn-ghost">Normalize</button>
                </div>
                <QualityChecklist qc={qc} />
            </div>
        </div>
    )
}
