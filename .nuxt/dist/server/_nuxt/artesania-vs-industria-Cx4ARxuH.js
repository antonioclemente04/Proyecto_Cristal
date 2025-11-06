import { ref, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
import { publicAssetsURL } from "#internal/nuxt/paths";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _imports_0 = publicAssetsURL("/images/furnace.webp");
const _imports_1 = publicAssetsURL("/images/bodies.webp");
const _imports_2 = publicAssetsURL("/images/mouth.webp");
const _imports_3 = publicAssetsURL("/images/blobs.webp");
const _imports_4 = publicAssetsURL("/images/corazon.webp");
const _imports_5 = publicAssetsURL("/images/gota.webp");
const _imports_6 = publicAssetsURL("/images/naturaleza.jpg");
const _imports_7 = publicAssetsURL("/images/tubo.webp");
const _imports_8 = publicAssetsURL("/images/aura.webp");
const _imports_9 = publicAssetsURL("/images/chips.gif");
const _sfc_main = {
  __name: "artesania-vs-industria",
  __ssrInlineRender: true,
  setup(__props) {
    const mounted = ref(false);
    const isOpen = ref(false);
    const activeImageSrc = ref("");
    const activeImageAlt = ref("");
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative artesania-industria min-h-screen bg-red-900 text-white" }, _attrs))} data-v-cb00f61e><header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between z-10" data-v-cb00f61e><a href="/?nosplash=1" class="text-xs md:text-[1.3em] font-bold uppercase" data-v-cb00f61e>GLASS LAB®</a></header><main class="relative z-10 px-6 md:px-12 max-w-5xl mx-auto" data-v-cb00f61e><section class="min-h-[calc(108dvh-64px)] flex items-center justify-center hero-section relative left-1/2 -translate-x-1/2 w-screen" data-v-cb00f61e>`);
      if (mounted.value) {
        _push(`<div id="hydra-hero" data-v-cb00f61e></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="relative z-[10] text-white text-sm font-semibold md:text-base" data-v-cb00f61e>SOPLA EL VIDRIO</span></section><div class="relative left-1/2 -translate-x-1/2 w-screen" data-v-cb00f61e>`);
      if (mounted.value) {
        _push(`<div id="hydra-bg" data-v-cb00f61e></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="mt-0 mb-0 relative left-1/2 -translate-x-1/2 w-screen px-0 md:px-0" data-v-cb00f61e><div class="columns-1 md:columns-2 gap-x-0 relative z-[1]" data-v-cb00f61e><div class="break-inside-avoid" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_0)} alt="cristal 1" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_1)} alt="cristal 2" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_2)} alt="warm" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_3)} alt="warm 2" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div></div></section><section class="relative left-1/2 -translate-x-1/2 w-screen py-24 px-0" data-v-cb00f61e><div class="full-width-title" aria-hidden="false" data-v-cb00f61e><h2 class="never-felt" role="heading" aria-level="2" data-v-cb00f61e> NEVER FELT </h2></div></section><section class="mt-8 mb-0 relative left-1/2 -translate-x-1/2 w-screen px-0 md:px-0" data-v-cb00f61e><div class="columns-1 md:columns-2 gap-x-12 relative z-[1]" data-v-cb00f61e><div class="break-inside-avoid p-8 pt-20" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_4)} alt="corazon" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid p-10 pb-10" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_5)} alt="gota" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid p-8 pt-24" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_6)} alt="naturaleza" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid p-8 pt-16" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_7)} alt="tubo" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid p-10 pt-20" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_8)} alt="aura" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div><div class="break-inside-avoid p-10 pt-24" data-v-cb00f61e><img${ssrRenderAttr("src", _imports_9)} alt="chip" loading="lazy" class="w-full h-auto block clickable-image" data-v-cb00f61e></div></div></section></div>`);
      if (isOpen.value) {
        _push(`<div class="lightbox-overlay" role="dialog" aria-modal="true"${ssrRenderAttr("aria-label", activeImageAlt.value || "Imagen ampliada")} data-v-cb00f61e><img${ssrRenderAttr("src", activeImageSrc.value)}${ssrRenderAttr("alt", activeImageAlt.value)} class="lightbox-image zoom-in" tabindex="0" data-v-cb00f61e>`);
        if (activeImageAlt.value) {
          _push(`<div class="lightbox-caption" aria-hidden="true" data-v-cb00f61e>${ssrInterpolate(activeImageAlt.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/glass/artesania-vs-industria.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const artesaniaVsIndustria = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cb00f61e"]]);
export {
  artesaniaVsIndustria as default
};
//# sourceMappingURL=artesania-vs-industria-Cx4ARxuH.js.map
