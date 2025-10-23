import { useMe, useUpdateMe, useMeUsage, useConnections } from '../api/hooks'
import { useToast } from '../components/Toast'
import { useState } from 'react'

export default function MeSettings() {
    const { data: me, isLoading } = useMe()
    const { data: usage } = useMeUsage()
    const { data: connections } = useConnections()
    const updateMe = useUpdateMe()
    const { success, error } = useToast()
    const [name, setName] = useState(me?.name || '')
    const [handle, setHandle] = useState(me?.handle || '')

    if (isLoading) return <div className="card p-4 animate-pulse h-40" />

    return (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="card p-3 space-y-2">
                <a className="btn-ghost w-full">Profile</a>
                <a className="btn-ghost w-full">Account</a>
                <a className="btn-ghost w-full">Plan & Usage</a>
                <a className="btn-ghost w-full">Connections</a>
                <a className="btn-ghost w-full">Notifications</a>
                <a className="btn-ghost w-full">Brand defaults</a>
            </aside>

            <main className="space-y-6">
                <section className="card p-4 space-y-3">
                    <div className="text-sm font-medium">Profile</div>
                    <label className="text-sm">
                        <div className="text-muted mb-1">Display name</div>
                        <input className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                               value={name} onChange={(e)=>setName(e.target.value)} />
                    </label>
                    <label className="text-sm">
                        <div className="text-muted mb-1">Handle</div>
                        <input className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm"
                               value={handle} onChange={(e)=>setHandle(e.target.value)} />
                    </label>
                    <div className="flex justify-end">
                        <button
                            className="btn-primary"
                            onClick={async ()=> {
                                try { await updateMe.mutateAsync({ name, handle }); success('Saved profile') }
                                catch { error('Failed to save') }
                            }}
                        >Save</button>
                    </div>
                </section>

                <section className="card p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Plan & Usage</div>
                        <div className="text-xs text-muted">{me?.plan} plan</div>
                    </div>
                    <div className="text-sm">
                        {usage ? `${usage.creditsUsed}/${usage.creditsTotal} credits` : '—'}
                    </div>
                    <button className="btn-ghost">Upgrade</button>
                </section>

                <section className="card p-4 space-y-2">
                    <div className="text-sm font-medium">Connections</div>
                    <div className="flex flex-wrap gap-2">
                        {(connections || []).map((c)=>(
                            <span key={c.provider} className="badge">{c.provider}: {c.connected ? 'Connected' : 'Not connected'}</span>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
