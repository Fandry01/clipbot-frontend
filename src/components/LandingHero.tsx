import * as React from "react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
]

const stats = [
  "Save hours every week",
  "Clips start and end naturally",
  "Ready for TikTok, Reels, Shorts, LinkedIn",
]

const clipCards = [
  {
    title: "Hook: Why your podcast isn’t growing",
    duration: "0:42",
    tags: ["Story mode", "Auto clips"],
  },
  {
    title: "Context: Nail your unique POV",
    duration: "1:05",
    tags: ["Brand overlay", "Captions"],
  },
  {
    title: "Payoff: Turn viewers into fans",
    duration: "0:54",
    tags: ["TikTok", "Reels", "YouTube Shorts"],
  },
]

function LandingHero() {
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="bg-white text-slate-900">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center pt-4">
        <div
          className={`pointer-events-auto mx-auto flex w-[94%] max-w-5xl items-center gap-6 rounded-full border px-4 py-3 shadow-lg transition-all duration-500 sm:px-6 ${
            scrolled
              ? "border-slate-200/70 bg-white/50 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 shadow-sm">
            <span className="text-base font-semibold tracking-tight text-slate-900">ClipBot</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              AI Video Clipping
            </span>
          </div>
          <nav className="hidden flex-1 items-center justify-center gap-2 text-sm font-semibold text-slate-700 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button className="text-sm font-semibold text-slate-700 transition hover:text-slate-900">Log in</button>
            <Button size="md" className="rounded-full shadow-sm">
              Start free trial
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 md:hidden">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-800">
              Menu
            </Button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white pt-32 md:pt-36">
        <div className="absolute left-1/2 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute right-12 top-24 h-32 w-32 rounded-full bg-green-200/30 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl flex-col items-center gap-12 px-6 py-16 text-center md:py-24">
          <div className="space-y-4">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              Clip smarter, share faster
            </p>
            <h1
              className={`text-4xl font-bold leading-tight tracking-tight text-slate-900 transition-all duration-700 ease-out sm:text-5xl lg:text-6xl ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Turn long videos into scroll-stopping clips
            </h1>
            <p
              className={`mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 transition-all duration-700 ease-out delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              ClipBot crafts story-driven moments with natural starts and endings, branded overlays, and ready-to-post exports for TikTok, Reels, Shorts, and LinkedIn.
            </p>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Button
              size="lg"
              className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start free trial
              <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/40 text-base text-white transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Button>
          </div>
          <p className="text-sm font-medium text-slate-600">No watermarks on paid plans · Cancel anytime</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-700">
            {stats.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <section className="flex w-full items-center justify-center">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl">
              <div className="absolute left-6 top-6 rounded-full bg-white px-4 py-2 text-xs font-semibold text-green-600 shadow-sm">
                Story mode enabled
              </div>
              <div className="space-y-6 p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-indigo-200 via-indigo-100 to-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-3 w-32 rounded-full bg-slate-200" />
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-semibold text-slate-600">Ready to clip</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                    <div className="flex h-full w-full gap-1 overflow-hidden rounded-full">
                      <span className="flex-1 bg-indigo-500" />
                      <span className="w-8 bg-indigo-300" />
                      <span className="flex-1 bg-indigo-400" />
                      <span className="w-10 bg-indigo-500" />
                      <span className="flex-1 bg-indigo-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {clipCards.map((clip) => (
                    <div
                      key={clip.title}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{clip.title}</p>
                          <p className="text-xs text-slate-500">Hook → Context → Payoff</p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {clip.duration}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-start gap-2">
                        {clip.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default LandingHero
