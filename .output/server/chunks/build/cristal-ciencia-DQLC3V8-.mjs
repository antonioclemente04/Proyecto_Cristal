import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-black text-white" }, _attrs))}><header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between z-10"><a href="/?nosplash=1" class="text-xs md:text-[1.3em] font-bold uppercase">GLASS LAB\xAE</a></header><main class="pt-24 px-6 md:px-12 max-w-5xl mx-auto"></main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/glass/cristal-ciencia.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const cristalCiencia = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { cristalCiencia as default };
//# sourceMappingURL=cristal-ciencia-DQLC3V8-.mjs.map
