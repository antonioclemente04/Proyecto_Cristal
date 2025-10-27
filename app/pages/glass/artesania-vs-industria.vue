<template>
  <div class="relative artesania-industria min-h-screen bg-red-900 text-white">
    <!-- hydra-bg solo se renderiza en cliente para evitar mismatches en la hidratación -->
    <div v-if="mounted" id="hydra-bg"></div>

    <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between z-10">
      <a href="/?nosplash=1" class="text-xs md:text-[1.3em] font-bold uppercase">GLASS LAB®</a>
    </header>

    <main class="relative z-10 px-6 md:px-12 max-w-5xl mx-auto">
      <section class="min-h-[calc(108dvh-64px)] flex items-center justify-center">
        <span class="text-white text-sm font-semibold md:text-base">SOPLA EL VIDRIO</span>
      </section>

      <section class="mt-0 mb-0 relative left-1/2 -translate-x-1/2 w-screen px-0 md:px-0">
        <div class="columns-1 md:columns-2 gap-x-0">
          <div class="break-inside-avoid">
            <img src="/images/furnace.webp" alt="cristal 1" loading="lazy" class="w-full h-auto block" />
          </div>
          <div class="break-inside-avoid">
            <img src="/images/bodies.webp" alt="cristal 2" loading="lazy" class="w-full h-auto block" />
          </div>
          <div class="break-inside-avoid">
            <img src="/images/mouth.webp" alt="warm" loading="lazy" class="w-full h-auto block" />
          </div>
          <div class="break-inside-avoid">
            <img src="/images/blobs.webp" alt="warm" loading="lazy" class="w-full h-auto block" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const mounted = ref(false) // controla renderizado solo en cliente
const SPEED = 0.25 // 0 = parado, 1 = velocidad original — ajústalo aquí

let hydra = null
let canvas = null
let resizeCanvas = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // evita añadir el mismo script duplicado
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
  // marca que ya estamos en cliente y permite renderizar #hydra-bg
  mounted.value = true

  // espera un tick para que Vue inserte #hydra-bg si fuera necesario
  await Promise.resolve()

  try {
    // Carga Hydra solo en cliente
    if (!window.Hydra) {
      await loadScript('https://unpkg.com/hydra-synth')
    }

    const container = document.getElementById('hydra-bg')
    if (!container) return

    // crea canvas y lo añade al contenedor
    canvas = document.createElement('canvas')
    canvas.id = 'hydra-canvas'
    container.appendChild(canvas)

    // --- ajuste de tamaño dinámico ---
    resizeCanvas = () => {
      // usa valores enteros para el canvas real
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // mantener estilo al 100% para CSS
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // instancia Hydra — makeGlobal true añade helpers globales (noise(), osc(), etc.)
    hydra = new window.Hydra({
      canvas,
      detectAudio: true,
      makeGlobal: true,
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // --- Visuales con SPEED aplicado ---
    // (si Hydra cambia su API en el futuro, rodeamos con try/catch)
    try {
      noise()
        .color(1, () => Math.min(1, 0.2 + a.fft[1] * 0.8), 0)
        .modulate(noise(() => a.fft[0] * 10 * SPEED))
        .scale(() => 1 + a.fft[2] * 3)
        .layer(
          src(o0)
            .mask(osc(() => 10 * SPEED).modulateRotate(osc(() => 1 * SPEED), 90, 0.385))
            .scale(() => 1 + a.fft[0] * 2.2)
            .luma(0.2, 0.019)
        )
        .blend(o0)
        .out(o0)

      osc()
        .modulate(noise(() => a.fft[1] + 5))
        .color(1, 0.7, 0)
        .out(o1)

      src(o0)
        .modulate(o1)
        .layer(src(o1).mask(o1).saturate(7))
        .modulateRotate(o1)
        .rotate(({ time }) => ((time % 360) * 0.05) * SPEED) // ralentiza la rotación
        .out(o2)

      render(o2)
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

    // si Hydra expone algún método de cleanup, podrías llamarlo aquí:
    // if (hydra && hydra.stop) hydra.stop()
  } catch (e) {
    console.warn('Error en limpieza de Hydra:', e)
  } finally {
    hydra = null
    canvas = null
    resizeCanvas = null
  }
})
</script>

<style scoped>

.artesania-industria {
  overflow-x: hidden;
}

#hydra-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
#hydra-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
