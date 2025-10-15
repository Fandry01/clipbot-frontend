export default function ProjectCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="relative w-full h-40 bg-white/5">
                <div className="absolute inset-0 animate-pulse bg-white/10" />
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="h-5 w-12 rounded-full bg-white/20 animate-pulse" />
                    <div className="h-5 w-14 rounded-full bg-white/20 animate-pulse" />
                </div>
            </div>
            <div className="p-3 space-y-2">
                <div className="h-4 w-3/5 rounded bg-white/20 animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-white/20 animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-white/20 animate-pulse" />
                </div>
                <div className="h-3 w-14 rounded bg-white/20 animate-pulse" />
            </div>
        </div>
    )
}
