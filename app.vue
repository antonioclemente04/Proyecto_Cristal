<template>
  <div class="relative min-h-screen w-screen bg-white text-black overflow-hidden">
    <ClientOnly>
      <div class="absolute inset-0 -z-10">
        <GlassStack class="w-full h-full" />
      </div>
    </ClientOnly>

    <header class="fixed top-0 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none">
      <div class="text-xs md:text-sm tracking-[0.25em] font-semibold uppercase">UNVEIL®</div>
      <nav class="flex items-center gap-6 md:gap-10 text-[10px] md:text-xs uppercase">
        <a href="#" aria-label="Projects" class="hover:opacity-70 transition-opacity">Projects</a>
        <a href="#" aria-label="Research" class="hover:opacity-70 transition-opacity">Research</a>
        <a href="#" aria-label="Studio" class="hover:opacity-70 transition-opacity">Studio</a>
        <a href="#" aria-label="Contact" class="hover:opacity-70 transition-opacity">Contact</a>
      </nav>
    </header>

    <div class="fixed bottom-6 left-6 flex flex-col gap-2 text-[10px] md:text-xs uppercase">
      <button class="px-3 py-2 border border-black/20 rounded-md hover:bg-black hover:text-white transition-colors" aria-label="Overview">Overview</button>
      <button class="px-3 py-2 border border-black/20 rounded-md hover:bg-black hover:text-white transition-colors" aria-label="Index">Index</button>
    </div>

    <aside class="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 text-[9px] md:text-[10px] tracking-wide uppercase text-black/60">
      <button class="hover:text-black transition-colors" aria-label="All">All 255</button>
      <button class="hover:text-black transition-colors" aria-label="AI">AI 191</button>
      <button class="hover:text-black transition-colors" aria-label="Graphic Identity">Graphic Identity 40</button>
      <button class="hover:text-black transition-colors" aria-label="Interactive">Interactive 18</button>
    </aside>

    <NuxtPage />
  </div>
</template>
