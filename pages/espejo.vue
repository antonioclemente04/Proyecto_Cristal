<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <!-- Fase de introducción -->
    <div v-if="!showGlass" @click="nextMessage" class="w-full">
      <div class="max-w-6xl w-full mx-auto flex flex-col items-center justify-center">
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
            <p class="mb-4 text-fade-in">{{ currentMessage }}</p>
            
            <!-- Indicador de click si no es el último diálogo -->
            <div v-if="!isLastMessage" class="text-right text-sm text-gray-400 italic animate-pulse">
              Haz click para continuar...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fase del efecto de vidrio -->
    <div v-else class="glass-container w-full h-full" @click="handleScreenClick">
      <!-- Mascota flotante -->
      <div v-if="showMascot" class="mascot-float">
        <img 
          src="/images/serbepsa.png" 
          alt="Mascota" 
          class="w-24 h-24 object-contain floating"
        />
        <div class="speech-bubble">
          {{ currentMessage }}
          <div v-if="!isLastMessage" class="text-right text-xs text-gray-400 italic mt-2">
            Haz click para continuar...
          </div>
        </div>
      </div>

      <div v-if="showLight" class="celestial-light"></div>
      
      <div class="decorative-elements">
        <div v-for="(emoji, index) in emojis" 
             :key="index" 
             class="floating-emoji"
             :style="getEmojiStyle(index)">
          {{ emoji }}
        </div>
      </div>
      
      <div class="glass-wrapper">
        <div ref="glass" class="glass">
          <div class="camera-container">
            <video ref="videoRef" autoplay playsinline class="camera-feed"></video>
          </div>
          <img src="/images/marco_espejo.png" alt="Marco del espejo" class="frame-overlay" />
        </div>
      </div>
      
      <div class="instructions">
        Mueve el ratón para ver el efecto de refracción
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, onBeforeUnmount } from 'vue'
import VanillaTilt from 'vanilla-tilt'
import { gsap } from 'gsap'

// Sistema de mensajes
const introMessages = [
  "Los espejos en la antigüedad eran objetos de lujo y poder...",
  "Fabricados con metales preciosos pulidos, solo estaban al alcance de las élites...",
  "Su capacidad de reflejar la realidad los convertía en objetos mágicos y sagrados...",
  "Hoy, los espejos son comunes, pero su historia sigue siendo fascinante..."
]

const reflectionMessages = [
  "Antes, la gente podía pasar años sin ver su propio reflejo con claridad...",
  "La individualidad y la autoimagen no eran tan importantes como ahora...",
  "Hoy nos miramos constantemente, pero antes, tu reflejo era un extraño...",
  "La obsesión por la imagen personal es algo muy reciente en la historia...",
  "Y obviamente, tiene consecuencias...",
]

const currentMessageIndex = ref(0)
const showGlass = ref(false)
const showLight = ref(false)
const showMascot = ref(false)
const currentPhase = ref('intro') // 'intro' or 'reflection'

const messages = computed(() => {
  return currentPhase.value === 'intro' ? introMessages : reflectionMessages
})

const currentMessage = computed(() => messages.value[currentMessageIndex.value])
const isLastMessage = computed(() => currentMessageIndex.value === messages.value.length - 1)

const handleScreenClick = () => {
  if (!showGlass.value) {
    // Si estamos en la fase de introducción
    nextMessage()
  } else if (showMascot.value) {
    // Si estamos en la fase de reflexión
    if (currentMessageIndex.value < messages.value.length - 1) {
      currentMessageIndex.value++
    } else {
      // Opcional: reiniciar los mensajes o hacer otra acción
      // currentMessageIndex.value = 0
    }
  }
}

const nextMessage = () => {
  if (currentMessageIndex.value < messages.value.length - 1) {
    currentMessageIndex.value++
  } else {
    startGlassEffect()
  }
}

const startReflectionPhase = () => {
  currentPhase.value = 'reflection'
  currentMessageIndex.value = 0
  showMascot.value = true
}

const startGlassEffect = async () => {
  if (currentMessageIndex.value < messages.value.length - 1) {
    nextMessage()
  } else if (currentPhase.value === 'intro') {
    showGlass.value = true
    showLight.value = true
    await nextTick()
    initGlassEffect()
    // Ocultar la luz celestial después de 1.5 segundos
    setTimeout(() => {
      showLight.value = false
      startReflectionPhase()
    }, 1500)
  } else {
    // Continuar con los mensajes de reflexión
    if (currentMessageIndex.value < messages.value.length - 1) {
      currentMessageIndex.value++
    }
  }
}

// Sistema de efectos de vidrio
const glass = ref(null)
const videoRef = ref(null)
let stream = null


// Iniciar la cámara
const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 },
        resizeMode: 'crop-and-scale'
      },
      audio: false
    });
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (err) {
    console.error('Error al acceder a la cámara:', err);
    // Mostrar imagen de respaldo si la cámara falla
    if (glass.value) {
      glass.value.style.backgroundImage = 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80)';
    }
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  }
};

// Función para actualizar la posición de la cámara basada en la inclinación
const updateCameraPosition = (tiltX, tiltY) => {
  if (!videoRef.value) return;
  
  // Calcular el desplazamiento basado en la inclinación
  const moveX = (tiltX / 15) * 10; // Ajustar el rango de movimiento
  const moveY = (tiltY / 15) * 10;
  
  // Aplicar el desplazamiento
  videoRef.value.style.transform = `scaleX(-1) translate(${moveX}%, ${moveY}%)`;
};

const initGlassEffect = async () => {
  if (glass.value) {
    // Iniciar la cámara
    await startCamera();
    
    // Configuración del efecto de inclinación
    const tilt = VanillaTilt.init(glass.value, {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.2,
      gyroscope: true,
      scale: 1.05,
      'glare-prerender': false,
      onMove: (event, values) => {
        updateCameraPosition(values.tiltX, values.tiltY);
      }
    });
    
    // Desactivar el efecto de movimiento del ratón ya que usamos la cámara en tiempo real
    
    // Asegurarse de que el efecto de inclinación se actualice correctamente
    window.addEventListener('resize', () => {
      if (glass.value && glass.value.vanillaTilt) {
        glass.value.vanillaTilt.destroy()
        VanillaTilt.init(glass.value, {
          max: 15,
          speed: 400,
          glare: true,
          'max-glare': 0.3,
          gyroscope: true,
          scale: 1.05
        })
      }
    })
  }
  
  // Animación de entrada del vidrio
  gsap.from('.glass', {
    scale: 0.5,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.7)'
  })
  
  // Animación de los emojis
  gsap.to('.floating-emoji', {
    y: '+=20',
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    duration: () => 2 + Math.random() * 3
  })
}

// Limpieza al desmontar
onBeforeUnmount(() => {
  stopCamera();
  
  if (glass.value && glass.value.vanillaTilt) {
    glass.value.vanillaTilt.destroy();
  }
})
</script>

<style scoped>
.espejo-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  color: white;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
  position: relative;
}

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

/* Contenedor principal */
.min-h-screen {
  min-height: 100vh;
  width: 100%;
}

/* Mascota flotante */
.mascot-float {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 200px;
}

.mascot-float .speech-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  border-radius: 12px;
  padding: 12px;
  margin-top: 10px;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: fadeIn 0.5s ease-out;
}

.mascot-float .speech-bubble:after {
  content: '';
  position: absolute;
  top: -10px;
  right: 20px;
  border-width: 0 10px 10px 10px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.9) transparent;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos del efecto de vidrio */
.glass-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.glass-wrapper {
  position: relative;
  width: 800px;  /* Aumentado a 800px de ancho */
  height: 500px;  /* Altura ajustada para mantener proporción */
  z-index: 10;
  transform-style: preserve-3d;
  perspective: 1000px;
  margin: 2rem auto;  /* Añadido margen superior e inferior */
  display: flex;
  justify-content: center;
  align-items: center;
}

.glass {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  transform-style: preserve-3d;
  position: relative;
  overflow: visible;  /* Cambiado a visible para que el marco se muestre correctamente */
  transition: all 0.3s ease;
  transform: perspective(1000px);
  background: #000;
}

.camera-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
}

.glass .camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  filter: contrast(1.1) saturate(1.1);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  will-change: transform;
  display: block;
  position: relative;
  z-index: 1;
}

.frame-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  max-height: 100%;
  pointer-events: none;
  z-index: 10;
}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(0, 0, 0, 0.05) 0%, 
      rgba(255, 255, 255, 0.03) 50%, 
      rgba(0, 0, 0, 0.05) 100%
    );
    backdrop-filter: blur(2px);
}

/* Efecto de luz celestial */
.celestial-light {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  animation: celestialLight 2s ease-out forwards;
}

@keyframes celestialLight {
  0% { 
    opacity: 0;
    transform: scale(0.5);
  }
  10% { 
    opacity: 0.8;
    transform: scale(1.2);
  }
  100% { 
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Elementos decorativos */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-emoji {
  position: absolute;
  font-size: var(--size, 40px);
  user-select: none;
  animation: 
    float-vertical var(--duration, 3s) ease-in-out infinite,
    float-horizontal calc(var(--duration, 3s) * 1.5) ease-in-out infinite;
  filter: drop-shadow(0 0 10px currentColor);
  opacity: 0;
  animation-fill-mode: both;
  animation-delay: var(--delay, 0s);
}

.instructions {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  animation: fadeIn 1s ease-out 1s both;
}

/* Animaciones */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes float-vertical {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}

@keyframes float-horizontal {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
