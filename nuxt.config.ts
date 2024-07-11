// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: "ko",
      },
      title: "민우주 포트폴리오",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1",
      meta: [
        {name: "description", content: ""},
        {"http-equiv": "X-UA-Compatible", content: "IE=edge,chrome=1"},
        {"http-equiv": "pragma", content: "no-cache"},
        {"http-equiv": "cache-control", content: "no-cache"},
        {"http-equiv": "expires", content: "0"},
      ],
      script: [
        {
        }
      ],
      link: [
        {rel: "icon", type: "image/png", href: "/favicon.png"}
      ]
    }
  },
})
