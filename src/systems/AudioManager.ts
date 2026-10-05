export class AudioManager {
  private current?: HTMLAudioElement
  private cache = new Map<string, HTMLAudioElement | null>()
  private visited = new Set<string>()
  private attempted = new Set<string>()
  private fadeFrame?: number
  private muted = false

  async prepare(paths: string[]) {
    await Promise.all(paths.map((path) => this.prepareTrack(path)))
  }

  private prepareTrack(path: string) {
    return new Promise<void>((resolve) => {
      const audio = new Audio(this.resolve(path))
      audio.preload = 'metadata'
      let settled = false
      const finish = (available: boolean) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        audio.removeEventListener('loadedmetadata', ready)
        audio.removeEventListener('error', failed)
        this.cache.set(path, available ? audio : null)
        resolve()
      }
      const ready = () => finish(true)
      const failed = () => finish(false)
      const timeout = window.setTimeout(() => finish(false), 2500)
      audio.addEventListener('loadedmetadata', ready, { once: true })
      audio.addEventListener('error', failed, { once: true })
      audio.load()
    })
  }

  private resolve(path: string) {
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
  }

  has(path: string) { return this.cache.get(path) instanceof HTMLAudioElement }
  get hasAny() { return [...this.cache.values()].some((audio) => audio instanceof HTMLAudioElement) }
  get isMuted() { return this.muted }

  async play(path: string, once = true) {
    if ((once && this.visited.has(path)) || this.attempted.has(path)) return false
    this.attempted.add(path)
    const next = this.cache.get(path)
    if (!next) return false
    if (this.current && this.current !== next) await this.fade(this.current, 0, 700)
    this.cancelFade()
    this.current = next
    next.currentTime = 0
    next.muted = this.muted
    next.volume = 0
    try { await next.play() } catch { return false }
    this.visited.add(path)
    await this.fade(next, .8, 500)
    return true
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.current) this.current.muted = this.muted
    return this.muted
  }

  async replay() {
    if (!this.current) return false
    this.cancelFade()
    this.current.currentTime = 0
    this.current.volume = .8
    this.current.muted = this.muted
    try { await this.current.play(); return true } catch { return false }
  }

  reset() {
    this.cancelFade()
    this.current?.pause()
    this.current = undefined
    this.visited.clear()
    this.attempted.clear()
    this.cache.forEach((audio) => { if (audio) { audio.pause(); audio.currentTime = 0; audio.volume = .8 } })
  }

  private cancelFade() {
    if (this.fadeFrame !== undefined) cancelAnimationFrame(this.fadeFrame)
    this.fadeFrame = undefined
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number) {
    this.cancelFade()
    return new Promise<void>((resolve) => {
      const start = audio.volume
      const began = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / duration)
        audio.volume = Math.max(0, Math.min(1, start + (target - start) * progress))
        if (progress < 1) this.fadeFrame = requestAnimationFrame(tick)
        else { this.fadeFrame = undefined; if (target === 0) audio.pause(); resolve() }
      }
      this.fadeFrame = requestAnimationFrame(tick)
    })
  }
}
