import { ref, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from "vue/server-renderer";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import "./client-only-B0I3jDGN.js";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/klona/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/defu/dist/defu.mjs";
import "#internal/nuxt/paths";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ofetch/dist/node.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/unctx/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/radix3/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ufo/dist/index.mjs";
const _sfc_main = {
  __name: "escaparate",
  __ssrInlineRender: true,
  setup(__props) {
    const products = [
      {
        id: 1,
        name: "Espejo Antiguo",
        description: "Espejito espejito...",
        price: 189.99,
        stock: 2,
        image: "/images/espejo_viejo.png"
      },
      {
        id: 2,
        name: "Botella Antigua",
        description: "Botella de vidrio soplado",
        price: 124.5,
        stock: 1,
        image: "/images/Botella_Antigua.png"
      },
      {
        id: 3,
        name: "Televisor Antiguo",
        description: "Televisor de tubo de los años 60",
        price: 100,
        stock: 1,
        image: "/images/tele_vieja.png"
      },
      {
        id: 4,
        name: "Vidriera de Catedral",
        description: "bueno... Puede que la hayamos robado",
        price: 99999,
        stock: 1,
        image: "/images/vidriera.png"
        // Asumiendo que esta es la imagen de la vidriera
      }
    ];
    const availableImages = [
      "/images/serbepsa.png",
      "/images/.png",
      "/images/marco_espejo.png",
      "/images/vidriera.png"
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
    const randomImage = ref("");
    const selectedProduct = ref(null);
    const currentMessage = computed(() => {
      const message = messages[currentMessageIndex.value];
      if (message === "showImagePanel") {
        showImagePanel.value = true;
        randomImage.value = getRandomImage();
        return "";
      } else if (message === "showVolverButton") {
        showVolverButton.value = true;
        return "";
      } else if (message === "showAdPanel") {
        showVolverButton.value = false;
        showAdPanel.value = true;
        return "";
      }
      return message;
    });
    const isLastMessage = computed(() => currentMessageIndex.value === messages.length - 1);
    const getRandomImage = () => {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      return availableImages[randomIndex];
    };
    const getAdClass = (index) => {
      const colors = ["border-red-400", "border-blue-400", "border-green-400", "border-yellow-400", "border-purple-400"];
      return colors[index % colors.length];
    };
    const getAdStyle = (ad) => {
      return {};
    };
    ref([
      { emoji: "🛍️", text: "Ofertas en tu tienda favorita" },
      { emoji: "✈️", text: "Vuelos a destinos buscados" },
      { emoji: "📱", text: "El último smartphone" },
      { emoji: "👟", text: "Zapatillas que viste" }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-black flex items-center justify-center p-4 select-none" }, _attrs))} data-v-3d902218><div class="w-full h-screen flex items-center justify-center cursor-pointer relative" data-v-3d902218><div class="text-white text-center max-w-2xl mx-auto p-8" data-v-3d902218><p class="text-lg leading-relaxed" data-v-3d902218>${ssrInterpolate(currentMessage.value)}</p>`);
      if (!isLastMessage.value && !showImagePanel.value && !showAdPanel.value) {
        _push(`<p class="text-gray-400 text-sm mt-4" data-v-3d902218>Haz click para continuar</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (showImagePanel.value) {
        _push(`<div class="absolute inset-0 p-4 md:p-8 bg-black bg-opacity-90 z-20 overflow-auto" data-v-3d902218><div class="max-w-4xl mx-auto" data-v-3d902218><h2 class="text-2xl text-white mb-8 text-center" data-v-3d902218>Nuestros Productos</h2><div class="grid grid-cols-2 sm:grid-cols-2 gap-8 md:gap-12 justify-items-center" data-v-3d902218><!--[-->`);
        ssrRenderList(products, (product, index) => {
          _push(`<div class="relative group cursor-pointer w-36 md:w-48" data-v-3d902218><div class="relative h-40 md:h-48 flex items-center justify-center p-4" data-v-3d902218><img${ssrRenderAttr("src", product.image)}${ssrRenderAttr("alt", product.name)} class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" data-v-3d902218></div>`);
          if (selectedProduct.value?.id === product.id) {
            _push(`<div class="absolute inset-0 bg-black bg-opacity-80 rounded-lg p-4 flex flex-col justify-center items-center z-10" data-v-3d902218><h3 class="text-white font-bold text-center" data-v-3d902218>${ssrInterpolate(product.name)}</h3><p class="text-gray-300 text-sm text-center mt-1" data-v-3d902218>${ssrInterpolate(product.description)}</p><div class="mt-2 text-center" data-v-3d902218><span class="text-yellow-400 font-bold" data-v-3d902218>${ssrInterpolate(product.price)}€</span><span class="text-xs text-gray-400 ml-2" data-v-3d902218>• ${ssrInterpolate(product.stock)} disponibles</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="mt-8 text-center" data-v-3d902218><button class="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors" data-v-3d902218> Continuar </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showVolverButton.value || showAdPanel.value) {
        _push(`<div class="fixed inset-0 z-30 flex items-center justify-center" data-v-3d902218><button class="bg-white text-black font-bold py-4 px-8 rounded-full text-xl hover:bg-gray-200 transition-colors" data-v-3d902218> Volver </button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showAdPanel.value) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-90 z-30 p-4 overflow-auto" data-v-3d902218><div class="relative w-full min-h-full" data-v-3d902218><!--[-->`);
        ssrRenderList(activeAds.value, (ad, index) => {
          _push(`<div class="${ssrRenderClass([getAdClass(index), "absolute bg-white rounded-lg shadow-xl overflow-hidden border-2"])}" style="${ssrRenderStyle(getAdStyle())}" data-v-3d902218><div class="bg-blue-500 text-white p-2 flex justify-between items-center" data-v-3d902218><span class="text-sm font-bold" data-v-3d902218>${ssrInterpolate(ad.title)}</span><button class="text-white hover:text-gray-200" data-v-3d902218>✕</button></div><div class="p-4 bg-white flex-1 flex flex-col items-center justify-center" data-v-3d902218><div class="text-4xl mb-2" data-v-3d902218>${ssrInterpolate(ad.emoji)}</div><p class="text-black text-sm text-center" data-v-3d902218>${ssrInterpolate(ad.text)}</p></div></div>`);
        });
        _push(`<!--]-->`);
        if (adsFullyCovered.value) {
          _push(`<div class="absolute inset-0 flex items-center justify-center" data-v-3d902218><div class="text-center bg-black bg-opacity-80 p-8 rounded-xl" data-v-3d902218><p class="text-2xl text-white mb-4" data-v-3d902218>¡Así es como la publicidad digital invade tu espacio!</p><button class="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors" data-v-3d902218> Continuar </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/glass/escaparate.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const escaparate = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3d902218"]]);
export {
  escaparate as default
};
//# sourceMappingURL=escaparate-Bzn2A07R.js.map
