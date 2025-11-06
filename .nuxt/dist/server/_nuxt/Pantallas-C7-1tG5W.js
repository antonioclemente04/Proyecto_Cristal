import { ref, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { publicAssetsURL } from "#internal/nuxt/paths";
import { useRouter } from "vue-router";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ofetch/dist/node.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/unctx/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/h3/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/radix3/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/defu/dist/defu.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ufo/dist/index.mjs";
const _imports_0 = publicAssetsURL("/images/iglesia.mp4");
const _imports_1 = publicAssetsURL("/images/estática.mp4");
const _imports_2 = publicAssetsURL("/images/marco-tv.png");
const _sfc_main = {
  __name: "Pantallas",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const showWindowFrame = ref(true);
    const showGrid = ref(false);
    const showDialog = ref(false);
    const currentDialogIndex = ref(0);
    const showStatic = ref(Array(8).fill(false));
    ref(false);
    ref(null);
    ref(null);
    const dialogMessages = [
      "nada de esto es real",
      "despierta",
      "la vida está ahí fuera"
    ];
    const currentDialogMessage = computed(() => dialogMessages[currentDialogIndex.value]);
    const videos = [
      { src: "/images/Bacon.mp4" },
      { src: "/images/conferencia.mp4" },
      { src: "/images/Fireworks.mp4" },
      { src: "/images/Fuego.mp4" },
      { src: "/images/Gaviota.mp4" },
      { src: "/images/gente.mp4" },
      { src: "/images/Tenis.mp4" },
      { src: "/images/Volcan.mp4" }
    ];
    const introMessages = [
      "Antes, el vidrio nos permitía ver el mundo a través de las ventanas...",
      "Las imponentes catedrales nos muestran como una ventana era capaz de embellecer la realidad",
      "En el pasado se exploraron nuevas formas de mirar a través",
      "Y aquello ha evolucionado hasta convertirse en lo que conocemos hoy como pantallas..."
    ];
    const reflectionMessages = [
      "Cada pantalla es un fragmento de realidad...",
      "Nuestra atención se divide entre múltiples ventanas...",
      "El mundo se ha vuelto una red de pantallas interconectadas...",
      "¿Dónde termina la realidad y dónde comienza la representación?"
    ];
    const currentMessageIndex = ref(0);
    const showMessage = ref(true);
    ref(false);
    const currentPhase = ref("intro");
    const messages = computed(() => {
      return currentPhase.value === "intro" ? introMessages : reflectionMessages;
    });
    const currentMessage = computed(() => showMessage.value ? messages.value[currentMessageIndex.value] : "");
    computed(() => currentMessageIndex.value === messages.value.length - 1);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-screen bg-black select-none overflow-hidden" }, _attrs))} data-v-b0cdd0e1>`);
      if (showWindowFrame.value && !showGrid.value) {
        _push(`<div class="fixed inset-0 z-0" data-v-b0cdd0e1><video autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-cover"${ssrRenderAttr("src", _imports_0)} data-v-b0cdd0e1></video><div class="absolute inset-0 bg-black bg-opacity-30" data-v-b0cdd0e1></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!showGrid.value) {
        _push(`<div class="relative z-10 w-full min-h-screen flex items-center justify-center p-4 cursor-pointer" data-v-b0cdd0e1><div class="max-w-4xl w-full px-4 text-center" data-v-b0cdd0e1><div class="text-white text-lg md:text-xl leading-relaxed min-h-[200px] flex flex-col justify-center" data-v-b0cdd0e1><p class="mb-4 fade-in" data-v-b0cdd0e1>${ssrInterpolate(currentMessage.value)}</p></div>`);
        if (_ctx.windowMessage) {
          _push(`<div class="window-message mt-8 text-white text-lg" data-v-b0cdd0e1>${ssrInterpolate(_ctx.windowMessage)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showGrid.value) {
        _push(`<div class="w-screen h-screen fixed top-0 left-0 flex items-center justify-center p-4" data-v-b0cdd0e1><div class="video-grid" data-v-b0cdd0e1><!--[-->`);
        ssrRenderList(videos.slice(0, 8), (video, index) => {
          _push(`<div class="video-tile" data-v-b0cdd0e1><div class="video-container" data-v-b0cdd0e1>`);
          if (!showStatic.value[index]) {
            _push(`<video${ssrRenderAttr("src", video.src)} autoplay loop muted playsinline class="video-content" data-v-b0cdd0e1></video>`);
          } else {
            _push(`<video${ssrRenderAttr("src", _imports_1)} autoplay loop muted playsinline class="video-content static-video" data-v-b0cdd0e1></video>`);
          }
          _push(`<img${ssrRenderAttr("src", _imports_2)} alt="TV Frame" class="tv-frame" data-v-b0cdd0e1></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showDialog.value) {
        _push(`<div class="glitch-container" data-v-b0cdd0e1><div class="glitch-text" data-v-b0cdd0e1>${ssrInterpolate(currentDialogMessage.value)}</div><div class="glitch-text glitch-text-2" data-v-b0cdd0e1>${ssrInterpolate(currentDialogMessage.value)}</div><div class="glitch-text glitch-text-3" data-v-b0cdd0e1>${ssrInterpolate(currentDialogMessage.value)}</div><div class="glitch-overlay" data-v-b0cdd0e1></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/glass/Pantallas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Pantallas = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b0cdd0e1"]]);
export {
  Pantallas as default
};
//# sourceMappingURL=Pantallas-C7-1tG5W.js.map
