import * as THREE from 'three'
import { chapters, exhibitionContent, narrationPaths } from '../data/chapters'
import { museumConfig as config } from '../data/museumConfig'
import { AudioManager } from '../systems/AudioManager'
import { CollisionSystem } from '../systems/CollisionSystem'
import { UI } from '../ui/UI'
import { Museum } from '../world/Museum'
import { Controls } from './Controls'

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
  private narrationTimer = 0
  private finalTimers: number[] = []
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor() {
    this.ui = new UI({ start: () => this.start(), close: () => this.closePanels(), mute: () => this.audio.toggleMute(), replay: () => { void this.audio.replay() }, credits: () => this.openCredits(), restart: () => this.restart() })
    this.renderer = new THREE.WebGLRenderer({ canvas: this.ui.q<HTMLCanvasElement>('#museum-canvas'), antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = .78
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.scene.background = new THREE.Color('#100e0c'); this.scene.fog = new THREE.FogExp2('#15110e', .019)
    this.camera.position.set(0, config.player.eyeHeight, 6)
    this.controls = new Controls(this.camera, this.collisions, config.player.speed, this.reducedMotion)
    this.museum = new Museum(this.scene, this.collisions)
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('keydown', (event) => this.keydown(event))
    this.load(); this.renderer.setAnimationLoop(() => this.update())
  }

  private async load() {
    this.ui.progress(.35)
    await this.audio.prepare(narrationPaths)
    this.ui.setAudioAvailable(this.audio.hasAny)
    this.ui.progress(1)
    setTimeout(() => this.ui.ready(), 450)
  }

  private start() {
    this.started = true; this.controls.enabled = true; this.ui.explore()
    if (this.audio.has(exhibitionContent.prologue.audio)) void this.audio.play(exhibitionContent.prologue.audio)
  }

  private update() {
    const delta = Math.min(this.clock.getDelta(), .05)
    this.controls.enabled = this.started && !this.ui.panelOpen
    this.controls.update(delta)
    if (this.started) { this.updateChapter(delta); this.updateInteraction(); this.updateFinal() }
    this.renderer.render(this.scene, this.camera)
  }

  private updateChapter(delta: number) {
    const z = this.camera.position.z
    const index = chapters.findIndex((chapter) => z <= chapter.start && z >= chapter.end)
    if (index !== this.currentChapter) {
      this.currentChapter = index; this.ui.setChapter(index >= 0 ? chapters[index] : undefined); this.narrationTimer = 0
    }
    if (index >= 0) {
      this.narrationTimer += delta
      if (this.narrationTimer > 1) void this.audio.play(chapters[index].audio)
    }
    const mapProgress = THREE.MathUtils.clamp((-z - 17) / 10, 0, 1)
    this.museum.updateMap(this.reducedMotion ? (mapProgress > 0 ? 1 : 0) : mapProgress)
  }

  private updateInteraction() {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
    let best = -1; let score = Infinity
    this.museum.interactives.forEach((item, index) => {
      const direction = item.mesh.position.clone().sub(this.camera.position)
      const distance = direction.length()
      const angle = forward.angleTo(direction.normalize())
      if (distance < 2.4 && angle < .58 && distance < score) { score = distance; best = index }
    })
    this.nearbyIndex = best; this.ui.setPrompt(best >= 0 && !this.ui.panelOpen)
  }

  private updateFinal() {
    const dz = this.camera.position.z - config.hall.centerZ
    const distance = Math.hypot(this.camera.position.x, dz)
    if (distance < 2.65 && !this.finalStarted) {
      this.finalStarted = true
      const interval = this.reducedMotion ? 0 : 650
      this.museum.quadrantLights.forEach((light, index) => this.finalTimers.push(window.setTimeout(() => { light.intensity = 9 }, index * interval + (this.reducedMotion ? 0 : 300))))
      this.finalTimers.push(window.setTimeout(() => { this.renderer.toneMappingExposure = .93; this.ui.showFinalActions() }, this.reducedMotion ? 0 : 3000))
      void this.audio.play(exhibitionContent.finalHall.audio)
    }
  }

  private keydown(event: KeyboardEvent) {
    if (event.code === 'Escape') this.closePanels()
    if (event.code === 'KeyM') this.ui.setMuted(this.audio.toggleMute())
    if (event.code === 'KeyE' && this.nearbyIndex >= 0 && !this.ui.panelOpen) {
      const artifact = this.museum.interactives[this.nearbyIndex].artifact
      const chapter = chapters.find((item) => item.id === artifact.chapterId)
      if (chapter) this.ui.openArtifact(artifact, chapter)
    }
  }

  private closePanels() { this.ui.closePanels() }
  private openCredits() { this.ui.showCredits() }
  private restart() {
    this.finalTimers.forEach((timer) => window.clearTimeout(timer)); this.finalTimers = []
    this.camera.position.set(0, config.player.eyeHeight, 6); this.controls.reset(); this.audio.reset()
    this.currentChapter = -1; this.nearbyIndex = -1; this.narrationTimer = 0; this.finalStarted = false
    this.renderer.toneMappingExposure = .78; this.museum.updateMap(0); this.museum.quadrantLights.forEach((light) => light.intensity = 0); this.ui.reset()
    if (this.audio.has(exhibitionContent.prologue.audio)) void this.audio.play(exhibitionContent.prologue.audio)
  }
  private resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setSize(innerWidth, innerHeight) }
}
