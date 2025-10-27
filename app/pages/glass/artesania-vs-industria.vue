<template>
  <div class="relative artesania-industria min-h-screen bg-red-900 text-white">

    <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between z-10">
      <a href="/?nosplash=1" class="text-xs md:text-[1.3em] font-bold uppercase">GLASS LAB®</a>
    </header>

    <main class="relative z-10 px-6 md:px-12 max-w-5xl mx-auto">
      <section class="min-h-[calc(108dvh-64px)] flex items-center justify-center hero-section relative left-1/2 -translate-x-1/2 w-screen">
        <!-- Fondo Hydra solo para el hero -->
        <div v-if="mounted" id="hydra-hero"></div>
        <span class="relative z-[10] text-white text-sm font-semibold md:text-base">SOPLA EL VIDRIO</span>
      </section>

      <!-- Wrapper que inicia justo donde empiezan las columnas -->
      <div class="relative left-1/2 -translate-x-1/2 w-screen">
        <!-- hydra-bg solo se renderiza en cliente para evitar mismatches en la hidratación -->
        <div v-if="mounted" id="hydra-bg"></div>

        <section class="mt-0 mb-0 relative left-1/2 -translate-x-1/2 w-screen px-0 md:px-0">
          <div class="columns-1 md:columns-2 gap-x-0 relative z-[1]">
            <div class="break-inside-avoid">
              <img
                src="/images/furnace.webp"
                alt="cristal 1"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(0, '/images/furnace.webp', 'cristal 1')"
              />
            </div>
            <div class="break-inside-avoid">
              <img
                src="/images/bodies.webp"
                alt="cristal 2"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(1, '/images/bodies.webp', 'cristal 2')"
              />
            </div>
            <div class="break-inside-avoid">
              <img
                src="/images/mouth.webp"
                alt="warm"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(2, '/images/mouth.webp', 'warm')"
              />
            </div>
            <div class="break-inside-avoid">
              <img
                src="/images/blobs.webp"
                alt="warm 2"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(3, '/images/blobs.webp', 'warm 2')"
              />
            </div>
          </div>
        </section>

        <!-- Texto intermedio a ancho completo: NEVER FELT -->
        <section class="relative left-1/2 -translate-x-1/2 w-screen py-24 px-0">
          <div class="full-width-title" aria-hidden="false">
            <h2 class="never-felt" role="heading" aria-level="2">
              NEVER FELT
            </h2>
          </div>
        </section>

        <section class="mt-8 mb-0 relative left-1/2 -translate-x-1/2 w-screen px-0 md:px-0">
          <div class="columns-1 md:columns-2 gap-x-12 relative z-[1]">
            <div class="break-inside-avoid p-8 pt-20">
              <img
                src="/images/corazon.webp"
                alt="corazon"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(4, '/images/corazon.webp', 'corazon')"
              />
            </div>
            <div class="break-inside-avoid p-10 pb-10">
              <img
                src="/images/gota.webp"
                alt="gota"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(5, '/images/gota.webp', 'gota')"
              />
            </div>
            <div class="break-inside-avoid p-8 pt-24">
              <img
                src="/images/naturaleza.jpg"
                alt="naturaleza"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(6, '/images/naturaleza.webp', 'naturaleza')"
              />
            </div>
            <div class="break-inside-avoid p-8 pt-16">
              <img
                src="/images/tubo.webp"
                alt="tubo"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(7, '/images/tubo.webp', 'tubo')"
              />
            </div>
            <div class="break-inside-avoid p-10 pt-20">
              <img
                src="/images/aura.webp"
                alt="aura"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(8, '/images/aura.webp', 'aura')"
              />
            </div>
            <div class="break-inside-avoid p-10 pt-24">
              <img
                src="/images/chips.gif"
                alt="chip"
                loading="lazy"
                class="w-full h-auto block clickable-image"
                @click.stop="openImage(9, '/images/chips.gif', 'chip')"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Lightbox overlay (pantalla completa) -->
      <transition name="lightbox-fade">
        <div
          v-if="isOpen"
          class="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="activeImageAlt || 'Imagen ampliada'"
          @click.self="closeImage"
        >
          <img
            :src="activeImageSrc"
            :alt="activeImageAlt"
            class="lightbox-image zoom-in"
            @click.stop="closeImage"
            tabindex="0"
          />
          <!-- Optional caption area -->
          <div v-if="activeImageAlt" class="lightbox-caption" aria-hidden="true">{{ activeImageAlt }}</div>
        </div>
      </transition>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const mounted = ref(false) // controla renderado solo en cliente
const SPEED = 0.25 // 0 = parado, 1 = velocidad original — ajústalo aquí

let hydra = null
let canvas = null
let resizeCanvas = null
let ro = null

let hydraHero = null
let canvasHero = null
let resizeCanvasHero = null
let roHero = null

// Lightbox state
const isOpen = ref(false)
const activeImageSrc = ref('')
const activeImageAlt = ref('')
const activeImageIndex = ref(null)
let previousBodyOverflow = null

function openImage(index, src, alt = '') {
  activeImageIndex.value = index
  activeImageSrc.value = src
  activeImageAlt.value = alt
  isOpen.value = true
  // bloquear scroll del body
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function closeImage() {
  isOpen.value = false
  activeImageSrc.value = ''
  activeImageAlt.value = ''
  activeImageIndex.value = null
  // restaurar scroll
  document.body.style.overflow = previousBodyOverflow || ''
  previousBodyOverflow = null
}

function toggleImage(index, src, alt = '') {
  if (isOpen.value && activeImageIndex.value === index) {
    closeImage()
  } else {
    openImage(index, src, alt)
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeImage()
  }
}

// Repite la carga de Hydra y canvas — idéntico a tu implementación anterior
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') return resolve(true)
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => reject(new Error('load error')))
      return
    }

    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.setAttribute('data-hydra', 'true')
    s.onload = () => {
      s.setAttribute('data-loaded', 'true')
      resolve(true)
    }
    s.onerror = () => reject(new Error('failed to load script: ' + src))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  mounted.value = true

  // Listener para cerrar con Esc
  window.addEventListener('keydown', onKeyDown)

  // espera un tick para que Vue inserte #hydra-bg si fuera necesario
  await Promise.resolve()

  try {
    if (!window.Hydra) {
      await loadScript('https://unpkg.com/hydra-synth')
    }

    // HERO Hydra
    const heroContainer = document.getElementById('hydra-hero')
    if (heroContainer) {
      canvasHero = document.createElement('canvas')
      canvasHero.id = 'hydra-hero-canvas'
      heroContainer.appendChild(canvasHero)

      resizeCanvasHero = () => {
        const w = heroContainer.clientWidth || window.innerWidth
        const h = heroContainer.clientHeight || window.innerHeight
        canvasHero.width = Math.max(1, Math.floor(w))
        canvasHero.height = Math.max(1, Math.floor(h))
        canvasHero.style.width = '100%'
        canvasHero.style.height = '100%'
      }
      resizeCanvasHero()
      window.addEventListener('resize', resizeCanvasHero)
      if (window.ResizeObserver) {
        roHero = new ResizeObserver(() => resizeCanvasHero())
        roHero.observe(heroContainer)
      }

      hydraHero = new window.Hydra({
        canvas: canvasHero,
        detectAudio: true,
        makeGlobal: true,
        width: canvasHero.width,
        height: canvasHero.height,
      })

      try {
        noise()
          .color(() => a.fft[2] * 2, 0, 0.6)
          .modulate(noise(() => a.fft[0] * 10))
          .scale(() => a.fft[2] * 5)
          .layer(
            src(o0)
              .mask(osc(10).modulateRotate(osc(), 90, 0.385))
              .scale(() => a.fft[0] * 3.547)
              .luma(0.2, 0.019)
          )
          .blend(o0)
          .out(o0)

        osc()
          .modulate(noise(() => a.fft[1] + 5))
          .color(1, 0.743, 0)
          .out(o1)

        src(o0)
          .modulate(o1)
          .layer(src(o1).mask(o1).saturate(7))
          .modulateRotate(o1)
          .rotate(({ time }) => (time % 360) * 0.05)
          .out(o2)

        render(o2)
      } catch (eHero) {
        console.error('Error inicializando Hydra HERO:', eHero)
      }
    }

    // Hydra background para el contenedor principal
    const container = document.getElementById('hydra-bg')
    if (!container) return

    canvas = document.createElement('canvas')
    canvas.id = 'hydra-canvas'
    container.appendChild(canvas)

    resizeCanvas = () => {
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      canvas.width = Math.max(1, Math.floor(w))
      canvas.height = Math.max(1, Math.floor(h))
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => resizeCanvas())
      ro.observe(container)
    }

    hydra = new window.Hydra({
      canvas,
      detectAudio: true,
      makeGlobal: true,
      width: window.innerWidth,
      height: window.innerHeight,
    })

    try {
      osc(5, 0.1)
        .modulate(noise(6), 0.22)
        .diff(o0)
        .modulateScrollY(
          osc(2).modulate(osc().rotate(), 0.11)
        )
        .scale(0.72)
        .color(0.99, 1.014, 1)
        .out()
    } catch (hydraErr) {
      console.error('Error inicializando patrones de Hydra:', hydraErr)
    }
  } catch (e) {
    console.error('No se pudo inicializar Hydra:', e)
  }
})

onBeforeUnmount(() => {
  try {
    // limpieza DOM
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
    if (resizeCanvas) window.removeEventListener('resize', resizeCanvas)
    if (ro) ro.disconnect()

    if (canvasHero && canvasHero.parentNode) canvasHero.parentNode.removeChild(canvasHero)
    if (resizeCanvasHero) window.removeEventListener('resize', resizeCanvasHero)
    if (roHero) roHero.disconnect()

    // restore body overflow si algo quedó abierto
    if (previousBodyOverflow !== null) {
      document.body.style.overflow = previousBodyOverflow
      previousBodyOverflow = null
    }

    // remover listener de teclado
    window.removeEventListener('keydown', onKeyDown)
  } catch (e) {
    console.warn('Error en limpieza de Hydra o listeners:', e)
  } finally {
    hydra = null
    canvas = null
    resizeCanvas = null
    ro = null

    hydraHero = null
    canvasHero = null
    resizeCanvasHero = null
    roHero = null
  }
})
</script>

<style scoped>
.artesania-industria {
  overflow-x: hidden;
}

/* hydra background */
#hydra-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
#hydra-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* HERO hydra */
#hydra-hero {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.88;
}
#hydra-hero-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Título NEVER FELT */
.full-width-title {
  width: 100vw;
  box-sizing: border-box;
  position: relative;
  z-index: 3;
  pointer-events: none;
}

.never-felt {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0 2rem;
  margin: 0 auto;
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.01em;
  font-size: clamp(3rem, 14vw, 9rem);
  mix-blend-mode: difference;
  -webkit-mix-blend-mode: difference;
  color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  z-index: 3;
  pointer-events: none;
  font-family: "CabinetGrotesk-Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Lightbox / overlay */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.88);
  z-index: 9999;
  gap: 1rem;
  padding: 2rem;
  box-sizing: border-box;
  cursor: zoom-out;
}

/* Imagen ampliada */
.lightbox-image {
  max-width: 95vw;
  max-height: 95vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  transform-origin: center center;
  transition: transform 320ms cubic-bezier(.2,.9,.3,1), opacity 220ms ease;
  cursor: zoom-out;
  outline: none;
  -webkit-user-select: none;
  user-select: none;
}

/* small caption */
.lightbox-caption {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 0.9rem;
  opacity: 0.9;
  z-index: 10000;
  pointer-events: none;
}

/* Zoom animation class */
.zoom-in {
  transform: scale(1);
  opacity: 1;
}

/* Transition para el overlay */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 220ms ease;
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* Hacer las miniaturas claramente clicables */
.clickable-image {
  cursor: zoom-in;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.clickable-image:active {
  transform: scale(0.995);
}

/* evita que mix-blend se vea afectado por stacking contexts innecesarios */
.artesania-industria, #hydra-bg, #hydra-hero {
  isolation: auto;
}

/* Ajustes para las columnas e imágenes */
.columns-1 img,
.columns-2 img {
  display: block;
  width: 100%;
  height: auto;
}

/* Evitar scroll horizontal */
:root {
  overflow-x: hidden;
}
</style>
