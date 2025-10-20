<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4" @click="nextDialog">
    <!-- Link Saltar introducción (arriba a la derecha) -->
    <div class="absolute top-6 right-6">
      <a 
        @click.stop="skipIntro"
        href="javascript:void(0)"
        class="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200"
      >
        Saltar introducción →
      </a>
    </div>
    
    <div class="max-w-6xl w-full flex items-center justify-center gap-12">
      <!-- Link Salir (izquierda) -->
      <div v-if="isLastDialog" class="flex-shrink-0">
        <a 
          @click.stop="exitPage"
          href="javascript:void(0)"
          class="text-white text-xl font-light hover:underline transition-all duration-300 cursor-pointer"
        >
          Ni de coña, friki.
        </a>
      </div>

      <!-- Contenedor central -->
      <div class="flex flex-col items-center">
        <!-- Mascota con animación de flotación -->
        <div class="mb-8 floating">
          <img 
            src="/images/serbepsa.png" 
            alt="Mascota" 
            class="w-64 h-64 object-contain"
          />
        </div>

        <!-- Cuadro de diálogo con animación -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 relative max-w-2xl dialog-appear">
          <!-- Flecha apuntando a la mascota -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
          
          <div class="text-gray-800 text-lg leading-relaxed min-h-[120px]">
            <p class="mb-4 text-fade-in">{{ currentDialogText }}</p>
            
            <!-- Indicador de click si no es el último diálogo -->
            <div v-if="!isLastDialog" class="text-right text-sm text-gray-400 italic animate-pulse">
              Haz click para continuar...
            </div>
          </div>
        </div>
      </div>

      <!-- Link Continuar (derecha) -->
      <div v-if="isLastDialog" class="flex-shrink-0">
        <a 
          @click.prevent="goToIndex"
          href="javascript:void(0)"
          class="text-white text-xl font-light hover:underline transition-all duration-300 cursor-pointer"
        >
          Supongo...
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Diálogos de la mascota
const dialogs = [
  "Hola, cacho-carne",
  "Soy tu guia virtual",
  "Sí, una cerveza",
  "Ire cambiando de forma a traves de tu viaje",
  "Voy a enseñarte movidas sobre el vidrio a través del tiempo",
  "Suena genial ¿Eh?",
]

const currentDialogIndex = ref(0)

const currentDialogText = computed(() => {
  return dialogs[currentDialogIndex.value]
})

const isLastDialog = computed(() => {
  return currentDialogIndex.value === dialogs.length - 1
})

// Avanzar al siguiente diálogo
const nextDialog = () => {
  if (currentDialogIndex.value < dialogs.length - 1) {
    currentDialogIndex.value++
  }
}

// Ir al home
const goToIndex = () => {
  router.push('/home')
}

// Ir directamente al espejo, saltándonos la introducción
const skipIntro = (e) => {
  e?.stopPropagation()
  router.push('/espejo')
}

// Salir de la página
const exitPage = () => {
  window.close()
  // Si window.close() no funciona (navegadores modernos lo bloquean), redirigir a una página en blanco
  setTimeout(() => {
    window.location.href = 'about:blank'
  }, 100)
}
</script>

<style scoped>
/* Animación de flotación para la mascota */
@keyframes floating {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.floating {
  animation: floating 3s ease-in-out infinite;
}

/* Animación de aparición del diálogo */
@keyframes dialogAppear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-appear {
  animation: dialogAppear 0.4s ease-out;
}

/* Animación de fade-in para el texto */
@keyframes textFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.text-fade-in {
  animation: textFadeIn 0.6s ease-in;
}

/* Animación de pulso para el indicador */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
