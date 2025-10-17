import { useEffect, useRef } from 'react'

export default function LoadMore({ onVisible, disabled=false }: { onVisible: () => void; disabled?: boolean }) {
    const ref = useRef<HTMLDivElement|null>(null)
    useEffect(() => {
        if (disabled) return
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) onVisible()
        }, { rootMargin: '400px' })
        if (ref.current) io.observe(ref.current)
        return () => io.disconnect()
    }, [onVisible, disabled])
    return <div ref={ref} className="h-10" />
}
