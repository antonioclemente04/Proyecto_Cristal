import { _ as __nuxt_component_0 } from "./client-only-B0I3jDGN.js";
import { computed, ref, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent } from "vue/server-renderer";
import { useRoute } from "vue-router";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/unctx/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/h3/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/radix3/dist/index.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/defu/dist/defu.mjs";
import "C:/Users/Antoño/Desktop/Glass_LAB/Proyecto_Cristal-Casi_todo/node_modules/ufo/dist/index.mjs";
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const isHomeRoute = computed(() => {
      if (route?.name === "index") return true;
      return false;
    });
    const showSplash = ref(true);
    const splineReady = ref(false);
    ref(null);
    ref(null);
    ref(null);
    ref([
      //{ id: 'glass-roman',     title: 'Vidrio Romano',    imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. I–III', href: '../glass/cristal-ciencia' },
      { id: "LA CREACIÓN", title: "LA CREACIÓN", imageSmall: "/images/warm.webp", image: "/images/warm.webp", century: "S. V–XV", href: "/glass/artesania-vs-industria" },
      //{ id: 'FRAGILIDAD',  title: 'FRAGILIDAD', imageSmall: '/images/bulet.webp', image: '/images/bullet.webp', century: 'S. XIII–XVII', href: '/glass/fragilidad-vs-resistencia' },
      { id: "ESCAPARATES", title: "ESCAPARATES", imageSmall: "/images/reloj-small.webp", image: "/images/adds.png", century: "S. XVIII", href: "/glass/escaparate" },
      { id: "ESPEJOS", title: "ESPEJOS", imageSmall: "/images/reloj-small.webp", image: "/images/mirror.jpg", century: "S. XIX", href: "/glass/espejo" },
      { id: "PANTALLAS", title: "PANTALLAS", imageSmall: "/images/reloj-small.webp", image: "/images/screen.png", century: "S. XX", href: "/glass/Pantallas" }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-screen w-screen bg-black text-white overflow-hidden" }, _attrs))} data-v-9aeda08a>`);
      if (showSplash.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center" data-v-9aeda08a><div class="w-full h-full relative" data-v-9aeda08a><div class="absolute inset-0 z-20 flex items-center justify-center" role="status" aria-live="polite" style="${ssrRenderStyle(!splineReady.value ? null : { display: "none" })}" data-v-9aeda08a><div class="w-10 h-10 border-4 border-white/20 rounded-full animate-spin" aria-hidden="true" data-v-9aeda08a></div><span class="sr-only" data-v-9aeda08a>Cargando escena…</span></div><div class="w-full h-full z-10" data-v-9aeda08a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10" data-v-9aeda08a><a href="/?nosplash=1" class="text-xs md:text-[1.3em] tracking-[0.06em] font-bold uppercase" data-v-9aeda08a>GLASS LAB®</a></header><div style="${ssrRenderStyle(!showSplash.value ? null : { display: "none" })}" data-v-9aeda08a>`);
      if (isHomeRoute.value) {
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="relative z-10" data-v-9aeda08a></main></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9aeda08a"]]);
export {
  index as default
};
//# sourceMappingURL=index-Bi9-ZcMj.js.map
