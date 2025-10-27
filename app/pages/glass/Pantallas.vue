<template>
  <div class="relative min-h-screen bg-black select-none overflow-hidden">
    <!-- Frame de video de iglesia a pantalla completa -->
    <div v-if="showWindowFrame && !showGrid" class="fixed inset-0 z-0">
      <video 
        autoplay 
        loop 
        muted 
        playsinline 
        class="absolute inset-0 w-full h-full object-cover"
        src="/images/iglesia.mp4"
      ></video>
      <div class="absolute inset-0 bg-black bg-opacity-30"></div>
    </div>

    <!-- Diálogo superpuesto -->
    <div v-if="!showGrid" @click="nextMessage" class="relative z-10 w-full min-h-screen flex items-center justify-center p-4 cursor-pointer">
      <div class="max-w-4xl w-full px-4 text-center">
        <div class="text-white text-lg md:text-xl leading-relaxed min-h-[200px] flex flex-col justify-center">
          <p class="mb-4 fade-in">{{ currentMessage }}</p>
        </div>
        <div v-if="windowMessage" class="window-message mt-8 text-white text-lg">
          {{ windowMessage }}
        </div>
      </div>
    </div>

    <!-- Grid de videos -->
    <div v-if="showGrid" class="w-screen h-screen fixed top-0 left-0 flex items-center justify-center p-4">
      <div class="video-grid" @click="handleScreenClick">
        <div v-for="(video, index) in videos.slice(0, 8)" :key="index" class="video-tile">
          <div class="video-container">
            <video 
              v-if="!showStatic[index]"
              :src="video.src" 
              autoplay 
              loop 
              muted 
              playsinline 
              class="video-content"
            ></video>
            <video
              v-else
              src="/images/estática.mp4"
              autoplay
              loop
              muted
              playsinline
              class="video-content static-video"
            ></video>
            <img 
              src="/images/marco-tv.png" 
              alt="TV Frame" 
              class="tv-frame"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo glitch -->
    <div v-if="showDialog" class="glitch-container" @click="handleDialogClick">
      <div class="glitch-text">{{ currentDialogMessage }}</div>
      <div class="glitch-text glitch-text-2">{{ currentDialogMessage }}</div>
      <div class="glitch-text glitch-text-3">{{ currentDialogMessage }}</div>
      <div class="glitch-overlay"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Estado de la aplicación
const showWindowFrame = ref(true)
const showGrid = ref(false)
const showDialog = ref(false)
const currentDialogIndex = ref(0)
const showStatic = ref(Array(8).fill(false))
const hasClicked = ref(false)
const staticTimer = ref(null)
const dialogInterval = ref(null)

// Mensajes del diálogo glitch
const dialogMessages = [
  'nada de esto es real',
  'despierta',
  'la vida está ahí fuera'
]

const currentDialogMessage = computed(() => dialogMessages[currentDialogIndex.value])

// Videos para el grid
const videos = [
  { src: '/images/Bacon.mp4' },
  { src: '/images/conferencia.mp4' },
  { src: '/images/Fireworks.mp4' },
  { src: '/images/Fuego.mp4' },
  { src: '/images/Gaviota.mp4' },
  { src: '/images/gente.mp4' },
  { src: '/images/Tenis.mp4' },
  { src: '/images/Volcan.mp4' }
]

// Sistema de mensajes
const introMessages = [
  "Antes, el vidrio nos permitía ver el mundo a través de las ventanas...",
  "Las imponentes catedrales nos muestran como una ventana era capaz de embellecer la realidad",
  "En el pasado se exploraron nuevas formas de mirar a través",
  "Y aquello ha evolucionado hasta convertirse en lo que conocemos hoy como pantallas...",
]

const reflectionMessages = [
  "Cada pantalla es un fragmento de realidad...",
  "Nuestra atención se divide entre múltiples ventanas...",
  "El mundo se ha vuelto una red de pantallas interconectadas...",
  "¿Dónde termina la realidad y dónde comienza la representación?",
]

const currentMessageIndex = ref(0)
const showMessage = ref(true)
const showTV = ref(false)
const currentPhase = ref('intro')

const messages = computed(() => {
  return currentPhase.value === 'intro' ? introMessages : reflectionMessages
})

const currentMessage = computed(() => showMessage.value ? messages.value[currentMessageIndex.value] : '')
const isLastMessage = computed(() => currentMessageIndex.value === messages.value.length - 1)

const nextMessage = () => {
  if (currentMessageIndex.value < messages.value.length - 1) {
    currentMessageIndex.value++
  } else if (showWindowFrame.value) {
    // Mostrar el grid después de la ventana
    showWindowFrame.value = false
    showGrid.value = true
  }
}

const handleWindowClick = () => {
  nextMessage()
  windowMessage.value = ''
}

const showGlitchDialog = () => {
  showGrid.value = false
  showDialog.value = true
  showMessage.value = false // Hide any remaining messages
  
  // Cambiar mensajes cada 2 segundos
  dialogInterval.value = setInterval(() => {
    currentDialogIndex.value = (currentDialogIndex.value + 1) % dialogMessages.length
  }, 2000)
  
  // Después de mostrar todos los mensajes, volver al inicio
  setTimeout(() => {
    if (dialogInterval.value) {
      clearInterval(dialogInterval.value)
    }
  }, 6000)
}

const handleScreenClick = () => {
  if (!hasClicked.value) {
    hasClicked.value = true
    // Aplicar estática a cada celda con un retraso diferente
    showStatic.value.forEach((_, index) => {
      setTimeout(() => {
        const newShowStatic = [...showStatic.value]
        newShowStatic[index] = true
        showStatic.value = newShowStatic
      }, 300 * index) // Retraso de 300ms entre cada celda
    })
    
    // Mostrar diálogo después de 5 segundos
    staticTimer.value = setTimeout(showGlitchDialog, 5000)
  }
  nextMessage()
}

const handleDialogClick = (e) => {
  e.preventDefault()
  e.stopPropagation()
  if (dialogInterval.value) {
    clearInterval(dialogInterval.value)
  }
  router.push('/')
  return false
}

// Limpiar timeouts al desmontar
onUnmounted(() => {
  if (staticTimer.value) clearTimeout(staticTimer.value)
  if (dialogInterval.value) clearInterval(dialogInterval.value)
})

const startReflectionPhase = () => {
  currentPhase.value = 'reflection'
  currentMessageIndex.value = 0
  showMessage.value = true
  showGrid.value = true
}

// Inicializar efectos al montar
onMounted(() => {
  currentMessageIndex.value = 0
  showGrid.value = false
  showMessage.value = true
  currentPhase.value = 'intro'
})
</script>

<style scoped>
/* Estilos para la transición de mensajes */
.fade-in {
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos para la ventana */
.window-message {
  color: white;
  font-size: 1.2rem;
  text-align: center;
  animation: fadeIn 1s ease-in-out infinite alternate;
}

/* Grid de videos */
.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.video-tile {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100px;
  background-color: transparent;
  border: none;
  overflow: visible;
  transition: all 0.3s ease;
  z-index: 1;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-tile:hover {
  transform: scale(1.5);
  z-index: 100;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Contenedor del video */
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Video */
.video-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
  border-radius: 8px;
  position: relative;
  z-index: 1;
}

/* Marco de TV */
.tv-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  pointer-events: none;
  background: transparent;
  border: none;
  margin: 0;
  padding: 0;
  transform: scale(1.1);
}

.static-video {
  filter: contrast(1.2) brightness(1.1);
  animation: staticFlicker 0.2s infinite;
}

/* Estilos para el diálogo glitch */
.glitch-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  cursor: pointer;
  overflow: hidden;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

/* Prevent any default dialog from appearing */
.glitch-container:focus,
.glitch-container *:focus {
  outline: none !important;
  box-shadow: none !important;
}

.glitch-text {
  position: absolute;
  color: #fff;
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5em;
  text-align: center;
  animation: glitch 1s infinite;
  text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
              -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
}

.glitch-text-2 {
  animation: glitch-2 1s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-0.025em, -0.0125em);
  opacity: 0.8;
}

.glitch-text-3 {
  animation: glitch-3 1s infinite;
  clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
  transform: translate(0.0125em, 0.025em);
  opacity: 0.8;
}

.glitch-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    0deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  opacity: 0.1;
  pointer-events: none;
  animation: scanline 8s linear infinite;
}

@keyframes glitch {
  0% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                  0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                 -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
                  0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
                 -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                 0.05em 0 0 rgba(0, 255, 0, 0.75),
                 0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
                 0.05em 0 0 rgba(0, 255, 0, 0.75),
                 0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
                 -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
                 -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
}

@keyframes glitch-2 {
  0% { transform: translateX(0) translateY(0); }
  20% { transform: translateX(-0.05em) translateY(0.02em); }
  40% { transform: translateX(0.05em) translateY(-0.02em); }
  60% { transform: translateX(-0.05em) translateY(-0.02em); }
  80% { transform: translateX(0.05em) translateY(0.02em); }
  100% { transform: translateX(0) translateY(0); }
}

@keyframes glitch-3 {
  0% { transform: translateX(0) translateY(0); }
  20% { transform: translateX(0.05em) translateY(-0.02em); }
  40% { transform: translateX(-0.05em) translateY(0.02em); }
  60% { transform: translateX(0.05em) translateY(0.02em); }
  80% { transform: translateX(-0.05em) translateY(-0.02em); }
  100% { transform: translateX(0) translateY(0); }
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes staticFlicker {
  0% { opacity: 0.9; }
  50% { opacity: 1; }
  100% { opacity: 0.9; }
}

.instructions {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  padding: 15px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 100;
}

/* Responsive */
@media (max-width: 1024px) {
  .video-tile:hover {
    transform: scale(1.2);
    z-index: 10;
  }
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .video-tile:hover {
    transform: scale(1.3);
  }
  
  .window-frame {
    width: 90%;
    height: 50vh;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
    max-height: 80vh;
  }
  
  .video-tile {
    padding-bottom: 100%;
  }
  
  .video-tile:hover {
    transform: scale(1.2);
  }
  
  .window-frame {
    width: 95%;
    height: 40vh;
    border-width: 8px;
  }
}
</style>
