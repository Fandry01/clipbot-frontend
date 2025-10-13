import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Player from '../components/Player'
import QualityChecklist from '../components/QualityChecklist'

export default function ClipEditor() {
    const { id } = useParams()
    const nav = useNavigate()
    const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('9:16')
    const [tab, setTab] = useState<'trim'|'sub'|'brand'|'export'>('trim')
    const [qc] = useState({ boundary: true, noWordCut: true, leadInOut: true, loudness: true, subtitleCps: true })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* LEFT: player + timeline + tabs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Editing clip {id}</div>
                    <button className="btn-ghost" onClick={() => nav(-1)}>Back</button>
                </div>

                <Player poster="/src/assets/thumb2.jpg" aspect={aspect} />

                {/* simple timeline placeholder */}
                <div className="card p-3">
                    <div className="text-sm mb-2">Timeline</div>
                    <div className="h-24 bg-gradient-to-r from-white/10 to-white/5 rounded-lg relative">
                        {/* markers */}
                        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-white/60" />
                        <div className="absolute left-40 top-0 bottom-0 w-0.5 bg-white/60" />
                        <div className="absolute left-80 top-0 bottom-0 w-0.5 bg-white/60" />
                        <div className="absolute inset-x-0 bottom-0 text-[10px] text-muted px-2 py-1">waveform placeholder</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <button className="btn-ghost">I (Set In)</button>
                        <button className="btn-ghost">O (Set Out)</button>
                        <button className="btn-ghost">Snap boundary</button>
                        <button className="btn-ghost">+2s lead-in</button>
                    </div>
                </div>

                {/* tabs */}
                <div className="card p-3">
                    <div className="flex items-center gap-2 mb-3">
                        {(['trim','sub','brand','export'] as const).map(t => (
                            <button
                                key={t}
                                className={`px-3 py-1 rounded-full text-sm border ${tab===t ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'}`}
                                onClick={() => setTab(t)}
                            >
                                {t === 'trim' ? 'Trim' : t === 'sub' ? 'Subtitles' : t === 'brand' ? 'Brand' : 'Export'}
                            </button>
                        ))}
                    </div>

                    {tab === 'trim' && <div className="text-sm text-muted">Drag handles on timeline to trim. Use J/K/L, I/O, Alt/Shift arrows.</div>}

                    {tab === 'sub' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Subtitle style</span>
                                <button className="btn-ghost">Clean</button>
                                <button className="btn-ghost">Pop</button>
                                <button className="btn-ghost">Bold</button>
                            </div>
                            <div className="text-sm text-muted">CPS OK · 2 lines · safe area respected</div>
                        </div>
                    )}

                    {tab === 'brand' && (
                        <div className="space-y-2 text-sm">
                            <div>Logo: <span className="badge">upload</span></div>
                            <div>Colors: <span className="badge">primary</span> <span className="badge">secondary</span></div>
                            <div>Font: <span className="badge">Inter</span></div>
                        </div>
                    )}

                    {tab === 'export' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Preset</span>
                                <button className="btn-ghost">TikTok (9:16)</button>
                                <button className="btn-ghost">YouTube (16:9)</button>
                                <button className="btn-ghost">Square (1:1)</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Resolution</span>
                                <select className="bg-transparent border border-border rounded-lg px-2 py-1 text-sm">
                                    <option>1080x1920</option>
                                    <option>720x1280</option>
                                </select>
                            </div>
                            <button className="btn-primary mt-2">Export</button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: side tools */}
            <div className="space-y-3 lg:sticky lg:top-20 h-fit">
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
                <QualityChecklist qc={qc} />
            </div>
        </div>
    )
}
