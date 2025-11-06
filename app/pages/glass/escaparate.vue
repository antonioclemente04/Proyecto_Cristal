<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4 select-none" @click="nextMessage">
    <!-- Mensaje actual -->
    <div class="w-full h-screen flex items-center justify-center cursor-pointer relative">
      <div class="text-white text-center max-w-2xl mx-auto p-8">
        <p class="text-lg leading-relaxed">{{ currentMessage }}</p>
        <p v-if="!isLastMessage && !showImagePanel && !showAdPanel" class="text-gray-400 text-sm mt-4">Haz click para continuar</p>
      </div>

      <!-- Estantería de productos -->
      <Transition name="fade">
        <div v-if="showImagePanel" class="absolute inset-0 p-4 md:p-8 bg-black bg-opacity-90 z-20 overflow-auto">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-2xl text-white mb-8 text-center">Nuestros Productos</h2>
            <div class="grid grid-cols-2 sm:grid-cols-2 gap-8 md:gap-12 justify-items-center">
              <div v-for="(product, index) in products" :key="index" 
                   class="relative group cursor-pointer w-36 md:w-48">
                <!-- Producto -->
                <div class="relative h-40 md:h-48 flex items-center justify-center p-4"
                     @click="selectProduct(product)">
                  <img :src="product.image" :alt="product.name" 
                       class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                
                <!-- Detalles al hacer click -->
                <Transition name="fade">
                  <div v-if="selectedProduct?.id === product.id" 
                       class="absolute inset-0 bg-black bg-opacity-80 rounded-lg p-4 flex flex-col justify-center items-center z-10"
                       @click.stop>
                    <h3 class="text-white font-bold text-center">{{ product.name }}</h3>
                    <p class="text-gray-300 text-sm text-center mt-1">{{ product.description }}</p>
                    <div class="mt-2 text-center">
                      <span class="text-yellow-400 font-bold">{{ product.price }}€</span>
                      <span class="text-xs text-gray-400 ml-2">• {{ product.stock }} disponibles</span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
            <div class="mt-8 text-center">
              <button @click.stop="handleImagePanelClick" class="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                Continuar
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón Volver fijo centrado -->
      <Transition name="fade">
        <div v-if="showVolverButton || showAdPanel" class="fixed inset-0 z-30 flex items-center justify-center">
          <button 
            @click.stop="addThreeAds"
            class="bg-white text-black font-bold py-4 px-8 rounded-full text-xl hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
        </div>
      </Transition>

      <!-- Panel de anuncios intrusivos -->
      <Transition name="fade">
        <div v-if="showAdPanel" class="fixed inset-0 bg-black bg-opacity-90 z-30 p-4 overflow-auto">
          <div class="relative w-full min-h-full">
            <!-- Anuncios generados dinámicamente -->
            <div 
              v-for="(ad, index) in activeAds" 
              :key="index"
              class="absolute bg-white rounded-lg shadow-xl overflow-hidden border-2"
              :class="getAdClass(index)"
              :style="getAdStyle(ad)"
              @click.stop="closeAd(ad.id)"
            >
              <div class="bg-blue-500 text-white p-2 flex justify-between items-center">
                <span class="text-sm font-bold">{{ ad.title }}</span>
                <button class="text-white hover:text-gray-200">✕</button>
              </div>
              <div class="p-4 bg-white flex-1 flex flex-col items-center justify-center">
                <div class="text-4xl mb-2">{{ ad.emoji }}</div>
                <p class="text-black text-sm text-center">{{ ad.text }}</p>
              </div>
            </div>

            <div v-if="adsFullyCovered" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center bg-black bg-opacity-80 p-8 rounded-xl">
                <p class="text-2xl text-white mb-4">¡Así es como la publicidad digital invade tu espacio!</p>
                <button 
                  @click.stop="resetAds"
                  class="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from '#app';

// Solo ejecutar en el lado del cliente
const isClient = process.client;

// Datos de productos
const products = [
  {
    id: 1,
    name: 'Espejo Antiguo',
    description: 'Espejito espejito...',
    price: 189.99,
    stock: 2,
    image: '/images/espejo_viejo.png'
  },
  {
    id: 2,
    name: 'Botella Antigua',
    description: 'Botella de vidrio soplado',
    price: 124.50,
    stock: 1,
    image: '/images/Botella_Antigua.png'
  },
  {
    id: 3,
    name: 'Televisor Antiguo',
    description: 'Televisor de tubo de los años 60',
    price: 100,
    stock: 1,
    image: '/images/tele_vieja.png'
  },
  {
    id: 4,
    name: 'Vidriera de Catedral',
    description: 'bueno... Puede que la hayamos robado',
    price: 99999,
    stock: 1,
    image: '/images/vidriera.png'  // Asumiendo que esta es la imagen de la vidriera
  }
];

// Lista de imágenes disponibles
const availableImages = [
  '/images/serbepsa.png',
  '/images/.png',
  '/images/marco_espejo.png',
  '/images/vidriera.png'
];

// Anuncios para el popup
const adTemplates = [
  { emoji: '🛍️', title: '¡Oferta Especial!', text: '50% de descuento solo hoy' },
  { emoji: '🎯', title: '¡Ganaste!', text: 'Haz clic para reclamar tu premio' },
  { emoji: '📱', title: 'Actualización requerida', text: 'Tu dispositivo está en riesgo' },
  { emoji: '💰', title: '¡Gana dinero fácil!', text: 'Gana 1000€ al día desde casa' },
  { emoji: '🔔', title: 'Notificación', text: 'Tienes 3 mensajes sin leer' },
  { emoji: '🎁', title: '¡Regalo para ti!', text: 'Abre para reclamar tu premio' },
  { emoji: '⚠️', title: 'Alerta de seguridad', text: 'Tu cuenta ha sido comprometida' },
  { emoji: '👥', title: 'Nuevos seguidores', text: 'A 5 personas les gustas' }
];

const messages = [
  "La publicidad siempre ha sido una parte importante de la sociedad",
  "En el pasado, los escaparates eran simples cristales que separaban al comprador del producto",
  "La publicidad tradicional respetaba los límites del espacio personal",
  "showImagePanel",
  "Había una comunicación bidireccional, más personal con lo que se observaba",
  "La televisión ya trajo consigo una drástica invasión de la publicidad en nuestras vidas",
  "Pero internet fue lo que hizo que nosotros nos convirtieramos en el producto",
  "showVolverButton"
];

const currentMessageIndex = ref(0);
const showImagePanel = ref(false);
const showVolverButton = ref(false);
const showAdPanel = ref(false);
const activeAds = ref([]);
const adsFullyCovered = ref(false);
const randomImage = ref('');
const selectedProduct = ref(null);
let adInterval = null;
let adCounter = 0;

const currentMessage = computed(() => {
  const message = messages[currentMessageIndex.value];
  if (message === 'showImagePanel') {
    showImagePanel.value = true;
    randomImage.value = getRandomImage();
    return '';
  } else if (message === 'showVolverButton') {
    showVolverButton.value = true;
    return '';
  } else if (message === 'showAdPanel') {
    showVolverButton.value = false;
    showAdPanel.value = true;
    return '';
  }
  return message;
});

const isLastMessage = computed(() => currentMessageIndex.value === messages.length - 1);

const nextMessage = () => {
  // Si ya estamos mostrando anuncios o el panel de imagen, no hacer nada
  if (showImagePanel.value || showAdPanel.value) return;
  
  // Si el siguiente mensaje es showAdPanel, mostrarlo pero no avanzar más
  if (messages[currentMessageIndex.value + 1] === 'showAdPanel') {
    currentMessageIndex.value++;
    return;
  }
  
  // Avanzar al siguiente mensaje si no es el último
  if (currentMessageIndex.value < messages.length - 1) {
    currentMessageIndex.value++;
  }
};

// Obtener una imagen aleatoria de las disponibles
const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * availableImages.length);
  return availableImages[randomIndex];
};

const selectProduct = (product) => {
  selectedProduct.value = selectedProduct.value?.id === product.id ? null : product;
};

const handleImagePanelClick = (event) => {
  // Solo cerrar si no se hizo clic en un producto
  if (!event.target.closest('.group')) {
    showImagePanel.value = false;
    selectedProduct.value = null;
    nextMessage();
  }
};

// Función para añadir 3 anuncios nuevos
const addThreeAds = () => {
  // Mostrar el panel de anuncios si no está visible
  if (!showAdPanel.value) {
    showAdPanel.value = true;
    showImagePanel.value = false;
    currentMessageIndex.value = messages.length - 1;
  }
  
  // Asegurarse de que no se exceda el límite de 35 anuncios
  const adsToAdd = Math.min(3, 35 - adCounter);
  
  // Agregar los anuncios
  for (let i = 0; i < adsToAdd; i++) {
    addRandomAd();
    adCounter++;
    checkAdLimit();
  }
};

// Mostrar más anuncios (compatibilidad con código existente)
const showMoreAds = addThreeAds;

// Iniciar la invasión de anuncios
const startAdInvasion = () => {
  // Limpiar cualquier intervalo existente
  if (adInterval) clearInterval(adInterval);
  
  // Mostrar el panel de anuncios y ocultar otros elementos
  showVolverButton.value = true;
  showAdPanel.value = true;
  showImagePanel.value = false;
  
  // Detener cualquier mensaje actual
  currentMessageIndex.value = messages.length - 1;
  
  // Agregar los primeros 3 anuncios
  showMoreAds();
};

// Verificar si se alcanzó el límite de anuncios
const checkAdLimit = () => {
  if (adCounter >= 35) {
    clearInterval(adInterval);
    setTimeout(() => {
      alert('El navegador ha dejado de responder. La página se recargará.');
      window.location.href = '/';
    }, 500);
  }
};

// Agregar un anuncio aleatorio
const addRandomAd = () => {
  const template = adTemplates[Math.floor(Math.random() * adTemplates.length)];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Tamaño aleatorio pero con un mínimo y máximo razonable
  const width = 200 + (Math.random() * 150);
  const height = 150 + (Math.random() * 100);
  
  // Posición aleatoria asegurando que quepa en la pantalla
  const maxX = Math.max(0, viewportWidth - width - 20);
  const maxY = Math.max(0, viewportHeight - height - 20);
  
  const newAd = {
    id: Date.now() + Math.random(),
    ...template,
    x: Math.random() * maxX,
    y: Math.random() * maxY,
    width: width,
    height: height
  };
  
  // Evitar superposiciones excesivas
  const maxAttempts = 50;
  let attempts = 0;
  let positionIsValid = false;
  
  while (!positionIsValid && attempts < maxAttempts) {
    positionIsValid = true;
    
    // Verificar superposición con anuncios existentes
    for (const existingAd of activeAds.value) {
      if (isOverlapping(newAd, existingAd)) {
        newAd.x = Math.random() * maxX;
        newAd.y = Math.random() * maxY;
        positionIsValid = false;
        attempts++;
        break;
      }
    }
  }
  
  activeAds.value.push(newAd);
};

// Verificar si dos anuncios se superponen
const isOverlapping = (ad1, ad2) => {
  return !(
    ad1.x + ad1.width < ad2.x ||
    ad1.x > ad2.x + ad2.width ||
    ad1.y + ad1.height < ad2.y ||
    ad1.y > ad2.y + ad2.height
  );
};

// Cerrar un anuncio específico
const closeAd = (id) => {
  // Eliminar el anuncio cerrado
  activeAds.value = activeAds.value.filter(ad => ad.id !== id);
  
  // Añadir 3 anuncios nuevos al cerrar uno
  if (showAdPanel.value && adCounter < 35) {
    addThreeAds();
  }
};

// Reiniciar los anuncios
const resetAds = () => {
  // No permitir reiniciar, siempre redirigir al index
  window.location.href = '/';
};

// Obtener clase CSS para el anuncio
const getAdClass = (index) => {
  const colors = ['border-red-400', 'border-blue-400', 'border-green-400', 'border-yellow-400', 'border-purple-400'];
  return colors[index % colors.length];
};

// Obtener estilo para el anuncio
const getAdStyle = (ad) => {
  if (!process.client) return {}; // Retornar objeto vacío durante SSR
  
  return {
    left: `${ad.x}px`,
    top: `${ad.y}px`,
    width: `${ad.width}px`,
    height: `${ad.height}px`,
    opacity: 0.9,
    position: 'fixed',
    zIndex: 50,
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };
};

// Limpiar intervalos al desmontar el componente
onUnmounted(() => {
  if (process.client && adInterval) {
    clearInterval(adInterval);
  }
});

// Inicialización segura para SSR
onMounted(() => {
  if (!process.client) return;
  
  // Cualquier inicialización que necesite el objeto window o document
  // se puede hacer aquí de manera segura
});

// Animar la entrada de los mensajes
onMounted(() => {
  currentMessageIndex.value = 0;
});

// Datos para la demostración interactiva
const targetedAds = ref([
  { emoji: '🛍️', text: 'Ofertas en tu tienda favorita' },
  { emoji: '✈️', text: 'Vuelos a destinos buscados' },
  { emoji: '📱', text: 'El último smartphone' },
  { emoji: '👟', text: 'Zapatillas que viste' }
]);
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

/* Transiciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Estilos generales */
body {
  transition: color 0.2s;
}

.prose a:hover {
  color: #6366f1;
  text-decoration: underline;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
}

.aspect-w-16 img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
