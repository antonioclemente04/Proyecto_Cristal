<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4 select-none overflow-hidden" @click="handleScreenClick" style="height: 100vh;">
    <!-- Fase de introducción -->
    <div v-if="!showGlass" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      <div class="text-white text-center max-w-2xl mx-auto p-8">
        <p class="text-lg leading-relaxed">{{ currentMessage }}</p>
      </div>
    </div>

    <!-- Mensaje final tras rotura en móvil -->
    <div v-if="showFinalMessage" class="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-4">
      <div class="text-white text-center">
        <p class="text-3xl md:text-5xl font-light mb-6">la identidad se fragmenta</p>
        <p class="text-gray-400 text-sm">Haz click para continuar</p>
      </div>
    </div>

    <!-- Fase del efecto de vidrio -->
    <div v-if="showGlass" class="glass-container">
      <!-- Mensajes de reflexión -->
      <div v-if="currentPhase === 'reflection' && !isMobileView" class="w-full max-w-2xl p-6 text-center" @click="nextMessage">
        <div class="text-white text-lg">
          <p>{{ reflectionMessages[currentMessageIndex] }}</p>
        </div>
      </div>
      
      <div class="w-full h-full flex flex-col items-center justify-center">
        <div v-if="showLight" class="celestial-light"></div>
        
        <div class="decorative-elements">
          <div 
            v-for="(emoji, index) in emojis" 
            :key="index" 
            class="floating-emoji"
            :style="getEmojiStyle(index)">
            {{ emoji }}
          </div>
        </div>
        
        <div class="glass-wrapper" :class="{ 'mobile-view': isMobileView }" @click="handleScreenClick">
          <div ref="glass" class="glass">
            <div class="camera-container">
              <video ref="videoRef" autoplay playsinline class="camera-feed select-none" draggable="false"></video>
              <img v-if="isMobileView" src="/images/Instagram.png" alt="Instagram Overlay" class="instagram-overlay select-none" draggable="false" />
              <img v-if="!isMobileView" src="/images/marco_espejo.png" alt="Marco del espejo" class="frame-overlay select-none" draggable="false" />
            </div>
          </div>
        </div>
        
        <div class="instructions select-none">
          Mueve el ratón para ver el efecto de refracción
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import VanillaTilt from 'vanilla-tilt'
import { gsap } from 'gsap'

// Sistema de mensajes
const introMessages = [
  "Los espejos en la antigüedad eran objetos opulentes y de caracter divino",
  "El bronce pulido del antiguo egipto era considerado un objeto ritual sagrado",
  "Un espejo veneciano podía llegar a costar más que un barco",
  "Y el hecho de poder verse reflejado en un espejo era un lujo que pocos se podian permitir",
]

const reflectionMessages = [
  "Antes, la gente podía pasar años sin ver su propio reflejo con claridad",
  "La individualidad y la autoimagen no eran tan importantes como ahora",
  "La obsesión por la imagen personal es algo muy reciente en la historia",
  "Y como cualquier cambio drástico",
  "Tiene consecuencias drásticas."
]

const currentMessageIndex = ref(0)
const showGlass = ref(false)
const showLight = ref(false)
const showMascot = ref(false)
const currentPhase = ref('intro') // 'intro' or 'reflection'
const isMobileView = ref(false) // Control for smartphone view
const showGlassContent = ref(false) // Control para mostrar el contenido del espejo
const isBroken = ref(false) // Control para el efecto de rotura
const fragments = ref([]) // Almacenará los fragmentos de la cámara
const showFinalMessage = ref(false) // Control para mostrar el mensaje final

// Asegurarse de que estamos en el estado inicial
onMounted(() => {
  currentMessageIndex.value = 0
  showGlass.value = false
  showLight.value = false
  showMascot.value = false
  currentPhase.value = 'intro'
  isMobileView.value = false
})

const messages = computed(() => {
  return currentPhase.value === 'intro' ? introMessages : reflectionMessages
})

const currentMessage = computed(() => messages.value[currentMessageIndex.value])
const isLastMessage = computed(() => currentMessageIndex.value === messages.value.length - 1)

const handleScreenClick = async () => {
  if (showFinalMessage.value) {
    // Navegar al index si se hace click en el mensaje final
    navigateTo('/')
    return
  }
  
  // Si ya estamos en modo móvil, permitir clics para avanzar mensajes
  if (isMobileView.value) {
    await nextMessage()
    return
  }
  
  if (currentPhase.value === 'intro' || currentPhase.value === 'reflection') {
    await nextMessage()
  }
}

const nextMessage = async () => {
  // Si estamos en la fase de introducción
  if (currentPhase.value === 'intro') {
    // Si es el último mensaje de la fase de introducción, iniciar efecto de vidrio
    if (currentMessageIndex.value >= introMessages.length - 1) {
      startGlassEffect()
      return
    }
    // Incrementar el índice del mensaje
    currentMessageIndex.value++
  } 
  // Si estamos en la fase de reflexión
  else if (currentPhase.value === 'reflection') {
    // Si es el último mensaje de reflexión, activar el modo móvil
    if (currentMessageIndex.value >= reflectionMessages.length - 1) {
      if (!isMobileView.value) {
        console.log('Activando modo móvil...')
        isMobileView.value = true
        
        // Iniciar la cámara si no está activa
        if (!stream) {
          await startCamera()
        }
      } else if (!isBroken.value) {
        // Si ya estamos en modo móvil y no se ha roto, romper la cámara
        breakCamera()
        isBroken.value = true
      }
      return
    }
    // Incrementar el índice del mensaje
    currentMessageIndex.value++
  }
}

const startReflectionPhase = async () => {
  currentPhase.value = 'reflection'
  currentMessageIndex.value = 0
  showMascot.value = true
  isMobileView.value = false
}

const startGlassEffect = async () => {
  showGlass.value = true
  showLight.value = true
  
  await new Promise(resolve => setTimeout(resolve, 100))
  initGlassEffect()
  
  setTimeout(() => {
    showLight.value = false
    startReflectionPhase()
  }, 1500)
}

// Referencias del DOM y estado de la cámara
const glass = ref(null)
const videoRef = ref(null)
let stream = null

// Iniciar la cámara
const startCamera = async () => {
  if (stream) return;
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        resizeMode: 'cover'
      },
      audio: false
    });
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play().catch(console.error);
    }
  } catch (err) {
    console.error('Error al acceder a la cámara:', err);
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

const updateCameraPosition = (tiltX, tiltY) => {
  if (!videoRef.value) return;
  const moveX = (tiltX / 15) * 10;
  const moveY = (tiltY / 15) * 10;
  videoRef.value.style.transform = `scaleX(-1) translate(${moveX}%, ${moveY}%)`;
};

const initGlassEffect = async () => {
  if (!glass.value) return;
  
  await startCamera();
  
  const tilt = VanillaTilt.init(glass.value, {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.2,
    gyroscope: true,
    scale: 1.05,
    'glare-prerender': false,
    onMove: (event, values) => updateCameraPosition(values.tiltX, values.tiltY)
  });
  
  window.addEventListener('resize', () => {
    if (glass.value?.vanillaTilt) {
      glass.value.vanillaTilt.destroy();
      VanillaTilt.init(glass.value, {
        max: 15,
        speed: 400,
        glare: true,
        'max-glare': 0.3,
        gyroscope: true,
        scale: 1.05
      });
    }
  });
  
  gsap.from('.glass', {
    scale: 0.5,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.7)'
  });
  
  gsap.to('.floating-emoji', {
    y: '+=20',
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    duration: () => 2 + Math.random() * 3
  });
};

// Función para romper la cámara en fragmentos
const breakCamera = () => {
  if (!videoRef.value) return;
  
  const container = document.querySelector('.camera-container');
  if (!container) return;
  
  // Mostrar mensaje final en móvil después de la animación
  if (isMobileView.value) {
    setTimeout(() => {
      showFinalMessage.value = true;
    }, 1500);
  }
  
  // Ocultar el video original
  videoRef.value.style.display = 'none';
  
  // Crear un canvas para capturar el fotograma actual del video
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
  
  // Tamaño de los fragmentos
  const fragmentSize = 100;
  const cols = Math.ceil(canvas.width / fragmentSize);
  const rows = Math.ceil(canvas.height / fragmentSize);
  
  // Crear fragmentos
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Crear un nuevo canvas para cada fragmento
      const fragmentCanvas = document.createElement('canvas');
      fragmentCanvas.width = fragmentSize;
      fragmentCanvas.height = fragmentSize;
      const fragmentCtx = fragmentCanvas.getContext('2d');
      
      // Extraer la porción de la imagen
      fragmentCtx.drawImage(
        canvas,
        x * fragmentSize, y * fragmentSize, fragmentSize, fragmentSize,
        0, 0, fragmentSize, fragmentSize
      );
      
      // Crear el elemento del fragmento
      const fragment = document.createElement('div');
      fragment.className = 'fragment';
      fragment.style.width = `${fragmentSize}px`;
      fragment.style.height = `${fragmentSize}px`;
      fragment.style.backgroundImage = `url(${fragmentCanvas.toDataURL()})`;
      fragment.style.backgroundSize = `${canvas.width}px ${canvas.height}px`;
      fragment.style.backgroundPosition = `-${x * fragmentSize}px -${y * fragmentSize}px`;
      fragment.style.position = 'absolute';
      fragment.style.left = `${x * fragmentSize}px`;
      fragment.style.top = `${y * fragmentSize}px`;
      
      // Hacer el fragmento arrastrable
      makeDraggable(fragment);
      
      // Añadir al DOM
      container.appendChild(fragment);
      
      // Animar la caída del fragmento
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const duration = 0.5 + Math.random() * 1;
      
      gsap.to(fragment, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: (Math.random() - 0.5) * 360,
        duration: duration,
        ease: 'power2.out'
      });
    }
  }
};

// Hacer un elemento arrastrable
const makeDraggable = (element) => {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // Obtener la posición del ratón al inicio del arrastre
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // Calcular la nueva posición
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Establecer la nueva posición del elemento
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Detener el movimiento al soltar el botón del ratón
    document.onmouseup = null;
    document.onmousemove = null;
  }
};

// Limpieza al desmontar
onBeforeUnmount(() => {
  stopCamera();
  
  if (glass.value?.vanillaTilt) {
    glass.value.vanillaTilt.destroy();
  }
})
</script>

<style scoped>
/* Deshabilitar selección de texto en toda la aplicación */
* {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Estándar */
  -webkit-tap-highlight-color: transparent;
}

/* Permitir selección solo en elementos de entrada de texto */
input,
textarea,
[contenteditable] {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

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
.glass-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 10;
  margin: 0;
  padding: 0;
}

.glass-wrapper {
  position: relative;
  width: 700px;
  height: 440px;
  z-index: 10;
  transform-style: preserve-3d;
  perspective: 1000px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  will-change: transform, width, height, border-radius;
  overflow: visible;
  flex-shrink: 0;
}

/* Smartphone view */
.glass-wrapper.mobile-view {
  width: 320px;
  height: 600px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 12px solid #222;
  position: relative;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Home indicator for smartphone */
.glass-wrapper.mobile-view::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}

.instagram-overlay {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
  max-width: none;
  object-fit: cover;
  pointer-events: none;
  z-index: 10;
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
  overflow: visible; /* Cambiado a visible para permitir que el marco se muestre fuera */
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1; /* Aseguramos que el contenedor esté por debajo del marco */
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
  width: 135%;
  height: 135%;
  min-width: 135%;
  min-height: 135%;
  pointer-events: none;
  z-index: 20;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.35);
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
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
