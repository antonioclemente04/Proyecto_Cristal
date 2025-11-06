// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@tresjs/nuxt'],
  
  // Build configuration
  build: {
    transpile: ['three', '@tresjs/cientos']
  },
  
  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['three', '@tresjs/cientos']
    },
    build: {
      rollupOptions: {
        external: ['three'],
        output: {
          globals: {
            three: 'THREE'
          }
        }
      }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'GLASS LAB®',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Glass Lab - Explore our collection' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: 'data:,' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: 'data:,' }
      ]
    }
  },
  
  // Runtime config
  runtimeConfig: {
    public: {
      // Add any public runtime config here
    }
  }
})