<template>
  <div class="min-h-screen w-screen bg-black text-white">
    <!-- Header que estará en todas las páginas -->
    <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10">
      <a href="/?nosplash=1" class="text-xs md:text-[1.3em] tracking-[0.06em] font-bold uppercase">GLASS LAB®</a>
    </header>

    <!-- slot para las páginas -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// layout sencillo: no script necesario a menos que quieras lógica global de header
</script>

<style scoped>
/* si quieres estilos del header específicos, ponlos aquí */
</style>
