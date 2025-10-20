<template>
  <div class="relative min-h-screen w-screen bg-black text-white overflow-hidden">
    <ClientOnly>
      <div class="absolute inset-0 -z-10">
        <GlassStack class="w-full h-full" />
      </div>
    </ClientOnly>

    <Transition name="splash-fade">
      <div v-if="showSplash" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 iridescent-bg"></div>
        <div class="relative z-10 text-center px-6">
          <h1 class="text-4xl md:text-6xl font-bold tracking-[0.2em] uppercase">GLASS LAB</h1>
          <p class="mt-4 text-sm md:text-base opacity-90">Exploración visual y material del vidrio a través del tiempo</p>
        </div>
      </div>
    </Transition>

    <Transition name="main-fade">
      <div v-show="!showSplash">
        <header class="fixed top-0 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10">
          <div class="text-xs md:text-sm tracking-[0.25em] font-semibold uppercase">GLASS LAB®</div>
          <nav class="flex items-center gap-6 md:gap-10 text-[10px] md:text-xs uppercase">
            <a href="#" aria-label="Projects" class="hover:opacity-70 transition-opacity">Projects</a>
            <a href="#" aria-label="Research" class="hover:opacity-70 transition-opacity">Research</a>
            <a href="#" aria-label="Studio" class="hover:opacity-70 transition-opacity">Studio</a>
            <a href="#" aria-label="Contact" class="hover:opacity-70 transition-opacity">Contact</a>
          </nav>
        </header>

        <div class="fixed bottom-6 left-6 flex flex-col gap-2 text-[10px] md:text-xs uppercase z-10">
          <button class="px-3 py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors" aria-label="Overview">Overview</button>
          <button class="px-3 py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors" aria-label="Index">Index</button>
        </div>

        <aside class="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 text-[9px] md:text-[10px] tracking-wide uppercase text-white/60 z-10">
          <button class="hover:text-white transition-colors" aria-label="All">All 255</button>
          <button class="hover:text-white transition-colors" aria-label="AI">AI 191</button>
          <button class="hover:text-white transition-colors" aria-label="Graphic Identity">Graphic Identity 40</button>
          <button class="hover:text-white transition-colors" aria-label="Interactive">Interactive 18</button>
        </aside>

        <NuxtPage />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(true)
onMounted(() => {
  setTimeout(() => (showSplash.value = false), 4000)
})
</script>

<style scoped>
/* Splash: solo animamos al salir */
.splash-fade-enter-active { transition: none; }
.splash-fade-leave-active { transition: opacity .6s ease-in-out; }
.splash-fade-leave-to { opacity: 0; }

/* Main: entra después de .6s (secuencia total 1.2s) */
.main-fade-enter-active { transition: opacity .6s ease-in-out .6s; }
.main-fade-enter-from { opacity: 0; }

.iridescent-bg { position: absolute; inset: 0; background: #000; overflow: hidden; }
.iridescent-bg::before {
  content: "";
  position: absolute; inset: -10%;
  background:
    radial-gradient(40% 40% at var(--x1,20%) var(--y1,30%), rgba(110,231,255,0.35), transparent 60%),
    radial-gradient(35% 35% at var(--x2,80%) var(--y2,25%), rgba(167,139,250,0.35), transparent 60%),
    radial-gradient(45% 45% at var(--x3,70%) var(--y3,70%), rgba(244,114,182,0.35), transparent 60%),
    radial-gradient(35% 35% at var(--x4,25%) var(--y4,75%), rgba(245,158,11,0.28), transparent 60%),
    radial-gradient(50% 50% at var(--x5,50%) var(--y5,50%), rgba(52,211,153,0.25), transparent 60%);
  filter: blur(40px) saturate(140%);
  mix-blend-mode: screen;
  animation: blobs 28s ease-in-out infinite alternate;
}
.iridescent-bg::after {
  content: "";
  position: absolute; inset: -20%;
  background: repeating-conic-gradient(from 0deg, rgba(255,255,255,0.03) 0 2deg, rgba(0,0,0,0) 2deg 4deg);
  mix-blend-mode: overlay; opacity: .25; filter: blur(0.5px);
  animation: spin 180s linear infinite;
}

@keyframes blobs {
  0% {
    --x1: 18%; --y1: 32%;
    --x2: 82%; --y2: 24%;
    --x3: 72%; --y3: 72%;
    --x4: 26%; --y4: 78%;
    --x5: 50%; --y5: 48%;
  }
  50% {
    --x1: 28%; --y1: 28%;
    --x2: 76%; --y2: 32%;
    --x3: 68%; --y3: 68%;
    --x4: 32%; --y4: 70%;
    --x5: 56%; --y5: 52%;
  }
  100% {
    --x1: 22%; --y1: 22%;
    --x2: 70%; --y2: 20%;
    --x3: 62%; --y3: 74%;
    --x4: 22%; --y4: 66%;
    --x5: 48%; --y5: 58%;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
