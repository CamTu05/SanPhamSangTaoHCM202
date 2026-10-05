import * as THREE from 'three'
import { chapters, exhibitionContent, type Artifact, type Chapter } from '../data/chapters'
import { museumConfig as config } from '../data/museumConfig'
import { CollisionSystem } from '../systems/CollisionSystem'
import { boardPlane, textPlane } from './TextFactory'

export type Interactive = { mesh: THREE.Object3D; artifact: Artifact }

export class Museum {
  readonly group = new THREE.Group()
  readonly interactives: Interactive[] = []
  readonly chapterLights: THREE.Light[] = []
  readonly quadrantLights: THREE.SpotLight[] = []
  readonly mapRoute: THREE.Line
  private materials = {
    wall: new THREE.MeshStandardMaterial({ color: config.colors.ivory, roughness: .94 }),
    floor: new THREE.MeshStandardMaterial({ color: config.colors.wood, roughness: .72 }),
    dark: new THREE.MeshStandardMaterial({ color: config.colors.dark, roughness: .9 }),
    bronze: new THREE.MeshStandardMaterial({ color: config.colors.bronze, roughness: .52, metalness: .5 }),
    paper: new THREE.MeshStandardMaterial({ color: '#b9aa91', roughness: .95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#8b8175', transparent: true, opacity: .18, roughness: .25 })
  }

  constructor(private scene: THREE.Scene, collisions: CollisionSystem) {
    this.scene.add(this.group)
    this.buildCorridor(collisions)
    this.buildPrologue()
    let route: THREE.Line | undefined
    chapters.forEach((stage) => {
      const stageRoute = this.buildStage(stage, collisions)
      if (stageRoute) route = stageRoute
    })
    if (!route) throw new Error('Stage 2 journey route was not created')
    this.mapRoute = route
    this.buildFinalHall(collisions)
    this.buildAmbientLighting()
  }

  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z); mesh.receiveShadow = true; this.group.add(mesh)
    return mesh
  }

  private buildCorridor(collisions: CollisionSystem) {
    const { width, height, start, end } = config.corridor
    const length = start - end
    this.mesh(new THREE.BoxGeometry(width, .16, length), this.materials.floor, 0, -.08, (start + end) / 2)
    this.mesh(new THREE.BoxGeometry(width, .12, length), this.materials.dark, 0, height, (start + end) / 2)
    this.mesh(new THREE.BoxGeometry(.18, height, length), this.materials.wall, -width / 2, height / 2, (start + end) / 2)
    this.mesh(new THREE.BoxGeometry(.18, height, length), this.materials.wall, width / 2, height / 2, (start + end) / 2)
    collisions.addBox(-20, -width / 2 + .08, end, start); collisions.addBox(width / 2 - .08, 20, end, start); collisions.addBox(-width / 2, width / 2, start, start + 1)
    this.mesh(new THREE.BoxGeometry(.035, .012, length), this.materials.bronze, -1.72, .01, (start + end) / 2).receiveShadow = false
    config.years.forEach(({ z }) => this.mesh(new THREE.BoxGeometry(.08, .014, .025), this.materials.bronze, -1.72, .018, z))
  }

  private wallText(text: string, side: 'left' | 'right', z: number, width: number, height: number, options = {}) {
    const plane = textPlane(text, width, height, options)
    plane.position.set(side === 'left' ? -2.085 : 2.085, 1.95, z)
    plane.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2
    this.group.add(plane)
    return plane
  }

  private buildPrologue() {
    this.wallText(exhibitionContent.prologue.lead, 'left', 4, 3.4, 2.5, { title: true, size: 55 })
    this.wallText(exhibitionContent.prologue.stages, 'right', 0, 3.3, 2.2, { title: true, size: 58 })
  }

  private buildStage(stage: Chapter, collisions: CollisionSystem) {
    const centerZ = (stage.start + stage.end) / 2
    this.buildInformationBoard(stage, centerZ)
    const route = this.buildExhibition(stage, centerZ, collisions)
    this.buildTransition(stage)
    this.buildStageLighting(stage, centerZ)
    return route
  }

  private buildInformationBoard(stage: Chapter, z: number) {
    const side = stage.board.side
    const x = side === 'left' ? -2.04 : 2.04
    const frame = this.mesh(new THREE.BoxGeometry(.07, 2.5, 3.4), this.materials.bronze, x, 2, z)
    const surface = boardPlane({ number: `0${stage.index}`, period: stage.board.period, title: stage.board.title.replaceAll('\n', ' '), body: stage.board.content }, 3.25, 2.35)
    surface.position.set(side === 'left' ? x + .041 : x - .041, 2, z)
    surface.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2
    this.group.add(surface)
    frame.castShadow = true
  }

  private buildExhibition(stage: Chapter, z: number, collisions: CollisionSystem) {
    switch (stage.exhibition.type) {
      case 'desk': this.buildDeskExhibition(stage, z, collisions); return undefined
      case 'journey-map': return this.buildJourneyExhibition(stage, z, collisions)
      case 'document-case': this.buildDocumentCase(stage, z, collisions); return undefined
      case 'return-archive': this.buildReturnArchive(stage, z, collisions); return undefined
      case 'wall-timeline': this.buildWallTimeline(stage, z, collisions); return undefined
    }
  }

  private sideX(side: 'left' | 'right', offset = 1.45) { return side === 'left' ? -offset : offset }

  private buildDeskExhibition(stage: Chapter, z: number, collisions: CollisionSystem) {
    const x = this.sideX(stage.exhibition.side, 1.2)
    const desk = this.mesh(new THREE.BoxGeometry(1.75, .12, 1.25), this.materials.floor, x, .82, z)
    for (const dx of [-.7, .7]) for (const dz of [-.48, .48]) this.mesh(new THREE.BoxGeometry(.1, .8, .1), this.materials.floor, x + dx, .4, z + dz)
    for (let i = 0; i < 3; i++) this.mesh(new THREE.BoxGeometry(.38, .04, .25), this.materials.paper, x - .25 + i * .18, .92 + i * .045, z)
    this.mesh(new THREE.CylinderGeometry(.1, .12, .05, 20), this.materials.dark, x + .48, .9, z - .2)
    stage.artifacts.forEach((artifact, index) => this.buildArchiveMount(artifact, x > 0 ? 'right' : 'left', z + (index - 1) * .75, 1.85))
    collisions.addBox(x - 1, x + 1, z - .78, z + .78); desk.castShadow = true
  }

  private buildJourneyExhibition(stage: Chapter, z: number, collisions: CollisionSystem) {
    const side = stage.exhibition.side
    const x = side === 'left' ? -2.03 : 2.03
    const map = new THREE.Group(); map.position.set(x, 2.15, z); map.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2
    map.add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.15, .06), this.materials.dark))
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.5, -.38, .04),
      new THREE.Vector3(0, .58, .04),
      new THREE.Vector3(1.5, .38, .04)
    )
    const routePoints = curve.getPoints(48)
    const geometry = new THREE.BufferGeometry().setFromPoints(routePoints); geometry.setDrawRange(0, 0)
    const route = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: config.colors.warm, transparent: true, opacity: .82 })); map.add(route)
    const endpoints = [routePoints[0], routePoints[routePoints.length - 1]]
    endpoints.forEach((point, index) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(.055, .085, 32), new THREE.MeshBasicMaterial({ color: index === 1 ? config.colors.warm : config.colors.bronze, transparent: true, opacity: .9 }))
      ring.position.copy(point).add(new THREE.Vector3(0, 0, .01)); map.add(ring)
    })
    const labels = textPlane(exhibitionContent.map.labels, 3.95, 1.9, { size: 28, align: 'center' }); labels.position.z = .05; map.add(labels); this.group.add(map)
    stage.artifacts.forEach((artifact, index) => this.buildArchiveMount(artifact, side, z + 1.6 + index * .7, 1.1))
    collisions.addBox(this.sideX(side, 1.72) - .45, this.sideX(side, 1.72) + .45, z - 2.25, z + 2.25)
    return route
  }

  private buildDocumentCase(stage: Chapter, z: number, collisions: CollisionSystem) {
    const side = stage.exhibition.side; const x = this.sideX(side, 1.55)
    const base = this.mesh(new THREE.BoxGeometry(.75, .72, 4.5), this.materials.dark, x, .36, z)
    const glass = this.mesh(new THREE.BoxGeometry(.78, .48, 4.5), this.materials.glass, x, .86, z)
    stage.artifacts.forEach((artifact, index) => {
      const documentZ = z + (index - 1) * 1.35
      const document = this.mesh(new THREE.BoxGeometry(.5, .04, .85), this.materials.paper, x, 1.03, documentZ)
      this.interactives.push({ mesh: document, artifact })
      const label = textPlane(`${artifact.code}\n${artifact.title}\n${artifact.year}`, .82, .58, { size: 46, lineHeight: 54, background: '#211b17', align: 'center' })
      label.position.set(side === 'left' ? x + .4 : x - .4, .72, documentZ); label.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2; this.group.add(label)
    })
    collisions.addBox(x - .55, x + .55, z - 2.4, z + 2.4); base.castShadow = true; glass.renderOrder = 2
  }

  private buildReturnArchive(stage: Chapter, z: number, collisions: CollisionSystem) {
    const side = stage.exhibition.side; const x = this.sideX(side, 1.52)
    const plinth = this.mesh(new THREE.BoxGeometry(.9, .65, 2.6), this.materials.dark, x, .325, z)
    this.mesh(new THREE.BoxGeometry(.72, .48, .35), this.materials.floor, x, .9, z - .7)
    this.mesh(new THREE.BoxGeometry(.5, .035, .72), this.materials.paper, x, .86, z + .25)
    stage.artifacts.forEach((artifact) => this.buildArchiveMount(artifact, side, z + .7, 1.9))
    collisions.addBox(x - .58, x + .58, z - 1.5, z + 1.5); plinth.castShadow = true
  }

  private buildWallTimeline(stage: Chapter, z: number, collisions: CollisionSystem) {
    const side = stage.exhibition.side; const x = side === 'left' ? -2.03 : 2.03
    const board = this.mesh(new THREE.BoxGeometry(.07, 2.25, 4.8), this.materials.dark, x, 2, z)
    const timeline = textPlane('1941                 1945                 1954                 1969\n\nGIẢI PHÓNG      ĐỘC LẬP       BẢO VỆ        XÂY DỰNG · THỐNG NHẤT', 4.6, 2.05, { size: 30, background: '#211d19', align: 'center' })
    timeline.position.set(side === 'left' ? x + .041 : x - .041, 2, z); timeline.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2; this.group.add(timeline)
    stage.artifacts.forEach((artifact) => this.buildArtifactStand(artifact, side, z + 2.1, collisions))
    board.castShadow = true
  }

  private buildArchiveMount(artifact: Artifact, side: 'left' | 'right', z: number, y: number) {
    const x = side === 'left' ? -2.02 : 2.02
    const document = this.mesh(new THREE.BoxGeometry(.05, .7, .52), this.materials.paper, x, y, z)
    const label = textPlane(`${artifact.code}\n${artifact.title}`, .82, .52, { size: 44, lineHeight: 52, background: '#211b17', align: 'center' })
    label.position.set(side === 'left' ? x + .03 : x - .03, y - .62, z); label.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2; this.group.add(label)
    this.interactives.push({ mesh: document, artifact })
  }

  private buildArtifactStand(artifact: Artifact, side: 'left' | 'right', z: number, collisions: CollisionSystem) {
    const x = this.sideX(side, 1.55)
    const base = this.mesh(new THREE.BoxGeometry(.8, .72, .75), this.materials.dark, x, .36, z)
    const document = this.mesh(new THREE.BoxGeometry(.5, .7, .04), this.materials.paper, x, 1.1, z)
    this.interactives.push({ mesh: document, artifact }); collisions.addBox(x - .5, x + .5, z - .5, z + .5); base.castShadow = true
  }

  private buildTransition(stage: Chapter) {
    stage.transitionAfter.entries.forEach((entry) => this.wallText(entry.text, entry.side, entry.z, 2.8, entry.text.includes('1941') ? 1.3 : .9, { title: true, size: entry.text.length > 45 ? 42 : 54, align: 'center' }))
  }

  private buildStageLighting(stage: Chapter, z: number) {
    const boardX = this.sideX(stage.board.side, 1.2); const exhibitX = this.sideX(stage.exhibition.side, 1.25)
    const boardLight = new THREE.SpotLight(config.colors.warm, stage.index === 4 ? 4 : 6, 7, .98, .82, 1.5)
    boardLight.position.set(-boardX * .2, 3.45, z); boardLight.target.position.set(boardX, 2.15, z)
    const exhibitLight = new THREE.SpotLight(config.colors.warm, stage.index === 4 ? 5 : 9, 7, .7, .7, 1.4)
    exhibitLight.position.set(-exhibitX * .15, 3.45, z); exhibitLight.target.position.set(exhibitX, .95, z)
    exhibitLight.castShadow = stage.index === 1 || stage.index === 3; exhibitLight.shadow.mapSize.set(512, 512)
    this.group.add(boardLight, boardLight.target, exhibitLight, exhibitLight.target); this.chapterLights.push(boardLight, exhibitLight)
  }

  private buildFinalHall(collisions: CollisionSystem) {
    const { centerZ, radius, height } = config.hall
    this.mesh(new THREE.CylinderGeometry(radius, radius, .18, 64), this.materials.floor, 0, -.09, centerZ)
    this.mesh(new THREE.CylinderGeometry(radius, radius, .15, 64), this.materials.dark, 0, height, centerZ)
    const wall = this.mesh(new THREE.CylinderGeometry(radius, radius, height, 64, 1, true, Math.PI * .18, Math.PI * 1.64), this.materials.wall, 0, height / 2, centerZ); wall.material.side = THREE.BackSide
    const pedestal = this.mesh(new THREE.CylinderGeometry(1.2, 1.28, .55, 48), this.materials.floor, 0, .275, centerZ)
    this.mesh(new THREE.TorusGeometry(2.05, .025, 8, 64), this.materials.bronze, 0, .025, centerZ).rotation.x = Math.PI / 2
    const bookA = this.mesh(new THREE.BoxGeometry(.8, .06, 1), this.materials.paper, -.42, .7, centerZ); const bookB = this.mesh(new THREE.BoxGeometry(.8, .06, 1), this.materials.paper, .42, .7, centerZ); bookA.rotation.z = -.13; bookB.rotation.z = .13
    collisions.addBox(-1.65, 1.65, centerZ - 1.65, centerZ + 1.65); collisions.addCircularBoundary(0, centerZ, radius - .12, centerZ + radius - .8)
    exhibitionContent.finalHall.themes.forEach((theme, index) => {
      const angle = -.75 + index * 1.55
      const panel = textPlane(`${theme.title}\n${theme.subtitle}\n\n${theme.copy}`, 4.3, 2.25, { title: true, size: 38, align: 'center' })
      panel.position.set(Math.sin(angle) * 7.7, 2.65, centerZ + Math.cos(angle) * 7.7); panel.lookAt(0, 2.65, centerZ); this.group.add(panel)
      const light = new THREE.SpotLight(config.colors.warm, 0, 10, .65, .8, 1.5); light.position.set(Math.sin(angle) * 5.5, 4.8, centerZ + Math.cos(angle) * 5.5); light.target = panel; this.group.add(light, light.target); this.quadrantLights.push(light)
    })
    const title = textPlane(`${exhibitionContent.finalHall.title}\n\n${exhibitionContent.finalHall.definition}`, 5.5, 2.8, { title: true, size: 48, align: 'center' }); title.position.set(0, 3, centerZ - 7.75); this.group.add(title)
    const final = textPlane(`${exhibitionContent.finalHall.closing}\n\n${exhibitionContent.finalHall.question}`, 5.1, 3, { title: true, size: 44, align: 'center' }); final.position.set(0, 3, centerZ + 7.75); final.rotation.y = Math.PI; this.group.add(final); pedestal.castShadow = true
    const center = new THREE.SpotLight(config.colors.warm, 14, 12, .5, .65, 1.4); center.position.set(0, 5.6, centerZ); center.target.position.set(0, 0, centerZ); center.castShadow = true; center.shadow.mapSize.set(1024, 1024); this.group.add(center, center.target)
  }

  private buildAmbientLighting() { this.scene.add(new THREE.HemisphereLight('#6f604e', '#17120f', .22)) }

  updateMap(progress: number) {
    const count = this.mapRoute.geometry.getAttribute('position').count
    this.mapRoute.geometry.setDrawRange(0, Math.max(0, Math.ceil(progress * count)))
  }
}
