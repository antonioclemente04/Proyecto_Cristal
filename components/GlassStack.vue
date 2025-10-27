<template>
  <div ref="wrapper" class="w-full h-full relative overflow-hidden">
    <div ref="canvasContainer" class="w-full h-full"></div>

    <!-- Cursor label (sólo desktop) -->
    <div
      v-show="showCursorLabel"
      :style="cursorStyle"
      class="cursor-label pointer-events-none fixed select-none"
      aria-hidden="true"
      ref="cursorLabelEl"
    >
      {{ cursorText }}
    </div>

    <!-- Accessibility: offscreen list of links -->
    <nav class="sr-only" aria-label="Glass Lab projects">
      <ul>
        <li v-for="p in projectsForNav" :key="p.id">
          <NuxtLink :to="p.href || `/projects/${p.id}`">{{ p.title }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Fallback grid si WebGL no disponible -->
    <div v-if="showFallback" class="absolute inset-0 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <NuxtLink
        v-for="p in projectsPreview"
        :key="p.id"
        :to="p.href || `/projects/${p.id}`"
        class="block bg-white rounded-md overflow-hidden shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <img :src="p.imageSmall || placeholderSmall" :alt="p.title"
             class="w-full h-36 md:h-44 object-cover" />
        <div class="p-3 text-sm font-semibold text-black">{{ p.title || `Proyecto ${p.id}` }}</div>
        <div class="px-3 pb-3 text-xs text-black/60">Siglo: {{ p.century || 's.?' }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
/* GlassStack.vue — responsive & touch-friendly */
import { ref, onMounted, onBeforeUnmount, watch, computed, getCurrentInstance } from 'vue'
import * as THREE from 'three'
import { useRouter } from 'vue-router'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  count: { type: Number, default: 12 },
  highlightIndex: { type: Number, default: 6 },
  size: { type: Object, default: () => ({ w: 420, h: 420, depth: 10 }) },
  initialPos: { type: Object, default: () => ({ x: -960, y: -300, z: 0 }) },
  step: { type: Object, default: () => ({ dx: 320, dy: 160, dz: -20 }) },
  fallbackBreakpoint: { type: Number, default: 720 }
})
const emit = defineEmits(['projectClick'])
const router = useRouter()

// Refs / estado
const wrapper = ref(null)
const canvasContainer = ref(null)
let renderer = null
const scene = new THREE.Scene()
let camera = null
let animationId = null
let raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const meshes = []
const texCache = new Map()

// responsive / touch detection
const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0))
const mobileBreakpoint = props.fallbackBreakpoint || 720
const isMobile = ref(false)
const activeSize = ref({ ...props.size })
const activeStep = ref({ ...props.step })

const showFallback = ref(false)
const placeholderSmall = '/images/reloj-small.webp'
const placeholderLarge = '/images/reloj.webp'
const projectsPreview = computed(() => props.projects.slice(0, props.count))
const projectsForNav = computed(() => props.projects.slice(0, props.count))

// Cursor-as-label state
const showCursorLabel = ref(false)
const cursorText = ref('')
const cursorX = ref(0)
const cursorY = ref(0)
const cursorLabelEl = ref(null)

const cursorStyle = computed(() => ({
  left: `${cursorX.value}px`,
  top: `${cursorY.value}px`,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  whiteSpace: 'nowrap'
}))

// Interacción
const LERP_SPEED = 0.16
let scrollOffsetX = 0
let groupScrollTarget = 0
let groupScrollCurrent = 0
const SCROLL_MIN = -1600
const SCROLL_MAX = 1600
const SCROLL_SPEED = 1.0
let hoveredIndex = -1
let stackGroup = null
let stepDyVisual = 0
const HOVER_X_OFFSET = 140

function screenOffsetToLocal(offsetX) {
  if (!stackGroup || !camera) return 0
  const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
  const worldOrigin = new THREE.Vector3(0, 0, 0)
  const worldTarget = worldOrigin.clone().add(camRight.clone().multiplyScalar(offsetX))
  const localOrigin = stackGroup.worldToLocal(worldOrigin.clone())
  const localTarget = stackGroup.worldToLocal(worldTarget.clone())
  return localTarget.x - localOrigin.x
}
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)) }

// responsive settings
function updateResponsiveSettings(width = (typeof window !== 'undefined' ? window.innerWidth : mobileBreakpoint)) {
  isMobile.value = width <= mobileBreakpoint
  showFallback.value = isTouchDevice || width <= props.fallbackBreakpoint

  if (isMobile.value) {
    activeSize.value = { w: 260, h: 160, depth: 8 }
    activeStep.value = { dx: 220, dy: 120, dz: -18 }
  } else {
    activeSize.value = { ...props.size }
    activeStep.value = { ...props.step }
  }
}

// Textura helpers
function loadTextureSmall(urlSmall) {
  try {
    const loader = new THREE.TextureLoader()
    const t = loader.load(urlSmall)
    t.encoding = THREE.sRGBEncoding
    t.minFilter = THREE.LinearMipMapLinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = true
    return t
  } catch (e) { return null }
}
function loadTextureHigh(urlHigh, frontMaterial) {
  const loader = new THREE.TextureLoader()
  loader.load(urlHigh, tex => {
    tex.encoding = THREE.sRGBEncoding
    tex.minFilter = THREE.LinearMipMapLinearFilter
    tex.magFilter = THREE.LinearFilter
    if (frontMaterial && !frontMaterial.disposed) {
      frontMaterial.map = tex
      frontMaterial.needsUpdate = true
    }
  })
}

// posiciones & escala
function computePosition(i) {
  const { w, h, depth } = activeSize.value
  const X = props.initialPos.x + i * activeStep.value.dx
  const Y = props.initialPos.y + i * stepDyVisual
  const Z = props.initialPos.z + i * activeStep.value.dz
  return { x: X, y: Y, z: Z }
}
function computeScale(i) { return 1 }

// CREAR MESHES
function createMeshes() {
  const { w, h, depth } = activeSize.value
  const count = Math.max(0, Math.min(props.count, props.projects.length))
  for (let i = 0; i < count; i++) {
    const p = props.projects[i] || {}
    const title = p.title && String(p.title).trim().length ? p.title : `Proyecto ${i+1}`
    const small = p.imageSmall || placeholderSmall
    const large = p.image || placeholderLarge
    const frontTex = loadTextureSmall(small)

    const frontMat = new THREE.MeshBasicMaterial({ map: frontTex, transparent: true, opacity: 0.48, side: THREE.FrontSide })
    const rightMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f7ff, roughness: 0.32, metalness: 0.02, transmission: 0.28, transparent: true, opacity: 0.30 })
    const leftMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.03, transmission: 0.32, transparent: true, opacity: 0.30 })
    const topMat = new THREE.MeshPhysicalMaterial({ color: 0xf9fbff, roughness: 0.26, metalness: 0.02, transmission: 0.30, transparent: true, opacity: 0.30 })
    const bottomMat= new THREE.MeshPhysicalMaterial({ color: 0xeff4ff, roughness: 0.38, metalness: 0.02, transmission: 0.22, transparent: true, opacity: 0.28 })
    const backMat = new THREE.MeshPhysicalMaterial({ color: 0x101214, roughness: 0.75, metalness: 0.0, transmission: 0.04, transparent: true, opacity: 0.24 })

    const geo = new RoundedBoxGeometry(w, h, depth, 5, 6)
    const materials = [ rightMat, leftMat, topMat, bottomMat, frontMat, backMat ]
    const mesh = new THREE.Mesh(geo, materials)

    const pos = computePosition(i)
    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.scale.setScalar(computeScale(i))

    mesh.userData = {
      index: i,
      id: p.id ?? `placeholder-${i}`,
      href: (p.href || `/projects/${p.id}`),
      title: title,
      cursorName: (p.cursorName && String(p.cursorName).trim()) ? p.cursorName : title,
      century: p.century || '',
      baseX: pos.x, baseY: pos.y, baseZ: pos.z,
      currentX: pos.x, currentY: pos.y, currentZ: pos.z,
      targetX: pos.x, targetY: pos.y, targetZ: pos.z,
      baseScale: 1, currentScale: 1, targetScale: 1,
      currentOpacityFactor: 0.0, targetOpacityFactor: 0.0,
      depth: depth,
      mats: { front: frontMat, right: rightMat, left: leftMat, top: topMat, bottom: bottomMat, back: backMat }
    }

    mesh.renderOrder = i
    meshes.push(mesh)
    stackGroup.add(mesh)

    // lazy hi-res
    setTimeout(() => loadTextureHigh(large, frontMat), 300 + i * 120)
  }
}

// HOVER (solo desktop)
function setHover(mesh, clientX = null, clientY = null) {
  hoveredIndex = mesh.userData.index

  const hoveredWorldX = mesh.userData.baseX + groupScrollCurrent
  const dirToCenter = hoveredWorldX < 0 ? 1 : -1
  const hoverLocalOffset = screenOffsetToLocal(dirToCenter * HOVER_X_OFFSET)

  mesh.userData.targetX = mesh.userData.baseX + hoverLocalOffset
  mesh.userData.targetZ = mesh.userData.baseZ
  mesh.userData.targetScale = 1.06
  mesh.userData.targetOpacityFactor = 1.0

  const separationScreen = activeStep.value.dx * 0.7
  for (const m of meshes) {
    const idx = m.userData.index
    if (idx === hoveredIndex) continue
    const worldX = m.userData.baseX + groupScrollCurrent
    const dir = worldX < hoveredWorldX ? -1 : 1
    const localOff = screenOffsetToLocal(dir * separationScreen)
    m.userData.targetX = m.userData.baseX + localOff
    m.userData.targetScale = 1.0
    m.userData.targetOpacityFactor = 0.3
    m.userData.targetZ = m.userData.baseZ
  }

  cursorText.value = mesh.userData.cursorName || mesh.userData.title || `Proyecto ${mesh.userData.index + 1}`
  if (clientX !== null && clientY !== null) {
    updateCursorPosition(clientX, clientY)
  } else {
    const worldPos = new THREE.Vector3()
    mesh.getWorldPosition(worldPos)
    worldPos.project(camera)
    const rect = renderer.domElement.getBoundingClientRect()
    const x = rect.left + (worldPos.x * 0.5 + 0.5) * rect.width
    const y = rect.top + (-worldPos.y * 0.5 + 0.5) * rect.height
    updateCursorPosition(x, y)
  }

  showCursorLabel.value = true
  if (!isTouchDevice && renderer && renderer.domElement) renderer.domElement.style.cursor = 'none'
}

function clearHover(mesh) {
  hoveredIndex = -1
  for (const m of meshes) {
    m.userData.targetX = m.userData.baseX
    m.userData.targetScale = m.userData.baseScale
    m.userData.targetOpacityFactor = 0.0
    m.userData.targetZ = m.userData.baseZ
  }

  showCursorLabel.value = false
  if (renderer && renderer.domElement) renderer.domElement.style.cursor = ''
}

// onResize robusto
function onResize() {
  const container = canvasContainer.value
  if (!container || !renderer) return
  const w = Math.max(1, container.clientWidth || window.innerWidth)
  const h = Math.max(1, container.clientHeight || window.innerHeight)
  const pr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(pr)
  renderer.setSize(w, h, false)
  const FRUSTUM_BASE = isMobile.value ? 900 : 1200
  const aspect = w / h
  const frustumHalfHeight = FRUSTUM_BASE / 2
  const frustumHalfWidth = frustumHalfHeight * aspect
  if (camera) {
    camera.left = -frustumHalfWidth
    camera.right = frustumHalfWidth
    camera.top = frustumHalfHeight
    camera.bottom = -frustumHalfHeight
    camera.updateProjectionMatrix()
  }

  // Update responsive sizes
  updateResponsiveSettings(w)
  showFallback.value = isTouchDevice || window.innerWidth <= props.fallbackBreakpoint
}

// Raycast + cursor follow
let lastIntersect = null
function updateCursorPosition(clientX, clientY) {
  cursorX.value = clientX
  cursorY.value = clientY
}

function onPointerMove(e) {
  if (!renderer) return
  const rect = renderer.domElement.getBoundingClientRect()

  // en móvil/táctil evitamos lógica de hover que choca con touch
  if (isTouchDevice || isMobile.value) {
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    return
  }

  updateCursorPosition(e.clientX, e.clientY)
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(meshes, false)
  if (intersects.length > 0) {
    const m = intersects[0].object
    if (lastIntersect !== m) {
      if (lastIntersect) clearHover(lastIntersect)
      setHover(m, e.clientX, e.clientY)
      lastIntersect = m
    } else {
      updateCursorPosition(e.clientX, e.clientY)
    }
  } else {
    if (lastIntersect) clearHover(lastIntersect)
    lastIntersect = null
  }
}

function onPointerEnter(e) {
  if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') updateCursorPosition(e.clientX, e.clientY)
}
function onPointerLeave() {
  if (lastIntersect) { clearHover(lastIntersect); lastIntersect = null }
  showCursorLabel.value = false
  if (renderer && renderer.domElement) renderer.domElement.style.cursor = ''
}

function onPointerDown(e) {
  if (!lastIntersect) return
  const id = lastIntersect.userData.id
  if (router && typeof router.push === 'function') {
    const href = lastIntersect.userData.href || `/projects/${id}`
    router.push(href)
  } else if (typeof window !== 'undefined') {
    const href = lastIntersect.userData.href || `/projects/${id}`
    window.location.href = href
  }
  emit('projectClick', id)
}

// Keyboard navigation
let focusedIndex = -1
function onKeyDown(e) {
  if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
    focusedIndex = Math.max(0, (focusedIndex === -1 ? 0 : focusedIndex - 1))
    focusIndex(focusedIndex)
  } else if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
    focusedIndex = Math.min(meshes.length - 1, (focusedIndex === -1 ? 0 : focusedIndex + 1))
    focusIndex(focusedIndex)
  } else if (e.key === 'Enter' && focusedIndex >= 0) {
    const ud = meshes[focusedIndex].userData
    const href = ud.href || `/projects/${ud.id}`
    router.push(href)
  }
}
function focusIndex(i) {
  const m = meshes[i]
  if (!m) return
  if (lastIntersect) { clearHover(lastIntersect); lastIntersect = null }
  setHover(m)
  const worldPos = new THREE.Vector3()
  m.getWorldPosition(worldPos)
  const desired = new THREE.Vector3(worldPos.x + 120, worldPos.y + 60, camera.position.z)
  camera.position.lerp(desired, 0.18)
}

// SCROLL HORIZONTAL
function onWheel(e) {
  e.preventDefault()
  scrollOffsetX = clamp(scrollOffsetX + e.deltaY * SCROLL_SPEED, SCROLL_MIN, SCROLL_MAX)
  groupScrollTarget = scrollOffsetX
}

let touchX = 0
function onTouchStart(e) { if (e.touches && e.touches.length) { touchX = e.touches[0].clientX; touchStartTime = Date.now() } }
function onTouchMove(e) {
  if (!(e.touches && e.touches.length)) return
  const x = e.touches[0].clientX
  const dx = touchX - x
  if (Math.abs(dx) > 0) {
    e.preventDefault()
    touchX = x
    scrollOffsetX = clamp(scrollOffsetX + dx * (SCROLL_SPEED * 0.9), SCROLL_MIN, SCROLL_MAX)
    groupScrollTarget = scrollOffsetX
  }
}

let touchStartTime = 0
function onTouchEnd(e) {
  const duration = Date.now() - touchStartTime
  if (duration < 250) {
    const touch = (e.changedTouches && e.changedTouches[0]) || null
    if (touch && renderer && camera) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(meshes, false)
      if (intersects.length > 0) {
        const ud = intersects[0].object.userData
        const href = ud.href || `/projects/${ud.id}`
        router.push(href)
      }
    }
  }
}

// ANIMATE
function animate() {
  animationId = requestAnimationFrame(animate)
  groupScrollCurrent = THREE.MathUtils.lerp(groupScrollCurrent, groupScrollTarget, LERP_SPEED)
  if (stackGroup) stackGroup.position.x = groupScrollCurrent

  for (const m of meshes) {
    m.userData.currentX = THREE.MathUtils.lerp(m.userData.currentX, m.userData.targetX, LERP_SPEED)
    m.userData.currentY = THREE.MathUtils.lerp(m.userData.currentY, m.userData.targetY, LERP_SPEED)
    m.userData.currentZ = THREE.MathUtils.lerp(m.userData.currentZ, m.userData.targetZ, LERP_SPEED)
    m.position.set(m.userData.currentX, m.userData.currentY, m.userData.currentZ)
    m.userData.currentScale = THREE.MathUtils.lerp(m.userData.currentScale, m.userData.targetScale, LERP_SPEED)
    m.scale.setScalar(m.userData.currentScale)

    m.userData.currentOpacityFactor = THREE.MathUtils.lerp(
      m.userData.currentOpacityFactor ?? 0.0,
      (typeof m.userData.targetOpacityFactor === 'number' ? m.userData.targetOpacityFactor : 0.0),
      LERP_SPEED
    )

    try {
      const mats = m.userData.mats
      if (mats) {
        const frontBaseline = 0.48
        const sideBaselineRight = 0.30
        const sideBaselineLeft = 0.30
        const sideBaselineTop = 0.30
        const sideBaselineBottom= 0.28
        const backBaseline = 0.24
        const f = m.userData.currentOpacityFactor
        if (mats.front) { mats.front.opacity = THREE.MathUtils.clamp(frontBaseline + (1.0 - frontBaseline) * f, 0.02, 1.0); mats.front.needsUpdate = true }
        if (mats.right) { mats.right.opacity = THREE.MathUtils.clamp(sideBaselineRight + (1.0 - sideBaselineRight) * f, 0.02, 1.0); mats.right.needsUpdate = true }
        if (mats.left) { mats.left.opacity = THREE.MathUtils.clamp(sideBaselineLeft + (1.0 - sideBaselineLeft) * f, 0.02, 1.0); mats.left.needsUpdate = true }
        if (mats.top) { mats.top.opacity = THREE.MathUtils.clamp(sideBaselineTop + (1.0 - sideBaselineTop) * f, 0.02, 1.0); mats.top.needsUpdate = true }
        if (mats.bottom){ mats.bottom.opacity= THREE.MathUtils.clamp(sideBaselineBottom+ (1.0 - sideBaselineBottom) * f, 0.02, 1.0); mats.bottom.needsUpdate = true }
        if (mats.back) { mats.back.opacity = THREE.MathUtils.clamp(backBaseline + (1.0 - backBaseline) * f, 0.02, 1.0); mats.back.needsUpdate = true }
      }
    } catch (e) { /* ignore minor timing issues */ }
  }

  if (renderer) renderer.render(scene, camera)
}

// INIT SCENE (Orthographic axonometric)
function initScene() {
  const container = canvasContainer.value
  if (!container) return

  updateResponsiveSettings(container.clientWidth || window.innerWidth)

  const w = container.clientWidth || 800
  const h = container.clientHeight || 600
  const FRUSTUM_BASE = isMobile.value ? 900 : 1200
  const aspect = w / h
  const frustumHalfHeight = FRUSTUM_BASE / 2
  const frustumHalfWidth = frustumHalfHeight * aspect
  camera = new THREE.OrthographicCamera(-frustumHalfWidth, frustumHalfWidth, frustumHalfHeight, -frustumHalfHeight, -3000, 3000)
  camera.position.set(0, 0, 1200)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(w, h)
  renderer.outputEncoding = THREE.sRGBEncoding

  renderer.domElement.style.cursor = ''

  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  const pr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(pr)
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight, false)

  const ro = new ResizeObserver(() => { onResize() })
  ro.observe(container)
  renderer.__resizeObserver = ro

  // Grupo y rotación axonométrica
  stackGroup = new THREE.Group()
  stackGroup.rotation.set(THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(-40), 0)
  scene.add(stackGroup)

  const m = new THREE.Matrix4().makeRotationFromEuler(stackGroup.rotation)
  const e = m.elements
  const m10 = e[1]
  const m11 = e[5]
  const dx = activeStep.value.dx
  stepDyVisual = m11 !== 0 ? -(m10 * dx) / m11 : 0

  // lighting
  const amb = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(amb)
  const key = new THREE.DirectionalLight(0xffffff, 0.95)
  key.position.set(-800, 1200, 900)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x667788, 0.12)
  fill.position.set(600, -200, -400)
  scene.add(fill)
  const rim = new THREE.PointLight(0x94fff0, 0.12, 4000)
  rim.position.set(1000, 500, 1000)
  scene.add(rim)

  // crear meshes y centrar
  createMeshes()
  const box = new THREE.Box3().setFromObject(stackGroup)
  const center = new THREE.Vector3()
  box.getCenter(center)
  stackGroup.position.sub(center)

  // events
  onResize()
  window.addEventListener('resize', onResize)
  const containerElem = container
  containerElem.addEventListener('pointerenter', onPointerEnter)
  containerElem.addEventListener('pointermove', onPointerMove)
  containerElem.addEventListener('pointerleave', onPointerLeave)
  containerElem.addEventListener('pointerdown', onPointerDown)
  containerElem.addEventListener('wheel', onWheel, { passive: false })
  containerElem.addEventListener('touchstart', onTouchStart, { passive: true })
  containerElem.addEventListener('touchmove', onTouchMove, { passive: false })
  containerElem.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKeyDown)

  requestAnimationFrame(() => onResize())

  for (const m of meshes) {
    m.userData.currentX = m.userData.baseX
    m.userData.targetX = m.userData.baseX
    m.userData.currentOpacityFactor = 0.0
    m.userData.targetOpacityFactor = 0.0
  }

  groupScrollCurrent = 0
  groupScrollTarget = 0
  stackGroup.position.x = 0

  animate()
}

// dispose
function disposeScene() {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  const container = canvasContainer.value
  if (container) {
    container.removeEventListener('pointerenter', onPointerEnter)
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('pointerleave', onPointerLeave)
    container.removeEventListener('pointerdown', onPointerDown)
    container.removeEventListener('wheel', onWheel)
    container.removeEventListener('touchstart', onTouchStart)
    container.removeEventListener('touchmove', onTouchMove)
    container.removeEventListener('touchend', onTouchEnd)
  }
  cancelAnimationFrame(animationId)
  if (renderer) {
    try {
      if (renderer.__resizeObserver) {
        renderer.__resizeObserver.disconnect()
        delete renderer.__resizeObserver
      }
    } catch (e) {}
    try { renderer.forceContextLoss() } catch(e) {}
    try { renderer.domElement && renderer.domElement.remove() } catch(e) {}
    renderer = null
  }
  meshes.forEach(m => {
    if (m.geometry) m.geometry.dispose()
    if (m.material) {
      if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose())
      else m.material.dispose()
    }
    scene.remove(m)
  })
  texCache.clear()
}

onMounted(() => {
  if (typeof window === 'undefined') return
  try {
    // set initial fallback / responsive values
    updateResponsiveSettings(window.innerWidth)
    showFallback.value = isTouchDevice || window.innerWidth <= props.fallbackBreakpoint

    initScene()
    const vm = getCurrentInstance()
    vm?.expose?.({ forceResize: onResize })
  } catch (err) {
    console.error('Three init failed', err)
    showFallback.value = true
  }
})

onBeforeUnmount(() => { disposeScene() })

watch(() => props.projects, (nv, ov) => {
  meshes.forEach(m => {
    stackGroup.remove(m)
    m.geometry?.dispose()
    if (Array.isArray(m.material)) m.material.forEach(x=>x.dispose())
    else m.material?.dispose()
  })
  meshes.length = 0
  createMeshes()
  for (const m of meshes) {
    m.userData.currentX = m.userData.baseX
    m.userData.targetX = m.userData.baseX
    m.userData.currentOpacityFactor = 0.0
    m.userData.targetOpacityFactor = 0.0
  }
})
</script>

<style scoped>
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Cursor label styles: reemplaza cursor nativo */
.cursor-label {
  pointer-events: none;
  user-select: none;
  position: fixed;
  z-index: 9999;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  font-family: 'Cabinet Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  
  /* Efecto de texto con borde */
  text-shadow: 
    -1px -1px 0 #FFF,
     0   -1px 0 #FFF,
     1px -1px 0 #FFF,
     1px  0   0 #FFF,
     0    1px 0 #FFF,
     1px  1px 0 #FFF,
     0    1px 0 #FFF,
    -1px  1px 0 #FFF,
    -1px  0   0 #FFF;
  
  /* Mejorar renderizado */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  
  /* Efecto de inversión */
  filter: invert(1) hue-rotate(180deg);
  mix-blend-mode: difference;
  
  /* Asegurar que esté por encima de todo */
  will-change: transform;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  
  /* Asegurar que el texto sea visible en cualquier fondo */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* esconder label en pantallas táctiles / móviles */
@media (max-width: 720px) {
  .cursor-label { display: none !important; }
}

/* imagen responsive */
img.object-cover { display: block; width: 100%; height: auto; }
</style>
