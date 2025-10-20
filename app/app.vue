<template>
  <div class="relative min-h-screen w-screen bg-black text-white overflow-hidden">
    <Transition name="splash-fade">
      <div v-if="showSplash" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- canvas full-screen para el splash 3D -->
        <canvas ref="canvas3d" class="w-full h-full block"></canvas>
      </div>
    </Transition>

    <Transition name="main-fade">
      <div v-show="!showSplash">
        <ClientOnly>
          <div class="absolute inset-0 z-0">
            <GlassStack class="w-full h-full" :projects="projects" :highlight-index="6" />
          </div>
        </ClientOnly>

        <header class="fixed top-2.5 left-0 right-0 px-6 md:px-10 py-5 flex items-center justify-between select-none z-10">
          <a href="/" class="text-xs md:text-[1.3em] tracking-[0.1em] font-bold uppercase">GLASS LAB®</a>
          <!-- <nav class="flex items-center gap-6 md:gap-10 text-[10px] md:text-xs uppercase">
            <a href="#" class="hover:opacity-70 transition-opacity">A</a>
            <a href="#" class="hover:opacity-70 transition-opacity">A</a>
            <a href="#" class="hover:opacity-70 transition-opacity">A</a>
            <a href="#" class="hover:opacity-70 transition-opacity">A</a>
          </nav> -->
        </header>

        <div class="fixed bottom-6 left-6 flex flex-col gap-2 text-[10px] md:text-xs uppercase z-10">
          <button class="px-3 py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors">Overview</button>
          <button class="px-3 py-2 border border-white/20 rounded-md hover:bg-white hover:text-black transition-colors">Index</button>
        </div>

        <aside class="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 text-[9px] md:text-[.9em] tracking-wide uppercase text-white/60 z-10">
          <button class="hover:text-white transition-colors">S XVIII</button>
          <button class="hover:text-white transition-colors">S XIX</button>
          <button class="hover:text-white transition-colors">S XX</button>
          <button class="hover:text-white transition-colors">S XXI</button>
        </aside>

        <NuxtPage />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import GlassStack from '../components/GlassStack.vue'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const showSplash = ref(true)
const canvas3d = ref(null)

const projects = ref([
  { id: 'glass-roman',     title: 'Vidrio Romano',          imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. I–III' },
  { id: 'glass-medieval',  title: 'Vidrio Medieval',        imageSmall: '/images/reloj-small.webp', image: '/images/bobs-vigilancia.webp', century: 'S. V–XV' },
  { id: 'glass-venetian',  title: 'Soplado Veneciano',      imageSmall: '/images/reloj-small.webp', image: '/images/camara1.webp', century: 'S. XIII–XVII' },
  { id: 'glass-industrial',title: 'Vidrio Industrial',      imageSmall: '/images/reloj-small.webp', image: '/images/camara2.webp', century: 'S. XVIII' },
  { id: 'glass-catalogue', title: 'Catálogo Vítreo',        imageSmall: '/images/reloj-small.webp', image: '/images/cristal1.webp', century: 'S. XIX' },
  { id: 'glass-modern',    title: 'Vidrio Moderno',         imageSmall: '/images/reloj-small.webp', image: '/images/cristal2.webp', century: 'S. XX' },
  { id: 'glass-float',     title: 'Proceso Float',          imageSmall: '/images/reloj-small.webp', image: '/images/deform1.webp', century: 'S. XX' },
  { id: 'glass-architect', title: 'Vidrio en Arquitectura', imageSmall: '/images/reloj-small.webp', image: '/images/deform2.webp', century: 'S. XX' },
  { id: 'glass-tech',      title: 'Vidrio Técnico',         imageSmall: '/images/reloj-small.webp', image: '/images/raton.webp', century: 'S. XXI' },
  { id: 'glass-smart',     title: 'Vidrio Inteligente',     imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'S. XXI+' },
  { id: 'glass-future',    title: 'Vidrio Experimental',    imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'Futuro' },
  { id: 'glass-archive',   title: 'Archivo Vítreo',         imageSmall: '/images/reloj-small.webp', image: '/images/reloj.webp', century: 'Varios' }
])

// -----------------------------------------------
// Three.js initialization with environment + composer
// -----------------------------------------------
let renderer, scene, camera, rafId, composer, pmremGenerator
let modelRef = null

onMounted(async () => {
  await nextTick()
  if (typeof window === 'undefined') return

  const canvas = canvas3d.value
  if (!canvas) {
    console.error('[splash] canvas3d no encontrado.')
    return
  }

  // imports dinámicos
  const THREE = await import('three').then(m => m)
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
  const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
  const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
  const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js')
  const { FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js')

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const setRendererSize = () => {
    const w = Math.max(1, canvas.clientWidth || window.innerWidth)
    const h = Math.max(1, canvas.clientHeight || window.innerHeight)
    renderer.setSize(w, h, false)
  }
  setRendererSize()

  // Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight || window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.position.set(0, 0, 2.5)

  // Environment: RoomEnvironment -> pmrem -> scene.environment
  pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()
  const roomEnv = new RoomEnvironment()
  const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture
  scene.environment = envMap
  // no background (seguimos con fondo negro)
  scene.background = null

  // Lights (añadimos algunos para obtener un aspecto más rico)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
  scene.add(hemi)
  const dir = new THREE.DirectionalLight(0xffffff, 1.0)
  dir.position.set(4, 4, 4)
  scene.add(dir)
  scene.add(new THREE.AmbientLight(0xffffff, 0.12))

  // texto "GLASS LAB®" como CanvasTexture detrás
  const textCanvas = document.createElement('canvas')
  textCanvas.width = 2048
  textCanvas.height = 512
  const ctx = textCanvas.getContext('2d')
  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height)
  ctx.font = 'bold 180px "Cabinet Grotesk", system-ui, Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('GLASS LAB®', textCanvas.width / 2, textCanvas.height / 2)
  const textTex = new THREE.CanvasTexture(textCanvas)
  textTex.encoding = THREE.sRGBEncoding || textTex.encoding
  const planeGeo = new THREE.PlaneGeometry(3.0, 0.6)
  const planeMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true, depthWrite: false })
  const textPlane = new THREE.Mesh(planeGeo, planeMat)
  textPlane.position.set(0, 0, -0.7)
  scene.add(textPlane)

  // Debug cube fallback
  const debugCubeGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6)
  const debugCubeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const debugCube = new THREE.Mesh(debugCubeGeo, debugCubeMat)
  debugCube.visible = false
  scene.add(debugCube)

  // Composer + passes (FXAA + RGB shift sutil)
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const RGBShiftShader = {
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.002 }, // << sutil, ajusta aquí
      angle: { value: 0.0 }
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse;
      uniform float amount;
      uniform float angle;
      varying vec2 vUv;
      void main() {
        vec2 offset = amount * vec2(cos(angle), sin(angle));
        float r = texture2D(tDiffuse, vUv + offset).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - offset).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  }
  const rgbPass = new ShaderPass(RGBShiftShader)
  rgbPass.renderToScreen = false
  composer.addPass(rgbPass)

  const fxaaPass = new ShaderPass(FXAAShader)
  const pixelRatio = renderer.getPixelRatio()
  fxaaPass.material.uniforms['resolution'].value.set(1 / (canvas.clientWidth * pixelRatio), 1 / (canvas.clientHeight * pixelRatio))
  composer.addPass(fxaaPass)

  // Loader GLTF
  const loader = new GLTFLoader()
  const url = '/3d/cube.gltf'

  try {
    const head = await fetch(url, { method: 'GET' })
    if (!head.ok) {
      console.error('[splash] fetch', url, 'no OK', head.status)
      debugCube.visible = true
    } else {
      const ct = head.headers.get('content-type') || ''
      if (ct.includes('text/html')) {
        console.error('[splash] La URL devuelve HTML en lugar de glTF.')
        debugCube.visible = true
      } else {
        loader.load(
          url,
          (gltf) => {
            console.log('[splash] gltf loaded', gltf)
            const model = gltf.scene || gltf.scenes[0]
            // centrar / ajustar escala
            const box = new THREE.Box3().setFromObject(model)
            const size = new THREE.Vector3()
            box.getSize(size)
            const center = new THREE.Vector3()
            box.getCenter(center)
            model.position.sub(center)
            model.scale.setScalar(1 / 2)

            // MATERIAL: MeshPhysicalMaterial con transmission (aprox. MeshTransmissionMaterial)
            model.traverse((c) => {
              if (c.isMesh) {
                const mat = new THREE.MeshPhysicalMaterial({
                  color: 0xffffff,
                  metalness: 0.0,
                  roughness: 0.0,
                  transmission: 1.0,   // requiere three r150+
                  thickness: 0.8,
                  ior: 1.45,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.0,
                  envMapIntensity: 1.5,
                  transparent: true,
                  side: THREE.DoubleSide
                })
                // aplicar el envMap para más reflejos (si falla, es por versión de three)
                if (scene.environment) mat.envMap = scene.environment
                c.material = mat
                c.castShadow = false
                c.receiveShadow = false
              }
            })

            // guardamos referencia para rotarlo en el loop
            modelRef = model
            scene.add(model)

            // ajustar cámara para encuadrar
            const maxDim = Math.max(size.x, size.y, size.z)
            const fitHeightDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
            const fitWidthDistance = fitHeightDistance / camera.aspect
            const distance = Math.max(fitHeightDistance, fitWidthDistance)
            camera.position.set(0, 0, distance * 1.15)
            camera.near = Math.max(0.01, distance / 100)
            camera.far = distance * 100
            camera.updateProjectionMatrix()

            debugCube.visible = false
          },
          (progress) => {
            if (progress && progress.loaded && progress.total) {
              console.log('[splash] progreso gltf', ((progress.loaded / progress.total) * 100).toFixed(1) + '%')
            }
          },
          (err) => {
            console.error('[splash] GLTF load error:', err)
            debugCube.visible = true
          }
        )
      }
    }
  } catch (err) {
    console.error('[splash] fetch error:', err)
    debugCube.visible = true
  }

  // resize handler
  const handleResize = () => {
    const w = Math.max(1, canvas.clientWidth || window.innerWidth)
    const h = Math.max(1, canvas.clientHeight || window.innerHeight)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    if (fxaaPass && fxaaPass.material && fxaaPass.material.uniforms && fxaaPass.material.uniforms['resolution']) {
      const pr = renderer.getPixelRatio()
      fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pr), 1 / (h * pr))
    }
    if (composer && composer.setSize) composer.setSize(w, h)
  }
  window.addEventListener('resize', handleResize)
  handleResize()

  // Render loop: rota modelo si existe y usa composer
  const clock = new THREE.Clock()
  const frame = () => {
    const t = clock.getElapsedTime()
    // rotación ligera y continua del modelo (ajusta la velocidad más abajo)
    if (modelRef) {
      // velocidad horizontal
      modelRef.rotation.y += 0.007   // <<< ajusta X aquí (por ej. 0.02 más rápido)
      // ligera oscilación en X para dar movimiento
      modelRef.rotation.x = Math.sin(t * 0.6) * 0.02
    }

    // rotación sutil de toda la escena para añadir sensación de cámara viva
    scene.rotation.y = Math.sin(t * 0.12) * 0.01

    // render por composer (incluye shader RGB sutil)
    if (composer) composer.render()
    else renderer.render(scene, camera)

    rafId = requestAnimationFrame(frame)
  }
  frame()

  // cerrar splash tras 4s y limpiar (si quieres que siga en background no pares)
  setTimeout(() => {
    showSplash.value = false
    // para ahorrar CPU en mobiles paramos el loop y liberamos
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', handleResize)
    try { composer?.dispose() } catch(e) {}
    try { pmremGenerator?.dispose() } catch(e) {}
    try { renderer?.dispose() } catch(e) {}
  }, 4000)

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', handleResize)
    try { composer?.dispose() } catch(e) {}
    try { pmremGenerator?.dispose() } catch(e) {}
    try { renderer?.dispose() } catch(e) {}
  })
})
</script>

<style>
@font-face {
  font-family: 'Cabinet Grotesk';
  src: url('/fonts/CabinetGrotesk-Variable.woff2') format('woff2'),
       url('/fonts/CabinetGrotesk-Variable.woff') format('woff'),
       url('/fonts/CabinetGrotesk-Variable.ttf') format('truetype'),
       url('/fonts/CabinetGrotesk-Variable.eot') format('embedded-opentype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

html, body, #__nuxt {
  font-family: 'Cabinet Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}
</style>

<style scoped>
.splash-fade-enter-active { transition: none; }
.splash-fade-leave-active { transition: opacity .6s ease-in-out; }
.splash-fade-leave-to { opacity: 0; }
.main-fade-enter-active { transition: opacity .6s ease-in-out .6s; }
.main-fade-enter-from { opacity: 0; }
canvas { display: block; width: 100%; height: 100%; }
</style>
