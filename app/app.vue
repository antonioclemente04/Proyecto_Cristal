<template>
  <!-- App minimal: aplica layout por defecto y renderiza páginas -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// nada especial aquí para este caso
</script>

<style>
/* MANTENER aquí las reglas globales / font-face que estaban en tu app.vue original */
@font-face {
  font-family: 'Cabinet Grotesk';
  src: url('/fonts/CabinetGrotesk-Variable.woff2') format('woff2'),
       url('/fonts/CabinetGrotesk-Variable.woff') format('woff'),
       url('/fonts/CabinetGrotesk-Variable.ttf') format('truetype'),
       url('/fonts/CabinetGrotesk-Variable.eot') format('embedded-opentype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

html, body, #__nuxt {
  font-family: 'Cabinet Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  height: 100%;
}
</style>
