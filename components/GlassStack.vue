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
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as THREE from 'three'
import { useRouter } from 'vue-router'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  count: { type: Number, default: 12 },
  highlightIndex: { type: Number, default: 6 },
  // smaller square cards
  size: { type: Object, default: () => ({ w: 320, h: 320, depth: 12 }) },
  // arrange left-to-right, upward: increase X and increase Y for later items
  initialPos: { type: Object, default: () => ({ x: -560, y: -220, z: 0 }) },
  step: { type: Object, default: () => ({ dx: 160, dy: 120, dz: -40 }) },
  fallbackBreakpoint: { type: Number, default: 720 }
})

const emit = defineEmits(['projectClick'])
const router = useRouter()

// Refs/state
const wrapper = ref(null)
const canvasContainer = ref(null)
let renderer = null
const scene = new THREE.Scene()
let camera = null // will be OrthographicCamera
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

// Interaction tuning
const SIDE_HOVER_OFFSET = 220
const SCALE_HOVER = 1.03 // keep almost same size
const LERP_SPEED = 0.16

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
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.22,
      metalness: 0.03,
      transmission: 0.14,
      clearcoat: 0.06,
      transparent: true,
      side: THREE.FrontSide,
      ior: 1.5
    })

    // side/back materials (slightly darker glass)
    const sideMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.6, metalness: 0.05, transmission: 0.02, transparent: true })

    // create box geometry and assign materials array
    const geo = new THREE.BoxGeometry(w, h, depth)
    // materials order: +X, -X, +Y, -Y, +Z, -Z (three.js BoxGeometry group order)
    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]

    const mesh = new THREE.Mesh(geo, materials)

    // compute base position in stackGroup coordinates
    const pos = computePosition(i)

    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.scale.setScalar(computeScale(i))

    // store userData for animation lerp
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
      depth: depth
    }

    mesh.renderOrder = i
    meshes.push(mesh)
    stackGroup.add(mesh)

    // lazy load hi-res
    setTimeout(() => loadTextureHigh(large, frontMat), 300 + i * 120)
  }
}

// Hover behavior: lateral translation relative to group, slight forward (Z more negative -> visually above stack) and small scale
function setHover(mesh) {
  mesh.userData.targetX = mesh.userData.baseX + SIDE_HOVER_OFFSET
  mesh.userData.targetZ = mesh.userData.baseZ - 60 // bring slightly forward in group local coords
  mesh.userData.targetScale = SCALE_HOVER
  mesh.renderOrder = 9999
}
function clearHover(mesh) {
  mesh.userData.targetX = mesh.userData.baseX
  mesh.userData.targetZ = mesh.userData.baseZ
  mesh.userData.targetScale = mesh.userData.baseScale
  mesh.renderOrder = mesh.userData.index
}

// Scene init using OrthographicCamera for true axonometric
function initScene() {
  const container = canvasContainer.value
  if (!container) return

  const w = container.clientWidth
  const h = container.clientHeight
  // frustum size tuned for comfortable scale — adjust FRUSTUM_BASE if needed
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
  // rotate so that left->right ascends up: rotate around Y positive and tilt X negative
  stackGroup.rotation.set(THREE.MathUtils.degToRad(-30), THREE.MathUtils.degToRad(45), 0)
  scene.add(stackGroup)

  // lighting
  const amb = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(amb)
  const key = new THREE.DirectionalLight(0xffffff, 0.9)
  key.position.set(-800, 1000, 1200)
  scene.add(key)
  const rim = new THREE.PointLight(0x94fff0, 0.18, 4000)
  rim.position.set(1000, 500, 1000)
  scene.add(rim)

  createMeshes()

  // events
  onResize()
  window.addEventListener('resize', onResize)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeyDown)

  animate()
}

function disposeScene() {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeyDown)
  const container = canvasContainer.value
  if (container) container.removeEventListener('pointermove', onPointerMove)
  if (container) container.removeEventListener('pointerdown', onPointerDown)
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
  const desired = new THREE.Vector3(worldPos.x - 120, worldPos.y + 80, camera.position.z)
  camera.position.lerp(desired, 0.18)
}

// Scroll-driven camera mapping — move camera parallel to stackGroup base axis
function onScroll() {
  if (!wrapper.value) return
  const docH = document.documentElement.scrollHeight - window.innerHeight
  const t = docH > 0 ? window.scrollY / docH : 0
  const maxIndex = Math.max(1, meshes.length - 1)
  const targetIndex = t * maxIndex
  const idx = targetIndex
  const pos = computePosition(idx)
  const desired = new THREE.Vector3(pos.x - 120, pos.y + 80, camera.position.z)
  camera.position.lerp(desired, 0.08)
  camera.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z))
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