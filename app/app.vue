<template>
  <div class="relative min-h-screen w-screen bg-white text-black overflow-hidden">
    <ClientOnly>
      <div class="absolute inset-0 z-0">
        <!-- GlassStack component: ajusta la prop highlight-index si quieres -->
        <GlassStack class="w-full h-full" :projects="projects" :highlight-index="6" />
      </div>
    </ClientOnly>

    <header class="fixed top-0 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10">
      <div class="text-xs md:text-sm tracking-[0.25em] font-semibold uppercase">GLASS LAB®</div>
      <nav class="flex items-center gap-6 md:gap-10 text-[10px] md:text-xs uppercase">
        <a href="#" aria-label="Projects" class="hover:opacity-70 transition-opacity">A</a>
        <a href="#" aria-label="Research" class="hover:opacity-70 transition-opacity">A</a>
        <a href="#" aria-label="Studio" class="hover:opacity-70 transition-opacity">A</a>
        <a href="#" aria-label="Contact" class="hover:opacity-70 transition-opacity">A</a>
      </nav>
    </header>

    <div class="fixed bottom-6 left-6 flex flex-col gap-2 text-[10px] md:text-xs uppercase z-10">
      <button class="px-3 py-2 border border-black/20 rounded-md hover:bg-black hover:text-white transition-colors" aria-label="Overview">Overview</button>
      <button class="px-3 py-2 border border-black/20 rounded-md hover:bg-black hover:text-white transition-colors" aria-label="Index">Index</button>
    </div>

    <aside class="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 text-[9px] md:text-[10px] tracking-wide uppercase text-black/60 z-10">
      <button class="hover:text-black transition-colors" aria-label="All">S XVIII</button>
      <button class="hover:text-black transition-colors" aria-label="AI">S XIX</button>
      <button class="hover:text-black transition-colors" aria-label="Graphic Identity">S XX</button>
      <button class="hover:text-black transition-colors" aria-label="Interactive">S XXI</button>
    </aside>

    <NuxtPage />
  </div>
</template>

<script setup>
/*
  App.vue integration for Nuxt 3
  - GlassStack component (components/GlassStack.vue) must exist (ya lo creamos).
  - projects: array con 12 elementos placeholder.
*/

import GlassStack from '../components/GlassStack.vue' // ruta estándar; ajusta si tu estructura es distinta
import { ref } from 'vue'

const projects = ref([
  { id: 'glass-roman',     title: 'Vidrio Romano',          imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. I–III' },
  { id: 'glass-medieval',  title: 'Vidrio Medieval',        imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. V–XV' },
  { id: 'glass-venetian',  title: 'Soplado Veneciano',      imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XIII–XVII' },
  { id: 'glass-industrial',title: 'Vidrio Industrial',      imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XVIII' },
  { id: 'glass-catalogue', title: 'Catálogo Vítreo',        imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XIX' },
  { id: 'glass-modern',    title: 'Vidrio Moderno',         imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XX' },
  { id: 'glass-float',     title: 'Proceso Float',          imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XX' },
  { id: 'glass-architect', title: 'Vidrio en Arquitectura', imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XX' },
  { id: 'glass-tech',      title: 'Vidrio Técnico',         imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XXI' },
  { id: 'glass-smart',     title: 'Vidrio Inteligente',     imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XXI+' },
  { id: 'glass-future',    title: 'Vidrio Experimental',    imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'Futuro' },
  { id: 'glass-archive',   title: 'Archivo Vítreo',         imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'Varios' }
])
</script>
