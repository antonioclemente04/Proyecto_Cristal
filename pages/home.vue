<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">Bienvenido al Proyecto Cristal</h1>
      <p class="text-gray-600 mb-8 text-lg">links</p>
      
      <div class="space-y-4">
        <NuxtLink 
          to="/espejo" 
          class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
        >
          Espejos
        </NuxtLink>
      </div>
    </div>
  </div>
</template>