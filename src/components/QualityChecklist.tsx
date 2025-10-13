export type QC = {
    boundary: boolean
    noWordCut: boolean
    leadInOut: boolean
    loudness: boolean
    subtitleCps: boolean
}

export default function QualityChecklist({ qc }: { qc: QC }) {
    const Item = ({ ok, label }: { ok: boolean; label: string }) => (
        <div className={`px-3 py-2 rounded-lg border ${ok ? 'border-white/20 bg-white/5' : 'border-warn/40 bg-warn/10 text-warn'}`}>
            <span className="text-sm">{label}</span>
        </div>
    )
    return (
        <div className="card p-3 space-y-2">
            <div className="text-sm font-medium">Quality checklist</div>
            <Item ok={qc.boundary} label="Sentence boundary OK" />
            <Item ok={qc.noWordCut} label="No word-cut" />
            <Item ok={qc.leadInOut} label="Lead-in/out OK" />
            <Item ok={qc.loudness} label="Loudness OK" />
            <Item ok={qc.subtitleCps} label="Subtitle CPS OK" />
        </div>
    )
}
