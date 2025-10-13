import { useState } from 'react'
import CenterUploadCard from '../components/CenterUploadCard'
import QuickActionsRail from '../components/QuickActionsRail'
import StorageChips from '../components/StorageChips'
import ProjectCard, { Project } from '../components/ProjectCard'
import IntakePanel from '../components/IntakePanel'
import { useNavigate } from 'react-router-dom'

const projects: Project[] = [
    { id: '1', title: '24 Hours with Danny Duncan', thumb: '/src/assets/thumb1.jpg', plan: 'Free', status: 'Demo', duration: '12:31', coherence: 0.81, hook: 0.67 },
    { id: '2', title: 'Curry Drills 12 Threes',      thumb: '/src/assets/thumb2.jpg', plan: 'Free', status: 'Demo', duration: '08:22', coherence: 0.76, hook: 0.72 },
    { id: '3', title: 'Tal Wilkenfeld #408 Lex Fridman', thumb: '/src/assets/thumb3.jpg', plan: 'Pro', status: 'Ready', duration: '09:05', coherence: 0.88, hook: 0.69 },
]

export default function Overview() {
    const [source, setSource] = useState<{type:'url'|'file', value:string, name?:string} | null>(null)
    const nav = useNavigate()

    return (
        <div>
            {!source ? (
                <>
                    <CenterUploadCard onStart={(src) => setSource(src)} />
                    <QuickActionsRail />
                    <div className="flex justify-end mt-4"><StorageChips /></div>

                    <section className="mt-8">
                        <div className="flex items-baseline justify-between mb-3">
                            <h2 className="text-lg font-semibold">All projects</h2>
                            <div className="text-sm text-muted">All · Saved</div>
                        </div>
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                            {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                        </div>
                    </section>
                </>
            ) : (
                // INTAKE MODE
                <IntakePanel
                    source={source}
                    onStartJob={(payload) => {
                        // TODO: call backend; nu mocken we een jobId en gaan naar processing
                        console.log('start job', payload)
                        const jobId = Math.random().toString(36).slice(2,8)
                        nav(`/dashboard/processing/${jobId}`)
                    }}
                />
            )}

        </div>
    )
}
