import { useMemo, useRef, useState } from 'react'

const PRESETS_KEY = 'brandTemplate.presets'
const STORAGE_KEY  = 'brandTemplate.v1'

type Preset = { id: string; name: string; tpl: any }

export default function IntakePanel({
                                        source,
                                        onStartJob,
                                    }: {
    source: { type: 'url' | 'file'; value: string; name?: string }
    onStartJob: (payload: any) => void
}) {
    // essentials
    const [lang, setLang] = useState('en')
    const [genre, setGenre] = useState<'auto'|'educational'|'podcast'|'vlog'|'gaming'>('auto')
    const [clipLength, setClipLength] = useState<'auto'|'short'|'0-30s'|'0-60s'|'0-3m'>('auto')

    // advanced (collapsed)
    const [showAdv, setShowAdv] = useState(false)
    const [model, setModel] = useState<'auto'|'quality'|'speed'>('auto')
    const [prompt, setPrompt] = useState('')
    const [srtName, setSrtName] = useState('')
    const srtRef = useRef<HTMLInputElement>(null)
    const duration = 58 * 60 + 10
    const [from, setFrom] = useState(0)
    const [to, setTo] = useState(duration)

    // templates
    const presets: Preset[] = useMemo(() => {
        try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]') } catch { return [] }
    }, [])
    const activeTpl = useMemo(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
    }, [])

    const credits = useMemo(() => {
        const minutes = Math.max(1, Math.round((to - from) / 60))
        const mult = model === 'quality' ? 1.5 : model === 'speed' ? 0.8 : 1
        return Math.ceil(1 + minutes * 0.1 * mult)
    }, [from, to, model])

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {/* source header */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted">
                    {source.type === 'url' ? 'Source: URL' : 'Source: File'} · {source.name ?? source.value}
                </div>
                <div className="badge">Credit usage ~ {credits}</div>
            </div>

            {/* 1) VIDEO PREVIEW */}
            <div className="relative bg-white/5 rounded-xl overflow-hidden shadow-card aspect-video w-full">
                <img src="/src/assets/thumb1.jpg" className="w-full h-full object-cover" />
            </div>

            {/* 2) ESSENTIAL CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select label="Speech language" value={lang} onChange={setLang} options={[
                    {value:'auto', label:'Auto'}, {value:'en', label:'English'}, {value:'nl', label:'Dutch'}, {value:'de', label:'German'}
                ]}/>
                <Select label="Genre" value={genre} onChange={(v)=>setGenre(v as any)} options={[
                    {value:'auto', label:'Auto'}, {value:'educational', label:'Educational'}, {value:'podcast', label:'Podcast'}, {value:'vlog', label:'Vlog'}, {value:'gaming', label:'Gaming'}
                ]}/>
                <Select label="Clip length" value={clipLength} onChange={(v)=>setClipLength(v as any)} options={[
                    {value:'auto', label:'Auto'}, {value:'short', label:'Very short'}, {value:'0-30s', label:'0–30s'}, {value:'0-60s', label:'0–60s'}, {value:'0-3m', label:'0–3m'}
                ]}/>
            </div>

            {/* 3) QUICK PRESETS */}
            <div className="card p-3">
                <div className="text-sm font-medium mb-2">Quick presets</div>
                <div className="flex flex-wrap gap-2">
                    <button className="btn-ghost" onClick={()=>setClipLength('0-30s')}>0–30s Reels</button>
                    <button className="btn-ghost" onClick={()=>{setClipLength('0-60s'); setGenre('podcast')}}>Podcast 60s</button>
                    <button className="btn-ghost" onClick={()=>{ setClipLength('auto'); setGenre('auto'); setModel('quality') }}>Quality+</button>
                </div>
            </div>

            {/* 4) MY TEMPLATES */}
            <div className="card p-3">
                <div className="text-sm font-medium mb-2">My templates</div>
                <div className="flex flex-wrap gap-2">
                    {activeTpl && <span className="badge">Active: {activeTpl.captionStyle ?? 'template'}</span>}
                    {presets.length === 0 && <span className="text-sm text-muted">No saved presets yet</span>}
                    {presets.map(p => (
                        <button key={p.id} className="btn-ghost" onClick={()=>alert(`Would apply preset: ${p.name}`)}>
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ADVANCED (collapsible) */}
            <div className="card p-3">
                <button className="btn-ghost" onClick={()=>setShowAdv(v=>!v)}>
                    {showAdv ? 'Hide advanced' : 'Show advanced'}
                </button>

                {showAdv && (
                    <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Select label="Clip model" value={model} onChange={(v)=>setModel(v as any)} options={[
                                {value:'auto', label:'Auto'}, {value:'quality', label:'Quality+'}, {value:'speed', label:'Speed'}
                            ]}/>
                            <label className="text-sm">
                                <div className="text-muted mb-1">Upload .SRT (optional)</div>
                                <button className="btn-ghost w-full" onClick={() => srtRef.current?.click()}>Choose .srt</button>
                                <input ref={srtRef} hidden type="file" accept=".srt" onChange={(e) => {
                                    const f = e.target.files?.[0]; if (f) setSrtName(f.name)
                                }} />
                                {srtName && <div className="mt-1 badge">{srtName}</div>}
                            </label>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm">Include specific moments <span className="text-muted">(optional)</span></div>
                            <textarea
                                className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                                placeholder="Example: Compile all the hilarious moments"
                                value={prompt}
                                onChange={(e)=>setPrompt(e.target.value)}
                            />
                        </div>

                        <Timeframe from={from} to={to} duration={duration} onChange={(a,b)=>{ setFrom(a); setTo(b) }} />
                    </div>
                )}
            </div>

            {/* START */}
            <div className="flex items-center justify-end gap-2">
                <div className="text-sm text-muted">Using video you don’t own may violate copyright laws.</div>
                <button
                    className="btn-primary"
                    onClick={() => onStartJob({
                        source, lang, genre, clipLength,
                        // advanced payload (kan leeg zijn als verborgen)
                        model, prompt, srtName, from, to, estimatedCredits: credits
                    })}
                >
                    Start clipping
                </button>
            </div>
        </div>
    )
}

/* small UI helpers */
function Select({
                    label, value, onChange, options
                }: { label: string; value: string; onChange: (v:string)=>void; options:{value:string,label:string}[] }) {
    return (
        <label className="text-sm">
            <div className="text-muted mb-1">{label}</div>
            <select className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                    value={value} onChange={(e)=>onChange(e.target.value)}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    )
}

function Timeframe({
                       from, to, duration, onChange
                   }: { from:number; to:number; duration:number; onChange:(a:number,b:number)=>void }) {
    const clamp = (v:number) => Math.min(duration, Math.max(0, v))
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="text-sm">Processing timeframe <span className="badge">Credit saver</span></div>
                <div className="text-xs text-muted">
                    Total {fmt(from)} – {fmt(to)} / {fmt(duration)}
                </div>
            </div>
            {/* simple from/to inputs – je dual slider kan hier ook blijven, dit is compacter */}
            <div className="grid grid-cols-2 gap-2">
                <Input label="From (sec)" value={from} onChange={(v)=>onChange(clamp(v), to)} />
                <Input label="To (sec)"   value={to}   onChange={(v)=>onChange(from, clamp(v))} />
            </div>
        </div>
    )
}

function Input({label, value, onChange}:{label:string; value:number; onChange:(v:number)=>void}) {
    return (
        <label className="text-sm">
            <div className="text-muted mb-1">{label}</div>
            <input
                type="number"
                className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                value={value}
                onChange={(e)=>onChange(Number(e.target.value))}
            />
        </label>
    )
}
function fmt(sec:number){
    const m = Math.floor(sec/60), s = Math.floor(sec%60)
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
