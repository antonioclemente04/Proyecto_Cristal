<template>
  <div ref="wrapper" class="w-full h-full relative overflow-hidden">
    <div ref="canvasContainer" class="w-full h-full"></div>

    <!-- Accessibility: offscreen list of links to projects for screen readers & keyboard users -->
    <nav class="sr-only" aria-label="Glass Lab projects">
      <ul>
        <li v-for="p in projectsForNav" :key="p.id">
          <NuxtLink :to="`/projects/${p.id}`">{{ p.title }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Fallback 2D grid for small screens or if WebGL fails -->
    <div v-if="showFallback" class="absolute inset-0 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <article v-for="p in projectsPreview" :key="p.id" class="bg-white rounded-md overflow-hidden shadow-md">
        <img :src="p.imageSmall || placeholderSmall" :alt="p.title" class="w-full h-44 object-cover" />
        <div class="p-3 text-sm font-semibold">{{ p.title }}</div>
        <div class="px-3 pb-3 text-xs text-black/60">Siglo: {{ p.century || 's.?' }}</div>
      </article>
    </div>
  </div>
</template>

<script setup>
// GlassStack.vue — Axonometric orthographic stack of equal-size square glass cards with thickness
// This version: centered composition, orthographic axonometry (X=+20°, Y=-40°),
// equal visual size for all cards, correct face lighting (right/top), hover disables depthTest.

import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as THREE from 'three'
import { useRouter } from 'vue-router'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  count: { type: Number, default: 12 },
  highlightIndex: { type: Number, default: 6 },

  /* --------- TUNE THESE VALUES ---------
     - size.w / size.h : card width/height in scene units (px-like)
     - size.depth      : card thickness
     - step.dx / step.dy : separation between cards (controls diagonal slope)
     - step.dz         : stacking order offset (small value; in orthographic it doesn't change apparent size)
     - initialPos      : start position before centering (centering code will normalize)
  -------------------------------------- */
  size: { type: Object, default: () => ({ w: 420, h: 420, depth: 18 }) }, // change size/depth here
  initialPos: { type: Object, default: () => ({ x: -640, y: -300, z: 0 }) },
  step: { type: Object, default: () => ({ dx: 220, dy: 160, dz: -20 }) }, // change distance between cards here
  fallbackBreakpoint: { type: Number, default: 720 }
})

const emit = defineEmits(['projectClick'])
const router = useRouter()

// Refs/state
const wrapper = ref(null)
const canvasContainer = ref(null)
let renderer = null
const scene = new THREE.Scene()
let camera = null // OrthographicCamera
let animationId = null
let raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const meshes = []
const texCache = new Map()
const showFallback = ref(false)
const placeholderSmall = '/images/reloj-small.webp'
const placeholderLarge = '/images/reloj.webp'

const projectsPreview = computed(() => props.projects.slice(0, props.count))
const projectsForNav = computed(() => props.projects.slice(0, props.count))

// Interaction tuning (edit here if you want different hover behaviour)
let SIDE_HOVER_OFFSET = -220
let SCALE_HOVER = 1.03
const LERP_SPEED = 0.16
let scrollDepth = 0 // global Z offset driven by scroll
const SCROLL_MIN = -220
const SCROLL_MAX = 220
const SCROLL_SPEED = 0.6 // wheel sensitivity

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)) }

// Stack group — rotate group to create axonometric orientation
let stackGroup = null

// Texture helpers
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

// Positions
function computePosition(i) {
  const X = props.initialPos.x + i * props.step.dx
  const Y = props.initialPos.y + i * props.step.dy
  const Z = props.initialPos.z + i * props.step.dz
  return { x: X, y: Y, z: Z }
}

function computeScale(i) {
  // all cards visually same size in orthographic projection
  return 1
}

// Create box geometry cards with separate front material (texture) and thin side materials
function createMeshes() {
  const { w, h, depth } = props.size
  const count = Math.max(0, Math.min(props.count, props.projects.length))

  for (let i = 0; i < count; i++) {
    const p = props.projects[i] || {}
    const small = p.imageSmall || placeholderSmall
    const large = p.image || placeholderLarge

    const frontTex = loadTextureSmall(small)

    // Front material (textured, slightly translucent)
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.18,
      metalness: 0.02,
      transmission: 0.12,
      clearcoat: 0.06,
      transparent: true,
      opacity: 0.78, // overall transparency — change for more/less glass look
      side: THREE.FrontSide,
      ior: 1.5
    })

    // Side materials: make left/top slightly lighter to emphasize top-left edge.
    // Order for BoxGeometry groups: +X, -X, +Y, -Y, +Z(front), -Z(back)
    const rightMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.66, metalness: 0.01, transmission: 0.02, transparent: true, opacity: 0.58 })
    const leftMat  = new THREE.MeshPhysicalMaterial({ color: 0x161718, roughness: 0.44, metalness: 0.02, transmission: 0.05, transparent: true, opacity: 0.66 })
    const topMat   = new THREE.MeshPhysicalMaterial({ color: 0x131314, roughness: 0.36, metalness: 0.02, transmission: 0.04, transparent: true, opacity: 0.66 })
    const bottomMat= new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.7, metalness: 0.01, transmission: 0.02, transparent: true, opacity: 0.54 })
    const backMat  = new THREE.MeshPhysicalMaterial({ color: 0x060607, roughness: 0.8, metalness: 0.0, transmission: 0.01, transparent: true, opacity: 0.5 })

    // create box geometry and assign materials array
    const geo = new THREE.BoxGeometry(w, h, depth)
    const materials = [ rightMat, leftMat, topMat, bottomMat, frontMat, backMat ]

    const mesh = new THREE.Mesh(geo, materials)

    // compute base position in stackGroup coordinates
    const pos = computePosition(i)

    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.scale.setScalar(computeScale(i))

    // store userData for animation lerp and reference to materials (for hover toggles)
    mesh.userData = {
      index: i,
      id: p.id ?? `placeholder-${i}`,
      title: p.title ?? `Proyecto ${i+1}`,
      century: p.century || '',
      baseX: pos.x,
      baseY: pos.y,
      baseZ: pos.z,
      currentX: pos.x,
      currentY: pos.y,
      currentZ: pos.z,
      targetX: pos.x,
      targetY: pos.y,
      targetZ: pos.z,
      baseScale: 1,
      currentScale: 1,
      targetScale: 1,
      depth: depth,
      mats: { front: frontMat, right: rightMat, left: leftMat, top: topMat, bottom: bottomMat, back: backMat }
    }

    mesh.renderOrder = i
    meshes.push(mesh)
    stackGroup.add(mesh)

    // lazy load hi-res
    setTimeout(() => loadTextureHigh(large, frontMat), 300 + i * 120)
  }
}

// Hover behavior: lateral translation relative to group, slight forward and small scale
function setHover(mesh) {
  // disable depthTest/depthWrite for hovered mesh materials so it renders above others reliably
  if (mesh.userData && mesh.userData.mats) {
    Object.values(mesh.userData.mats).forEach(m => {
      m.depthTest = false
      m.depthWrite = false
      m.transparent = true
    })
  }
  mesh.userData.targetX = mesh.userData.baseX + SIDE_HOVER_OFFSET
  mesh.userData.targetZ = mesh.userData.baseZ + scrollDepth - 80 // bring slightly forward relative to scroll depth
  mesh.userData.targetScale = SCALE_HOVER
  mesh.renderOrder = 10000
}
function clearHover(mesh) {
  // restore depthTest/depthWrite
  if (mesh.userData && mesh.userData.mats) {
    Object.values(mesh.userData.mats).forEach(m => {
      m.depthTest = true
      m.depthWrite = true
    })
  }
  mesh.userData.targetX = mesh.userData.baseX
  mesh.userData.targetZ = mesh.userData.baseZ + scrollDepth
  mesh.userData.targetScale = mesh.userData.baseScale
  mesh.renderOrder = mesh.userData.index
}

// Scene init using OrthographicCamera for true axonometric
function initScene() {
  const container = canvasContainer.value
  if (!container) return

  const w = container.clientWidth
  const h = container.clientHeight
  // FRUSTUM_BASE controls overall zoom. Reduce to fit more, increase to zoom in.
  const FRUSTUM_BASE = 1200
  const aspect = w / h
  const frustumHalfHeight = FRUSTUM_BASE / 2
  const frustumHalfWidth = frustumHalfHeight * aspect

  camera = new THREE.OrthographicCamera(-frustumHalfWidth, frustumHalfWidth, frustumHalfHeight, -frustumHalfHeight, -3000, 3000)
  camera.position.set(0, 0, 1200)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  // create stack group and rotate it to axonometric orientation
  stackGroup = new THREE.Group()
  // ROTATION: X smaller tilt so less pronounced, Y negative so cards face left
  // Edit these two values to control axonometric angle:
  stackGroup.rotation.set(THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(-40), 0)
  scene.add(stackGroup)

  // lighting: key from top-left-front so left/top edges highlight
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

  // build meshes and then center the whole stack group
  createMeshes()

  // ----------- CENTER THE STACK GROUP -------------
  // compute bounding box of all children and shift group so its center sits at origin (0,0,0)
  // this keeps the composition centred in the camera view regardless of count/step/size
  const box = new THREE.Box3().setFromObject(stackGroup)
  const center = new THREE.Vector3()
  box.getCenter(center)
  stackGroup.position.sub(center)
  // optionally offset group slightly upward visually (uncomment/change as needed)
  // stackGroup.position.y += 40
  // ------------------------------------------------

  // events
  onResize()
  window.addEventListener('resize', onResize)
  const containerElem = container
  containerElem.addEventListener('pointermove', onPointerMove)
  containerElem.addEventListener('pointerdown', onPointerDown)
  // Wheel & touch to drive local depth; prevent page scroll
  containerElem.addEventListener('wheel', onWheel, { passive: false })
  containerElem.addEventListener('touchstart', onTouchStart, { passive: true })
  containerElem.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('keydown', onKeyDown)

  animate()
}

function disposeScene() {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  const container = canvasContainer.value
  if (container) {
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('pointerdown', onPointerDown)
    container.removeEventListener('wheel', onWheel)
    container.removeEventListener('touchstart', onTouchStart)
    container.removeEventListener('touchmove', onTouchMove)
  }
  cancelAnimationFrame(animationId)
  if (renderer) { renderer.forceContextLoss(); renderer.domElement.remove(); renderer = null }
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

function onResize() {
  const container = canvasContainer.value
  if (!container || !renderer) return
  const w = container.clientWidth
  const h = container.clientHeight
  renderer.setSize(w, h)

  const FRUSTUM_BASE = 1200
  const aspect = w / h
  const frustumHalfHeight = FRUSTUM_BASE / 2
  const frustumHalfWidth = frustumHalfHeight * aspect
  camera.left = -frustumHalfWidth
  camera.right = frustumHalfWidth
  camera.top = frustumHalfHeight
  camera.bottom = -frustumHalfHeight
  camera.updateProjectionMatrix()

  showFallback.value = window.innerWidth <= props.fallbackBreakpoint
}

// Raycast pointer handling (works in world space; we cast against stackGroup children)
let lastIntersect = null
function onPointerMove(e) {
  if (!renderer) return
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(meshes, false)

  if (intersects.length > 0) {
    const m = intersects[0].object
    if (lastIntersect !== m) {
      if (lastIntersect) clearHover(lastIntersect)
      setHover(m)
      lastIntersect = m
    }
  } else {
    if (lastIntersect) clearHover(lastIntersect)
    lastIntersect = null
  }
}

function onPointerDown(e) {
  if (!lastIntersect) return
  const id = lastIntersect.userData.id
  router.push(`/projects/${id}`)
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
    const id = meshes[focusedIndex].userData.id
    router.push(`/projects/${id}`)
  }
}
function focusIndex(i) {
  const m = meshes[i]
  if (!m) return
  if (lastIntersect) { clearHover(lastIntersect); lastIntersect = null }
  setHover(m)
  // move camera center a bit to emphasize
  const worldPos = new THREE.Vector3()
  m.getWorldPosition(worldPos)
  const desired = new THREE.Vector3(worldPos.x + 120, worldPos.y + 60, camera.position.z)
  camera.position.lerp(desired, 0.18)
}

// Wheel/touch driven depth — adjust local Z without moving camera or page
function applyScrollDepth() {
  for (const m of meshes) {
    if (m !== lastIntersect) m.userData.targetZ = m.userData.baseZ + scrollDepth
  }
}
function onWheel(e) {
  e.preventDefault()
  scrollDepth = clamp(scrollDepth + e.deltaY * SCROLL_SPEED, SCROLL_MIN, SCROLL_MAX)
  applyScrollDepth()
}
let touchY = 0
function onTouchStart(e) { if (e.touches && e.touches.length) touchY = e.touches[0].clientY }
function onTouchMove(e) {
  if (!(e.touches && e.touches.length)) return
  const y = e.touches[0].clientY
  const dy = touchY - y
  if (Math.abs(dy) > 0) {
    e.preventDefault()
    touchY = y
    scrollDepth = clamp(scrollDepth + dy * (SCROLL_SPEED * 0.8), SCROLL_MIN, SCROLL_MAX)
    applyScrollDepth()
  }
}

// Animate loop: lerp transforms
function animate() {
  animationId = requestAnimationFrame(animate)
  for (const m of meshes) {
    m.userData.currentX = THREE.MathUtils.lerp(m.userData.currentX, m.userData.targetX, LERP_SPEED)
    m.userData.currentY = THREE.MathUtils.lerp(m.userData.currentY, m.userData.targetY, LERP_SPEED)
    m.userData.currentZ = THREE.MathUtils.lerp(m.userData.currentZ, m.userData.targetZ, LERP_SPEED)
    m.position.set(m.userData.currentX, m.userData.currentY, m.userData.currentZ)

    m.userData.currentScale = THREE.MathUtils.lerp(m.userData.currentScale, m.userData.targetScale, LERP_SPEED)
    m.scale.setScalar(m.userData.currentScale)
  }
  if (renderer) renderer.render(scene, camera)
}

// Lifecycle
onMounted(() => {
  if (typeof window === 'undefined') return
  try { initScene() } catch (err) { console.error('Three init failed', err); showFallback.value = true }
  applyScrollDepth()
})
onBeforeUnmount(() => { disposeScene() })

watch(() => props.projects, (nv, ov) => {
  meshes.forEach(m => { stackGroup.remove(m); m.geometry?.dispose(); if (Array.isArray(m.material)) m.material.forEach(x=>x.dispose()); else m.material?.dispose() })
  meshes.length = 0
  createMeshes()
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
</style>
