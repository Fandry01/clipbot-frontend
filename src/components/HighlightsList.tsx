export type Highlight = {
    id: string
    start: number
    end: number
    title: string
    coh: number
    hook: number
}

export default function HighlightsList({
                                           items,
                                           onSelect,
                                           onApprove,
                                           onEdit,
                                           onReject,
                                       }: {
    items: Highlight[]
    onSelect: (id: string) => void
    onApprove: (id: string) => void
    onEdit: (id: string) => void
    onReject: (id: string) => void
}) {
    return (
        <div className="card p-3 h-[360px] overflow-auto space-y-2">
            {items.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-sm">
                    <button className="btn-ghost px-2 py-1" onClick={() => onSelect(h.id)}>
                        {fmt(h.start)}–{fmt(h.end)}
                    </button>
                    <div className="flex-1 truncate">{h.title}</div>
                    <span className="badge">Coh {h.coh.toFixed(2)}</span>
                    <span className="badge">Hook {h.hook.toFixed(2)}</span>
                    <button className="btn-ghost px-2 py-1" onClick={() => onApprove(h.id)}>
                        Approve
                    </button>
                    <button className="btn-ghost px-2 py-1" onClick={() => onEdit(h.id)}>
                        Edit
                    </button>
                    <button className="btn-ghost px-2 py-1" onClick={() => onReject(h.id)}>
                        Reject
                    </button>
                </div>
            ))}
        </div>
    )
}

const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
