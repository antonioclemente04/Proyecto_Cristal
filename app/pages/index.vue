<template>
  <div class="relative min-h-screen w-screen bg-black text-white overflow-hidden">
    <Transition name="splash-fade">
      <div v-if="showSplash" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- contenedor full-screen para Spline -->
        <div ref="splineWrap" class="w-full h-full relative">
          <!-- indicador mínimo (spinner) -->
          <div
            v-show="!splineReady"
            class="absolute inset-0 z-20 flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div class="w-10 h-10 border-4 border-white/20 rounded-full animate-spin" aria-hidden="true"></div>
            <span class="sr-only">Cargando escena…</span>
          </div>

          <!-- Spline viewer: se inyecta en cliente y se referencia por ref -->
          <div ref="splineContainer" class="w-full h-full z-10"></div>
        </div>
      </div>
    </Transition>

    <!-- header fuera del transition: siempre se renderiza -->
    <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10">
      <a href="/?nosplash=1" class="text-xs md:text-[1.3em] tracking-[0.06em] font-bold uppercase">GLASS LAB®</a>
    </header>

    <Transition name="main-fade">
      <div v-show="!showSplash">
        <ClientOnly v-if="isHomeRoute">
          <div class="absolute inset-0 z-0">
            <!-- forzamos remount del GlassStack aplicando key -->
            <GlassStack
              ref="glassStack"
              class="w-full h-full"
              :projects="projects"
              :highlight-index="6"
              :key="$route.fullPath"
            />
          </div>
        </ClientOnly>

        <!-- Contenido fijo/estático de index (si lo necesitas) -->
        <main class="relative z-10">
          <!-- tu contenido de índice aquí -->
        </main>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// IMPORT CORREGIDA (ruta relativa desde app/pages/index.vue hasta components/GlassStack.vue)
import GlassStack from '../../components/GlassStack.vue'
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'

/* CONFIG */
const SCENE_URL = 'https://prod.spline.design/fGpdQJwt7Rw4Zugj/scene.splinecode'
const SPLINE_VIEWER_SRC = 'https://unpkg.com/@splinetool/viewer@1.10.86/build/spline-viewer.js'
const SPLASH_VISIBLE_AFTER_LOAD_MS = 8000   // contador tras spline ready
const MAX_SPLASH_WAIT = 9000                // fallback máximo esperando a la escena
const CANVAS_POLL_INTERVAL = 200

/* Rutas / estado */
const route = useRoute()
const isHomeRoute = computed(() => {
  if (route?.name === 'index') return true
  if (typeof window !== 'undefined') {
    return window.location?.pathname === '/'
  }
  return false
})

const showSplash = ref(true)
const splineReady = ref(false)
const splineContainer = ref(null)
const splineWrap = ref(null)
const glassStack = ref(null)

const projects = ref([
  //{ id: 'glass-roman',     title: 'Vidrio Romano',    imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. I–III', href: '../glass/cristal-ciencia' },
  { id: 'LA CREACIÓN',  title: 'LA CREACIÓN',  imageSmall: '/images/warm.webp', image: '/images/warm.webp', century: 'S. V–XV', href: '/glass/artesania-vs-industria' },
  //{ id: 'FRAGILIDAD',  title: 'FRAGILIDAD', imageSmall: '/images/bulet.webp', image: '/images/bullet.webp', century: 'S. XIII–XVII', href: '/glass/fragilidad-vs-resistencia' },
  { id: 'ESCAPARATES',title: 'ESCAPARATES',imageSmall: '/images/reloj-small.webp', image: '/images/adds.png', century: 'S. XVIII', href: '/glass/escaparate' },
  { id: 'ESPEJOS', title: 'ESPEJOS',  imageSmall: '/images/reloj-small.webp', image: '/images/mirror.jpg', century: 'S. XIX', href: '/glass/espejo' },
  { id: 'PANTALLAS',    title: 'PANTALLAS',   imageSmall: '/images/reloj-small.webp', image: '/images/screen.png', century: 'S. XX', href: '/glass/Pantallas' },
])

/* gestión recursos y timers */
let scriptEl = null
let splineEl = null
let pollInterval = null
let observer = null
let forcedHideTimer = null
let splashHideTimer = null

/* marca spline listo y arranca el contador */
function markSplineReady(reason = '') {
  if (splineReady.value) return
  splineReady.value = true
  console.log('[splash] spline ready:', reason)

  if (forcedHideTimer) { clearTimeout(forcedHideTimer); forcedHideTimer = null }

  splashHideTimer = setTimeout(() => {
    finalizeSplashHide()
  }, SPLASH_VISIBLE_AFTER_LOAD_MS)
}

/* cerrar splash y forzar resize del GlassStack */
function finalizeSplashHide() {
  showSplash.value = false
  try { sessionStorage.setItem('visited', '1') } catch (e) {}
  nextTick().then(() => {
    try {
      if (glassStack.value && typeof glassStack.value.forceResize === 'function') {
        glassStack.value.forceResize()
      }
    } catch (e) { /* noop */ }
  })
  cleanup()
}

/* limpiezas */
function cleanup() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
  if (observer) { observer.disconnect(); observer = null }
  if (forcedHideTimer) { clearTimeout(forcedHideTimer); forcedHideTimer = null }
  if (splashHideTimer) { clearTimeout(splashHideTimer); splashHideTimer = null }

  try {
    if (splineEl && splineEl.removeEventListener) {
      const eventNames = ['load', 'loaded', 'ready', 'scene-loaded', 'spline-ready', 'load-complete']
      eventNames.forEach((ev) => splineEl.removeEventListener(ev, handleGenericEvent))
    }
  } catch (e) {}
  splineEl = null
}

/* listener genérico */
function handleGenericEvent(e) {
  markSplineReady(e?.type || 'event')
}

/* detecta canvas dentro del componente spline */
function detectCanvasInSpline() {
  try {
    if (!splineEl) return false
    const plainCanvas = splineEl.querySelector && splineEl.querySelector('canvas')
    if (plainCanvas) {
      const r = plainCanvas.getBoundingClientRect()
      if (r && r.width > 8 && r.height > 8) {
        markSplineReady('canvas-detected')
        return true
      }
    }
    if (splineEl.shadowRoot && splineEl.shadowRoot.querySelector) {
      const shadowCanvas = splineEl.shadowRoot.querySelector('canvas')
      if (shadowCanvas) {
        const r = shadowCanvas.getBoundingClientRect()
        if (r && r.width > 8 && r.height > 8) {
          markSplineReady('shadow-canvas-detected')
          return true
        }
      }
    }
  } catch (e) { /* ignore */ }
  return false
}

/* aseguramos que cleanup se ejecute al desmontar */
onUnmounted(() => {
  cleanup()
})

/* montaje (cliente-only) */
onMounted(async () => {
  await nextTick()
  if (typeof window === 'undefined') return

  if (!isHomeRoute.value) {
    showSplash.value = false
    return
  }

  const noSplash = route?.query?.nosplash === '1'
  const hasVisited = (() => {
    try { return sessionStorage.getItem('visited') === '1' } catch { return false }
  })()
  if (noSplash || hasVisited) {
    showSplash.value = false
    return
  }

  const container = splineContainer.value
  if (!container) {
    console.error('[splash] splineContainer no encontrado.')
    showSplash.value = false
    return
  }

  try {
    if (!document.querySelector(`script[data-spline-viewer]`)) {
      scriptEl = document.createElement('script')
      scriptEl.type = 'module'
      scriptEl.src = SPLINE_VIEWER_SRC
      scriptEl.setAttribute('data-spline-viewer', '1')
      scriptEl.async = true
      const loadPromise = new Promise((resolve, reject) => {
        scriptEl.addEventListener('load', () => resolve(true), { once: true })
        scriptEl.addEventListener('error', (err) => reject(err), { once: true })
      })
      document.head.appendChild(scriptEl)
      await loadPromise
      console.log('[splash] spline viewer script cargado.')
    } else {
      console.log('[splash] spline viewer script ya presente.')
    }
  } catch (err) {
    console.error('[splash] error cargando spline-viewer script', err)
    finalizeSplashHide()
    return
  }

  try {
    splineEl = document.createElement('spline-viewer')
    splineEl.setAttribute('url', SCENE_URL)
    splineEl.setAttribute('background', 'transparent')
    container.innerHTML = ''
    container.appendChild(splineEl)
  } catch (err) {
    console.error('[splash] error creando <spline-viewer>:', err)
    finalizeSplashHide()
    return
  }

  try {
    const eventNames = ['load', 'loaded', 'ready', 'scene-loaded', 'spline-ready', 'load-complete']
    eventNames.forEach((ev) => splineEl.addEventListener(ev, handleGenericEvent, { once: true, passive: true }))
  } catch (e) {}

  try {
    observer = new MutationObserver(() => {
      if (detectCanvasInSpline()) {
        observer.disconnect()
      }
    })
    observer.observe(splineEl, { childList: true, subtree: true })
  } catch (e) {}

  pollInterval = setInterval(() => {
    if (detectCanvasInSpline()) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }, CANVAS_POLL_INTERVAL)

  forcedHideTimer = setTimeout(() => {
    if (!splineReady.value) {
      console.warn('[splash] timeout máximo alcanzado; cerrando splash (fallback).')
      finalizeSplashHide()
    }
  }, MAX_SPLASH_WAIT)
})
</script>

<style scoped>
/* Transiciones */
.splash-fade-enter-active { transition: none; }
.splash-fade-leave-active { transition: opacity .6s ease-in-out; }
.splash-fade-leave-to { opacity: 0; }
.main-fade-enter-active { transition: opacity .6s ease-in-out .6s; }
.main-fade-enter-from { opacity: 0; }

/* Reglas específicas del componente */
canvas { display: block; width: 100%; height: 100%; }
[spline-viewer] { width: 100%; height: 100%; display: block; }

/* util sr-only para accesibilidad */
.sr-only {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
</style>
