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
// GlassStack.vue (updated layout)
// Nuxt 3 + JavaScript component rendering an axonometric stack of square 'glass' cards.

import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as THREE from 'three'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  projects: { type: Array, default: () => [] },
  count: { type: Number, default: 12 },
  highlightIndex: { type: Number, default: 6 },
  // default card size reduced and square
  size: { type: Object, default: () => ({ w: 420, h: 420 }) },
  // positioning tuned to produce diagonal ascending at ~45deg axonometric look
  initialPos: { type: Object, default: () => ({ x: -520, y: 260, z: -80 }) },
  step: { type: Object, default: () => ({ dx: 140, dy: -100, dz: -110 }) },
  fallbackBreakpoint: { type: Number, default: 720 }
})

const emit = defineEmits(['projectClick'])
const router = useRouter()

// Refs and state
const wrapper = ref(null)
const canvasContainer = ref(null)
let renderer = null
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, 1, 10, 5000)
let animationId = null
let raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const meshes = []
const texCache = new Map()
const showFallback = ref(false)
const placeholderSmall = '/images/reloj-small.webp'
const placeholderLarge = '/images/reloj.webp'

// Derived
const projectsPreview = computed(() => props.projects.slice(0, props.count))
const projectsForNav = computed(() => props.projects.slice(0, props.count))

// Layout tuning
const SIDE_HOVER_OFFSET = 260 // px to move sideways on hover
const SCALE_HOVER = 1.12
const LERP_SPEED = 0.14

// Texture helpers
function loadTextureSmall(urlSmall) {
  try {
    const loader = new THREE.TextureLoader()
    const t = loader.load(urlSmall)
    t.encoding = THREE.sRGBEncoding
    t.minFilter = THREE.LinearMipMapLinearFilter
    t.magFilter = THREE.LinearFilter
    return t
  } catch (e) {
    return null
  }
}
function loadTextureHigh(urlHigh, material) {
  const loader = new THREE.TextureLoader()
  loader.load(urlHigh, tex => {
    tex.encoding = THREE.sRGBEncoding
    tex.minFilter = THREE.LinearMipMapLinearFilter
    tex.magFilter = THREE.LinearFilter
    if (material && !material.disposed) {
      material.map = tex
      material.needsUpdate = true
    }
  })
}

// Positioning helpers — now store base X/Y/Z and current/target for smooth lerp
function computePosition(i) {
  const X = props.initialPos.x + i * props.step.dx
  const Y = props.initialPos.y + i * props.step.dy
  const Z = props.initialPos.z + i * props.step.dz
  return { x: X, y: Y, z: Z }
}

function computeRotation(i) {
  // Axonometric: stronger tilt to create 45deg diagonal impression
  const baseRotY = -45 * Math.PI / 180 // rotate towards right
  const baseRotX = 30 * Math.PI / 180  // tilt upward
  const jitterY = (Math.random() * 4 - 2) * (Math.PI / 180)
  const jitterX = (Math.random() * 3 - 1.5) * (Math.PI / 180)
  const rotZ = (1.5 * Math.sin(i)) * (Math.PI / 180)
  return { x: baseRotX + jitterX, y: baseRotY + jitterY, z: rotZ }
}

function computeScale(i) {
  const base = 1
  return base * Math.pow(0.94, i)
}

// Create square meshes
function createMeshes() {
  const { w, h } = props.size
  const baseGeo = new THREE.PlaneGeometry(w, h)

  const count = Math.max(0, Math.min(props.count, props.projects.length))

  for (let i = 0; i < count; i++) {
    const p = props.projects[i] || {}
    const small = p.imageSmall || placeholderSmall
    const large = p.image || placeholderLarge

    const smallTex = loadTextureSmall(small)

    const material = new THREE.MeshPhysicalMaterial({
      map: smallTex,
      roughness: 0.26,
      metalness: 0.02,
      transmission: 0.12,
      clearcoat: 0.06,
      transparent: true,
      opacity: 1.0,
      ior: 1.48
    })

    const mesh = new THREE.Mesh(baseGeo.clone(), material)

    const pos = computePosition(i)
    const rot = computeRotation(i)
    const scale = computeScale(i)

    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.rotation.set(rot.x, rot.y, rot.z)
    mesh.scale.setScalar(scale)

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
      baseScale: scale,
      currentScale: scale,
      targetScale: scale,
      baseRot: rot,
      targetRot: { x: rot.x, y: rot.y, z: rot.z }
    }

    mesh.renderOrder = i
    mesh.castShadow = false
    mesh.receiveShadow = false

    scene.add(mesh)
    meshes.push(mesh)

    // lazy load high-res with stagger
    setTimeout(() => loadTextureHigh(large, material), 300 + i * 100)
  }
}

// Hover behavior: move laterally (side of the column) and bring forward slightly
function setHover(mesh) {
  mesh.userData.targetScale = mesh.userData.baseScale * SCALE_HOVER
  mesh.userData.targetZ = mesh.userData.baseZ + 200
  mesh.userData.targetX = mesh.userData.baseX + SIDE_HOVER_OFFSET
  // smooth rotation to face viewer more directly
  mesh.userData.targetRot = { x: 12 * Math.PI / 180, y: -10 * Math.PI / 180, z: 0 }
  mesh.renderOrder = 9999
}
function clearHover(mesh) {
  mesh.userData.targetScale = mesh.userData.baseScale
  mesh.userData.targetZ = mesh.userData.baseZ
  mesh.userData.targetX = mesh.userData.baseX
  mesh.userData.targetRot = mesh.userData.baseRot
  mesh.renderOrder = mesh.userData.index
}

// Scene init
function initScene() {
  const container = canvasContainer.value
  if (!container) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = false
  container.appendChild(renderer.domElement)

  // Camera tuned for axonometric/diagonal view
  camera.fov = 45
  camera.aspect = container.clientWidth / container.clientHeight
  camera.position.set(-220, 260, 720)
  camera.lookAt(0, 40, 0)

  // Lighting
  const dir = new THREE.DirectionalLight(0xffffff, 0.9)
  dir.position.set(-600, 800, 400)
  scene.add(dir)
  const amb = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(amb)
  const rim = new THREE.PointLight(0x00e0d1, 0.22, 2000)
  rim.position.set(900, 200, 400)
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
  if (renderer) {
    renderer.forceContextLoss()
    renderer.domElement.remove()
    renderer = null
  }
  meshes.forEach(m => {
    if (m.geometry) m.geometry.dispose()
    if (m.material) {
      if (m.material.map) m.material.map.dispose()
      m.material.dispose()
    }
    scene.remove(m)
  })
  texCache.clear()
}

// Resize
function onResize() {
  const container = canvasContainer.value
  if (!container || !renderer) return
  const w = container.clientWidth
  const h = container.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  showFallback.value = window.innerWidth <= props.fallbackBreakpoint
}

// Raycast pointer handling
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
  const worldPos = new THREE.Vector3()
  m.getWorldPosition(worldPos)
  camera.position.lerp(new THREE.Vector3(worldPos.x - 200, worldPos.y + 120, worldPos.z + 520), 0.18)
}

// Scroll-driven camera mapping — map vertical scroll to progression along the diagonal
function onScroll() {
  if (!wrapper.value) return
  const docH = document.documentElement.scrollHeight - window.innerHeight
  const t = docH > 0 ? window.scrollY / docH : 0
  const maxIndex = Math.max(1, meshes.length - 1)
  const targetIndex = t * maxIndex
  const idx = targetIndex
  const pos = computePosition(idx)
  const desired = new THREE.Vector3(pos.x - 220, pos.y + 120, pos.z + 720)
  camera.position.lerp(desired, 0.08)
  camera.lookAt(pos.x, pos.y - 40, pos.z)
}

// Animate loop
function animate() {
  animationId = requestAnimationFrame(animate)
  for (const m of meshes) {
    // lerp position components
    m.userData.currentX = THREE.MathUtils.lerp(m.userData.currentX, m.userData.targetX, LERP_SPEED)
    m.userData.currentY = THREE.MathUtils.lerp(m.userData.currentY, m.userData.targetY, LERP_SPEED)
    m.userData.currentZ = THREE.MathUtils.lerp(m.userData.currentZ, m.userData.targetZ, LERP_SPEED)
    m.position.set(m.userData.currentX, m.userData.currentY, m.userData.currentZ)
    // scale
    m.userData.currentScale = THREE.MathUtils.lerp(m.userData.currentScale, m.userData.targetScale, LERP_SPEED)
    m.scale.setScalar(m.userData.currentScale)
    // rotation
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, m.userData.targetRot.x, LERP_SPEED)
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, m.userData.targetRot.y, LERP_SPEED)
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, m.userData.targetRot.z, LERP_SPEED)
  }

  if (renderer) renderer.render(scene, camera)
}

// Lifecycle
onMounted(() => {
  if (typeof window === 'undefined') return
  try { initScene() } catch (err) { console.error('Three init failed', err); showFallback.value = true }
})
onBeforeUnmount(() => { disposeScene() })

// rebuild on prop change
watch(() => props.projects, (nv, ov) => {
  meshes.forEach(m => { scene.remove(m) })
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