import { exhibitionContent, type Artifact, type Chapter } from '../data/chapters'
import type { AudioSnapshot } from '../systems/AudioManager'

type AppState = 'LOADING' | 'START_SCREEN' | 'EXPLORING' | 'ARTIFACT_OPEN' | 'CREDITS'
type UIHandlers = { start: (mode: 'free' | 'guided') => void; close: () => void; mute: () => boolean; narration: () => void; transcript: () => void; credits: () => void; restart: () => void; nextTourStep: () => void; exitGuided: () => void }

export class UI {
  readonly root: HTMLElement
  readonly prompt: HTMLElement
  readonly hudChapter: HTMLElement
  readonly artifactPanel: HTMLElement
  readonly finalActions: HTMLElement
  private state: AppState = 'LOADING'
  private previousFocus?: HTMLElement

  constructor(handlers: UIHandlers) {
    const root = document.querySelector<HTMLElement>('#app')
    if (!root) throw new Error('Required application root #app was not found')
    this.root = root
    const credits = exhibitionContent.credits
    this.root.innerHTML = `
      <canvas id="museum-canvas" aria-label="Không gian bảo tàng ảo"></canvas>
      <div id="loading" class="screen" role="status"><div><p class="eyebrow">BẢO TÀNG ẢO</p><h1>BẢO TÀNG TƯ TƯỞNG HỒ CHÍ MINH</h1><div class="load-track"><i></i></div><p class="muted">Đang chuẩn bị không gian triển lãm...</p></div></div>
      <div id="start" class="screen hidden"><div><p class="eyebrow">BẢO TÀNG ẢO</p><h1>BẢO TÀNG<br>TƯ TƯỞNG<br>HỒ CHÍ MINH</h1><p>Quá trình hình thành và phát triển<br>Tư tưởng Hồ Chí Minh</p><div class="visit-modes"><button id="start-button">TỰ THAM QUAN</button><button id="guided-button">ĐI CÙNG HƯỚNG DẪN VIÊN</button></div><p class="instructions">WASD để di chuyển · Kéo chuột để quan sát<br>Khuyến nghị sử dụng tai nghe</p></div></div>
      <div id="hud" class="hidden"><div id="chapter" aria-live="polite">MỞ ĐẦU</div><div class="audio-controls"><button id="audio" aria-label="Tắt âm thanh" aria-pressed="false">ÂM THANH</button><button id="narration" aria-label="Nghe thuyết minh" disabled>▶ NGHE THUYẾT MINH</button><button id="transcript-button" aria-label="Xem nội dung thuyết minh">NỘI DUNG THUYẾT MINH</button><span id="audio-status" class="sr-only" aria-live="polite"></span></div><div id="help">W A S D&nbsp;&nbsp; Di chuyển<br>DRAG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Quan sát<br>E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Khám phá</div><div id="focus"></div><div id="prompt" aria-live="polite"></div></div>
      <aside id="artifact" class="panel" role="dialog" aria-modal="true" aria-labelledby="artifact-title" hidden><button class="close" aria-label="Đóng">×</button><p class="eyebrow artifact-code"></p><h2 id="artifact-title" class="artifact-title"></h2><p class="artifact-year"></p><div class="placeholder">HÌNH ẢNH<br>ĐANG ĐƯỢC BỔ SUNG</div><p class="artifact-description"></p><hr><p class="artifact-stage muted"></p></aside>
      <aside id="credits" class="panel" role="dialog" aria-modal="true" aria-labelledby="credits-title" hidden><button class="close" aria-label="Đóng">×</button><p class="eyebrow">GIỚI THIỆU DỰ ÁN</p><h2 id="credits-title">${credits.project}</h2><p>${credits.subtitle}</p><p>Dự án học phần: ${credits.course}<br>Nhóm thực hiện: ${credits.team}<br>Giảng viên: ${credits.lecturer}</p><hr><p>Nguồn nội dung chính:<br>${credits.source.replace('\n', '<br>')}</p></aside>
      <aside id="transcript" class="panel" role="dialog" aria-modal="true" aria-labelledby="transcript-title" hidden><button class="close" aria-label="Đóng">×</button><p class="eyebrow">NỘI DUNG THUYẾT MINH</p><h2 id="transcript-title"></h2><div class="transcript-content"></div></aside>
      <div id="guided-controls"><span id="guided-progress"></span><div class="guided-actions"><button id="guided-exit" title="Thoát chế độ hướng dẫn viên để tự do tham quan">THOÁT HƯỚNG DẪN</button><button id="guided-next" title="Đến điểm tham quan tiếp theo">TIẾP THEO →</button></div></div>
      <div id="final-actions"><button id="restart">↻ THAM QUAN LẠI</button><button id="credits-button">GIỚI THIỆU DỰ ÁN</button></div>
      <div id="mobile" class="screen hidden"><div><h2>TRẢI NGHIỆM MÁY TÍNH</h2><p>Trải nghiệm này được thiết kế tối ưu cho màn hình máy tính.</p><button id="continue">TIẾP TỤC</button></div></div>`
    this.prompt = this.q('#prompt'); this.hudChapter = this.q('#chapter'); this.artifactPanel = this.q('#artifact'); this.finalActions = this.q('#final-actions')
    this.q('#start-button').onclick = () => handlers.start('free'); this.q('#guided-button').onclick = () => handlers.start('guided'); this.q('#audio').onclick = () => handlers.mute(); this.q('#narration').onclick = handlers.narration
    this.q('#restart').onclick = handlers.restart; this.q('#credits-button').onclick = handlers.credits; this.q('#transcript-button').onclick = handlers.transcript; this.q('#guided-next').onclick = handlers.nextTourStep; this.q('#guided-exit').onclick = handlers.exitGuided
    this.root.querySelectorAll('.close').forEach((button) => button.addEventListener('click', handlers.close))
    this.q('#continue').onclick = () => this.q('#mobile').classList.add('hidden')
    if (innerWidth < 768) this.q('#mobile').classList.remove('hidden')
  }

  q<T extends HTMLElement = HTMLElement>(selector: string) { const element = this.root.querySelector<T>(selector); if (!element) throw new Error(`Required UI element ${selector} was not found`); return element }
  progress(value: number) { this.q('.load-track i').style.width = `${value * 100}%` }
  ready() { this.state = 'START_SCREEN'; this.q('#loading').classList.add('hidden'); this.q('#start').classList.remove('hidden'); this.q('#start-button').focus() }
  explore() { this.state = 'EXPLORING'; this.q('#start').classList.add('hidden'); this.q('#hud').classList.remove('hidden'); window.setTimeout(() => this.q('#help').classList.add('faded'), 15000) }
  setChapter(chapter?: Chapter) { this.hudChapter.innerHTML = chapter ? `0${chapter.index} / 05<br><span>${chapter.period}</span>` : '' }
  setPrompt(show: boolean) { this.prompt.textContent = show ? 'E - KHÁM PHÁ' : ''; this.q('#focus').classList.toggle('active', show) }
  setNarrationControl(show: boolean) { this.q('#narration').classList.toggle('hidden', !show) }
  updateAudio(snapshot: AudioSnapshot) {
    const sound = this.q<HTMLButtonElement>('#audio'); sound.textContent = snapshot.muted ? 'ÂM THANH: TẮT' : 'ÂM THANH'; sound.setAttribute('aria-pressed', String(snapshot.muted)); sound.setAttribute('aria-label', snapshot.muted ? 'Bật âm thanh' : 'Tắt âm thanh')
    const narration = this.q<HTMLButtonElement>('#narration'); narration.disabled = !snapshot.available
    const labels = { idle: '▶ NGHE THUYẾT MINH', loading: 'ĐANG TẢI...', playing: '❚❚ TẠM DỪNG', paused: '▶ TIẾP TỤC', finished: '↻ NGHE LẠI', unavailable: 'KHÔNG CÓ THUYẾT MINH' }
    narration.textContent = labels[snapshot.state]; narration.setAttribute('aria-label', labels[snapshot.state].replaceAll(/[▶❚↻]/g, '').trim())
    this.q('#audio-status').textContent = snapshot.state === 'playing' ? 'Đang phát thuyết minh' : snapshot.state === 'paused' ? 'Đã tạm dừng thuyết minh' : ''
  }
  openArtifact(artifact: Artifact, chapter: Chapter) {
    this.q('.artifact-code').textContent = artifact.code; this.q('.artifact-title').textContent = artifact.title; this.q('.artifact-year').textContent = artifact.year
    this.q('.artifact-description').textContent = artifact.description; this.q('.artifact-stage').textContent = `Giai đoạn · ${chapter.period}`; this.openPanel(this.artifactPanel, 'ARTIFACT_OPEN')
  }
  showCredits() { this.openPanel(this.q('#credits'), 'CREDITS') }
  showTranscript(title: string, transcript: string) { this.q('#transcript-title').textContent = title; this.q('.transcript-content').innerHTML = transcript.split('\n\n').map((paragraph) => `<p>${paragraph}</p>`).join(''); this.openPanel(this.q('#transcript'), 'CREDITS') }
  closePanels() { if (!this.panelOpen) return; this.root.querySelectorAll<HTMLElement>('.panel').forEach((panel) => { panel.classList.remove('open'); panel.hidden = true }); this.state = 'EXPLORING'; this.previousFocus?.focus() }
  showFinalActions() { this.finalActions.classList.add('visible') }
  setGuidedTour(active: boolean, label = '') { const controls = this.q('#guided-controls'); controls.classList.toggle('visible', active); this.q('#guided-progress').textContent = label }
  reset() { this.closePanels(); this.finalActions.classList.remove('visible'); this.setGuidedTour(false); this.setNarrationControl(true); this.setPrompt(false); this.setChapter() }
  get panelOpen() { return this.state === 'ARTIFACT_OPEN' || this.state === 'CREDITS' }
  private openPanel(panel: HTMLElement, state: AppState) { this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined; this.root.querySelectorAll<HTMLElement>('.panel').forEach((item) => { item.classList.remove('open'); item.hidden = true }); panel.hidden = false; requestAnimationFrame(() => panel.classList.add('open')); this.state = state; panel.querySelector<HTMLElement>('.close')?.focus() }
}
