import { ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'vue-bundle-renderer/runtime';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _imports_0 = publicAssetsURL("/images/Instagram.png");
const _imports_1 = publicAssetsURL("/images/marco_espejo.png");
const _sfc_main = {
  __name: "espejo",
  __ssrInlineRender: true,
  setup(__props) {
    const introMessages = [
      "Los espejos en la antig\xFCedad eran objetos opulentes y de caracter divino",
      "El bronce pulido del antiguo egipto era considerado un objeto ritual sagrado",
      "Un espejo veneciano pod\xEDa llegar a costar m\xE1s que un barco",
      "Y el hecho de poder verse reflejado en un espejo era un lujo que pocos se podian permitir"
    ];
    const reflectionMessages = [
      "Antes, la gente pod\xEDa pasar a\xF1os sin ver su propio reflejo con claridad",
      "La individualidad y la autoimagen no eran tan importantes como ahora",
      "La obsesi\xF3n por la imagen personal es algo muy reciente en la historia",
      "Y como cualquier cambio dr\xE1stico",
      "Tiene consecuencias dr\xE1sticas."
    ];
    const currentMessageIndex = ref(0);
    const showGlass = ref(false);
    const showLight = ref(false);
    ref(false);
    const currentPhase = ref("intro");
    const isMobileView = ref(false);
    ref(false);
    ref(false);
    ref([]);
    const showFinalMessage = ref(false);
    const messages = computed(() => {
      return currentPhase.value === "intro" ? introMessages : reflectionMessages;
    });
    const currentMessage = computed(() => messages.value[currentMessageIndex.value]);
    computed(() => currentMessageIndex.value === messages.value.length - 1);
    ref(null);
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "min-h-screen bg-black flex items-center justify-center p-4 select-none overflow-hidden",
        style: { "height": "100vh" }
      }, _attrs))} data-v-ac88fd82>`);
      if (!showGlass.value) {
        _push(`<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none" data-v-ac88fd82><div class="text-white text-center max-w-2xl mx-auto p-8" data-v-ac88fd82><p class="text-lg leading-relaxed" data-v-ac88fd82>${ssrInterpolate(currentMessage.value)}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showFinalMessage.value) {
        _push(`<div class="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-4" data-v-ac88fd82><div class="text-white text-center" data-v-ac88fd82><p class="text-3xl md:text-5xl font-light mb-6" data-v-ac88fd82>la identidad se fragmenta</p><p class="text-gray-400 text-sm" data-v-ac88fd82>Haz click para continuar</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showGlass.value) {
        _push(`<div class="glass-container" data-v-ac88fd82>`);
        if (currentPhase.value === "reflection" && !isMobileView.value) {
          _push(`<div class="w-full max-w-2xl p-6 text-center" data-v-ac88fd82><div class="text-white text-lg" data-v-ac88fd82><p data-v-ac88fd82>${ssrInterpolate(reflectionMessages[currentMessageIndex.value])}</p></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="w-full h-full flex flex-col items-center justify-center" data-v-ac88fd82>`);
        if (showLight.value) {
          _push(`<div class="celestial-light" data-v-ac88fd82></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="decorative-elements" data-v-ac88fd82><!--[-->`);
        ssrRenderList(_ctx.emojis, (emoji, index) => {
          _push(`<div class="floating-emoji" style="${ssrRenderStyle(_ctx.getEmojiStyle(index))}" data-v-ac88fd82>${ssrInterpolate(emoji)}</div>`);
        });
        _push(`<!--]--></div><div class="${ssrRenderClass([{ "mobile-view": isMobileView.value }, "glass-wrapper"])}" data-v-ac88fd82><div class="glass" data-v-ac88fd82><div class="camera-container" data-v-ac88fd82><video autoplay playsinline class="camera-feed select-none" draggable="false" data-v-ac88fd82></video>`);
        if (isMobileView.value) {
          _push(`<img${ssrRenderAttr("src", _imports_0)} alt="Instagram Overlay" class="instagram-overlay select-none" draggable="false" data-v-ac88fd82>`);
        } else {
          _push(`<!---->`);
        }
        if (!isMobileView.value) {
          _push(`<img${ssrRenderAttr("src", _imports_1)} alt="Marco del espejo" class="frame-overlay select-none" draggable="false" data-v-ac88fd82>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="instructions select-none" data-v-ac88fd82> Mueve el rat\xF3n para ver el efecto de refracci\xF3n </div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/glass/espejo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const espejo = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ac88fd82"]]);

export { espejo as default };
//# sourceMappingURL=espejo-BTjonD8N.mjs.map
