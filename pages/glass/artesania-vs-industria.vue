<template>
  <div class="relative min-h-screen bg-red-900 text-white">
    <div id="hydra-bg"></div>
    <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between z-10">
      <a href="/?nosplash=1" class="text-xs md:text-[1.3em] font-bold uppercase">GLASS LAB®</a>
    </header>

    <main class="relative z-10 pt-24 px-6 md:px-12 max-w-5xl mx-auto">
      <h1 class="text-4xl font-bold mb-4">Otro — espacio libre</h1>
      <p class="mb-6">Página flexible para un tema extra: investigación, experimentos, o catálogo.</p>

      <section class="mb-6">
        <h2 class="text-2xl font-semibold mb-2">Ideas posibles</h2>
        <ul class="list-disc ml-6">
          <li>Reciclaje del vidrio y economía circular.</li>
          <li>Vidrio en arquitectura sostenible.</li>
          <li>Proyectos experimentales: vidrio interactivo o fotónico.</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve(true)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

let hydra = null
let canvas = null

onMounted(async () => {
  if (typeof window === 'undefined') return
  try {
    if (!window.Hydra) {
      await loadScript('https://unpkg.com/hydra-synth')
    }
    const container = document.getElementById('hydra-bg')
    if (!container) return
    canvas = document.createElement('canvas')
    canvas.id = 'hydra-canvas'
    container.appendChild(canvas)
    hydra = new window.Hydra({ canvas, detectAudio: true, makeGlobal: true })

    noise()
      .color(1, () => Math.min(1, 0.2 + a.fft[1] * 0.8), 0)
      .modulate(noise(() => a.fft[0] * 10))
      .scale(() => 1 + a.fft[2] * 3)
      .layer(
        src(o0)
          .mask(osc(10).modulateRotate(osc(), 90, 0.385))
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
      .rotate(({ time }) => (time % 360) * 0.05)
      .out(o2)

    render(o2)
  } catch (e) {}
})

onBeforeUnmount(() => {
  try {
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
  } catch (e) {}
  hydra = null
})
</script>

<style scoped>
#hydra-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(60% 60% at 50% 40%, rgba(255,120,0,0.25), rgba(255,0,0,0.15) 60%, rgba(0,0,0,0) 100%);
}
#hydra-canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
