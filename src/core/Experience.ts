import * as THREE from 'three'
import { audioAssets, chapters, exhibitionContent } from '../data/chapters'
import { museumConfig as config } from '../data/museumConfig'
import type { NarrationState } from '../systems/AudioManager'
import { AudioManager } from '../systems/AudioManager'
import { CollisionSystem } from '../systems/CollisionSystem'
import { UI } from '../ui/UI'
import { Museum } from '../world/Museum'
import { Controls } from './Controls'

type GuidedStep = { label: string; position: THREE.Vector3; target: THREE.Vector3; narration?: string; waitForNarration?: boolean; duration?: number; finalRotation?: boolean }

export class Experience {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(63, innerWidth / innerHeight, .08, 180)
  private clock = new THREE.Clock()
  private collisions = new CollisionSystem(config.player.radius)
  private controls: Controls
  private museum: Museum
  private audio = new AudioManager()
  private ui: UI
  private started = false
  private currentChapter = -1
  private nearbyIndex = -1
  private finalStarted = false
  private quietZoneEntered = false
  private boardCandidate = -1
  private activeBoardNarration = -1
  private boardDwell = 0
  private ambientZone: 'corridor' | 'final' = 'corridor'
  private mapMilestonePlayed = false
  private guided = false
  private guidedSteps: GuidedStep[] = []
  private guidedIndex = -1
  private guidedPhase: 'moving' | 'waiting' | 'rotating' = 'waiting'
  private guidedVelocity = new THREE.Vector3()
  private guidedWait = 0
  private guidedNarrationState: NarrationState = 'idle'
  private guidedRotation = 0
  private guidedWalkTime = 0
  private finalTimers: number[] = []
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor() {
    this.ui = new UI({ start: (mode) => this.start(mode), close: () => this.closePanels(), mute: () => this.audio.toggleMute(), narration: () => { void this.audio.toggleNarration() }, transcript: () => this.openTranscript(), credits: () => this.openCredits(), restart: () => this.restart(), nextTourStep: () => this.nextGuidedStep() })
    this.audio.subscribe((snapshot) => { this.guidedNarrationState = snapshot.state; this.ui.updateAudio(snapshot) })
    this.renderer = new THREE.WebGLRenderer({ canvas: this.ui.q<HTMLCanvasElement>('#museum-canvas'), antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = .78
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.scene.background = new THREE.Color('#100e0c'); this.scene.fog = new THREE.FogExp2('#15110e', .019)
    this.camera.position.set(0, config.player.eyeHeight, 8)
    this.controls = new Controls(this.camera, this.collisions, config.player.speed, this.reducedMotion)
    this.museum = new Museum(this.scene, this.collisions)
    window.addEventListener('resize', () => this.resize()); window.addEventListener('keydown', (event) => this.keydown(event))
    void this.load(); this.renderer.setAnimationLoop(() => this.update())
  }

  private async load() {
    this.ui.progress(.35)
    await this.audio.prepare([...audioAssets.narration, ...Object.values(audioAssets.ambient), ...Object.values(audioAssets.sfx)])
    this.audio.selectNarration(exhibitionContent.prologue.audio)
    this.ui.progress(1); window.setTimeout(() => this.ui.ready(), 450)
  }

  private start(mode: 'free' | 'guided') {
    this.started = true; this.guided = mode === 'guided'; this.controls.enabled = !this.guided; this.ui.explore()
    void this.audio.playAmbient(audioAssets.ambient.corridor)
    if (this.guided) { this.guidedSteps = this.createGuidedSteps(); this.ui.setGuidedTour(true); this.advanceGuidedStep() }
    else void this.audio.playNarration(exhibitionContent.prologue.audio)
  }

  private update() {
    const delta = Math.min(this.clock.getDelta(), .05)
    this.controls.enabled = this.started && !this.ui.panelOpen && !this.guided
    if (this.guided) this.updateGuidedTour(delta)
    else this.controls.update(delta)
    if (this.started) {
      this.updateChapter(); if (!this.guided) this.updateBoardNarration(delta); this.updateQuietZone(); this.updateAmbient(); this.updateInteraction()
      this.museum.updateTransitionDoor(this.camera.position.z, delta, this.reducedMotion); this.updateFinal()
    }
    this.renderer.render(this.scene, this.camera)
  }

  private createGuidedSteps() {
    const steps: GuidedStep[] = [{ label: 'MỞ ĐẦU', position: new THREE.Vector3(0, config.player.eyeHeight, 3), target: new THREE.Vector3(-2, 1.9, 3), narration: exhibitionContent.prologue.audio, waitForNarration: true }]
    chapters.forEach((chapter) => {
      const z = (chapter.start + chapter.end) / 2
      const boardX = chapter.board.side === 'left' ? -2.02 : 2.02
      const exhibitX = chapter.exhibition.side === 'left' ? -1.5 : 1.5
      steps.push({ label: `0${chapter.index} · BẢNG THÔNG TIN`, position: new THREE.Vector3(boardX > 0 ? -.55 : .55, config.player.eyeHeight, z + .45), target: new THREE.Vector3(boardX, 1.9, z), narration: chapter.audio, waitForNarration: true })
      steps.push({ label: `0${chapter.index} · TƯ LIỆU`, position: new THREE.Vector3(exhibitX > 0 ? -.5 : .5, config.player.eyeHeight, z - .55), target: new THREE.Vector3(exhibitX, 1.15, z), duration: 3.5 })
    })
    steps.push({ label: 'SẢNH TƯ TƯỞNG HỒ CHÍ MINH', position: new THREE.Vector3(0, config.player.eyeHeight, config.hall.centerZ + 2.25), target: new THREE.Vector3(0, 1.25, config.hall.centerZ), narration: exhibitionContent.finalHall.audio, waitForNarration: true })
    steps.push({ label: 'TOÀN CẢNH SẢNH', position: new THREE.Vector3(0, config.player.eyeHeight, config.hall.centerZ + 2.25), target: new THREE.Vector3(0, 1.7, config.hall.centerZ - 4), duration: 1, finalRotation: true })
    return steps
  }

  private advanceGuidedStep() {
    this.guidedIndex++
    if (this.guidedIndex >= this.guidedSteps.length) { this.finishGuidedTour(); return }
    const step = this.guidedSteps[this.guidedIndex]
    this.guidedVelocity.set(0, 0, 0); this.guidedWait = 0; this.guidedPhase = 'moving'; this.guidedRotation = 0
    this.ui.setGuidedTour(true, `${this.guidedIndex + 1} / ${this.guidedSteps.length} · ${step.label}`)
  }

  private nextGuidedStep() {
    if (!this.guided) return
    const step = this.guidedSteps[this.guidedIndex]
    if (this.guidedPhase === 'moving' && step) { this.camera.position.copy(step.position); this.lookAtGuidedTarget(step.target); this.arriveGuidedStep(step); return }
    void this.audio.fadeOutNarration(350)
    this.advanceGuidedStep()
  }

  private updateGuidedTour(delta: number) {
    const step = this.guidedSteps[this.guidedIndex]
    if (!step) return
    if (this.guidedPhase === 'moving') {
      const offset = step.position.clone().sub(this.camera.position); offset.y = 0
      const distance = offset.length()
      if (distance < .06) { this.arriveGuidedStep(step); return }
      const desiredSpeed = Math.min(2.25, Math.sqrt(2 * 2.2 * distance))
      const desiredVelocity = offset.normalize().multiplyScalar(desiredSpeed)
      const acceleration = Math.min(1, delta * (desiredSpeed < this.guidedVelocity.length() ? 4.5 : 2.4))
      this.guidedVelocity.lerp(desiredVelocity, acceleration)
      const movement = this.guidedVelocity.clone().multiplyScalar(delta)
      if (movement.length() > distance) movement.setLength(distance)
      this.camera.position.add(movement)
      this.guidedWalkTime += delta * this.guidedVelocity.length()
      this.camera.position.y = config.player.eyeHeight + (this.reducedMotion ? 0 : Math.sin(this.guidedWalkTime * 4.8) * .008)
      const travelDirection = this.camera.position.clone().add(this.guidedVelocity.clone().normalize().multiplyScalar(3)); travelDirection.y = config.player.eyeHeight
      this.lookAtGuidedTarget(travelDirection, delta * 3.5)
      return
    }
    if (this.guidedPhase === 'rotating') {
      this.guidedRotation = Math.min(Math.PI * 2, this.guidedRotation + delta * .42)
      const target = new THREE.Vector3(Math.sin(this.guidedRotation) * 5, 1.8, config.hall.centerZ + Math.cos(this.guidedRotation) * 5)
      this.lookAtGuidedTarget(target)
      if (this.guidedRotation >= Math.PI * 2) this.finishGuidedTour()
      return
    }
    this.guidedWait += delta
    if (step.waitForNarration) {
      const complete = this.guidedNarrationState === 'finished' || this.guidedNarrationState === 'unavailable'
      if (complete || (this.guidedNarrationState === 'idle' && this.guidedWait > 1.2)) this.advanceGuidedStep()
    } else if (this.guidedWait >= (step.duration ?? 3)) this.advanceGuidedStep()
  }

  private arriveGuidedStep(step: GuidedStep) {
    this.camera.position.copy(step.position); this.camera.position.y = config.player.eyeHeight; this.guidedVelocity.set(0, 0, 0); this.lookAtGuidedTarget(step.target)
    if (step.finalRotation) { this.guidedPhase = 'rotating'; return }
    this.guidedPhase = 'waiting'; this.guidedWait = 0
    if (step.narration) { this.audio.selectNarration(step.narration); void this.audio.playNarration(step.narration, false) }
  }

  private lookAtGuidedTarget(target: THREE.Vector3, smoothing = 1) {
    const direction = target.clone().sub(this.camera.position)
    const targetYaw = Math.atan2(-direction.x, -direction.z)
    const targetPitch = Math.atan2(direction.y, Math.hypot(direction.x, direction.z))
    const currentYaw = this.camera.rotation.y
    const yawDifference = Math.atan2(Math.sin(targetYaw - currentYaw), Math.cos(targetYaw - currentYaw))
    const yaw = currentYaw + yawDifference * Math.min(1, smoothing)
    const pitch = THREE.MathUtils.lerp(this.camera.rotation.x, targetPitch, Math.min(1, smoothing))
    this.controls.setOrientation(yaw, pitch)
  }

  private finishGuidedTour() {
    this.guided = false; this.guidedPhase = 'waiting'; this.ui.setGuidedTour(false); this.controls.enabled = true
  }

  private updateChapter() {
    const z = this.camera.position.z
    const index = chapters.findIndex((chapter) => z <= chapter.start && z >= chapter.end)
    if (index !== this.currentChapter) { this.currentChapter = index; this.ui.setChapter(index >= 0 ? chapters[index] : undefined) }
    const stageTwo = chapters[1]
    const mapProgress = THREE.MathUtils.clamp((stageTwo.start - z) / Math.max(1, stageTwo.start - stageTwo.end - 4), 0, 1)
    this.museum.updateMap(this.reducedMotion ? (mapProgress > 0 ? 1 : 0) : mapProgress)
    if (mapProgress >= .75 && !this.mapMilestonePlayed) { this.mapMilestonePlayed = true; void this.audio.playSfx(audioAssets.sfx.mapPoint) }
  }

  private updateBoardNarration(delta: number) {
    let nearest = -1; let nearestDistance = Infinity
    chapters.forEach((chapter, index) => {
      const boardX = chapter.board.side === 'left' ? -2.04 : 2.04
      const boardZ = (chapter.start + chapter.end) / 2
      const distance = Math.hypot(this.camera.position.x - boardX, this.camera.position.z - boardZ)
      if (distance < nearestDistance) { nearest = index; nearestDistance = distance }
    })
    if (this.activeBoardNarration >= 0) {
      const activeBoardZ = (chapters[this.activeBoardNarration].start + chapters[this.activeBoardNarration].end) / 2
      if (this.camera.position.z < activeBoardZ - 1) {
        void this.audio.fadeOutNarration(800)
        this.activeBoardNarration = -1
      }
    }
    if (this.boardCandidate >= 0 && nearestDistance > 4.8) { this.boardCandidate = -1; this.boardDwell = 0 }
    if (nearestDistance <= 3) {
      if (this.boardCandidate !== nearest) { this.boardCandidate = nearest; this.boardDwell = 0; this.audio.selectNarration(chapters[nearest].audio) }
      this.boardDwell += delta
      const chapter = chapters[nearest]
      if (this.boardDwell >= 1 && this.audio.has(chapter.audio) && !this.audio.isVisited(chapter.audio)) {
        this.activeBoardNarration = nearest
        void this.audio.playNarration(chapter.audio)
      }
    }
  }

  private updateQuietZone() {
    const diChuc = chapters[4].artifacts.find((artifact) => artifact.id === 'di-chuc')
    if (!diChuc) return
    const inside = Math.abs(this.camera.position.z - diChuc.z) < 2.1
    if (inside && !this.quietZoneEntered) { this.quietZoneEntered = true; void this.audio.fadeOutNarration(900) }
    if (!inside && Math.abs(this.camera.position.z - diChuc.z) > 3.5) this.quietZoneEntered = false
  }

  private updateAmbient() {
    const inFinal = Math.hypot(this.camera.position.x, this.camera.position.z - config.hall.centerZ) < config.hall.radius - .5
    const zone = inFinal ? 'final' : 'corridor'
    if (zone === this.ambientZone) return
    this.ambientZone = zone; void this.audio.playAmbient(zone === 'final' ? audioAssets.ambient.finalHall : audioAssets.ambient.corridor)
  }

  private updateInteraction() {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
    let best = -1; let score = Infinity
    this.museum.interactives.forEach((item, index) => {
      const direction = item.mesh.position.clone().sub(this.camera.position); const distance = direction.length(); const angle = forward.angleTo(direction.normalize())
      if (distance < 2.4 && angle < .58 && distance < score) { score = distance; best = index }
    })
    this.nearbyIndex = best; this.ui.setPrompt(best >= 0 && !this.ui.panelOpen)
  }

  private updateFinal() {
    const distance = Math.hypot(this.camera.position.x, this.camera.position.z - config.hall.centerZ)
    if (distance < 2.65 && !this.finalStarted) {
      this.finalStarted = true; this.audio.selectNarration(exhibitionContent.finalHall.audio)
      const interval = this.reducedMotion ? 0 : 650
      this.museum.quadrantLights.forEach((light, index) => this.finalTimers.push(window.setTimeout(() => { light.intensity = 9 }, index * interval + (this.reducedMotion ? 0 : 300))))
      this.finalTimers.push(window.setTimeout(() => { this.renderer.toneMappingExposure = .93; this.ui.showFinalActions() }, this.reducedMotion ? 0 : 3000))
      void this.audio.playNarration(exhibitionContent.finalHall.audio); void this.audio.playSfx(audioAssets.sfx.finalReveal)
    }
  }

  private keydown(event: KeyboardEvent) {
    if (event.code === 'Escape') this.closePanels()
    if (event.code === 'KeyM') this.audio.toggleMute()
    if (event.code === 'KeyE' && this.nearbyIndex >= 0 && !this.ui.panelOpen) {
      const artifact = this.museum.interactives[this.nearbyIndex].artifact; const chapter = chapters.find((item) => item.id === artifact.chapterId)
      if (chapter) this.ui.openArtifact(artifact, chapter)
    }
  }

  private transcriptContext(): { title: string; transcript: string } {
    const distance = Math.hypot(this.camera.position.x, this.camera.position.z - config.hall.centerZ)
    if (distance < config.hall.radius) return { title: 'KẾT LUẬN', transcript: exhibitionContent.finalHall.transcript }
    if (this.boardCandidate >= 0) { const chapter = chapters[this.boardCandidate]; return { title: `0${chapter.index} · ${chapter.period}`, transcript: chapter.transcript } }
    if (this.currentChapter >= 0) { const chapter = chapters[this.currentChapter]; return { title: `0${chapter.index} · ${chapter.period}`, transcript: chapter.transcript } }
    return { title: 'MỞ ĐẦU', transcript: exhibitionContent.prologue.transcript }
  }

  private openTranscript() { const context = this.transcriptContext(); this.ui.showTranscript(context.title, context.transcript) }
  private closePanels() { this.ui.closePanels() }
  private openCredits() { this.ui.showCredits() }
  private restart() {
    this.finalTimers.forEach((timer) => window.clearTimeout(timer)); this.finalTimers = []
    this.camera.position.set(0, config.player.eyeHeight, 8); this.controls.reset(); this.audio.reset()
    this.currentChapter = -1; this.nearbyIndex = -1; this.boardCandidate = -1; this.activeBoardNarration = -1; this.boardDwell = 0; this.finalStarted = false; this.quietZoneEntered = false; this.mapMilestonePlayed = false; this.ambientZone = 'corridor'
    this.guided = false; this.guidedSteps = []; this.guidedIndex = -1; this.guidedPhase = 'waiting'; this.guidedVelocity.set(0, 0, 0); this.guidedWait = 0; this.guidedRotation = 0
    this.renderer.toneMappingExposure = .78; this.museum.updateMap(0); this.museum.updateTransitionDoor(8, 1, true); this.museum.quadrantLights.forEach((light) => light.intensity = 0); this.ui.reset()
    this.audio.selectNarration(exhibitionContent.prologue.audio); void this.audio.playNarration(exhibitionContent.prologue.audio); void this.audio.playAmbient(audioAssets.ambient.corridor)
  }
  private resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setSize(innerWidth, innerHeight) }
}
