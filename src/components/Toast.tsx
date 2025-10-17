import { createContext, useContext, useMemo, useState } from 'react'

type Toast = { id: number; type: 'success'|'error'|'info'; text: string }
type Ctx = {
    notify: (t: Omit<Toast,'id'>) => void
    success: (text: string) => void
    error: (text: string) => void
    info: (text: string) => void
}

const ToastCtx = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const notify = (t: Omit<Toast,'id'>) => {
        const id = Date.now() + Math.random()
        setToasts((xs) => [...xs, { id, ...t }])
        setTimeout(() => setToasts((xs) => xs.filter(x => x.id !== id)), 3500)
    }
    const api = useMemo<Ctx>(() => ({
        notify,
        success: (text) => notify({ type: 'success', text }),
        error:   (text) => notify({ type: 'error', text }),
        info:    (text) => notify({ type: 'info', text }),
    }), [])

    return (
        <ToastCtx.Provider value={api}>
            {children}
            <div className="fixed z-[9999] bottom-4 right-4 space-y-2 w-[min(92vw,360px)]">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`rounded-lg px-3 py-2 text-sm shadow-card border ${
                            t.type==='success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100' :
                                t.type==='error'   ? 'bg-rose-500/15 border-rose-500/40 text-rose-100' :
                                    'bg-white/10 border-white/20 text-white'
                        }`}
                    >
                        {t.text}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastCtx)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}
