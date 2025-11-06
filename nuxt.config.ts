// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@tresjs/nuxt'],
  app: {
    head: {
      title: 'GLASS LAB®',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: 'data:,' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: 'data:,' }
      ]
    }
  }
})