// https://nuxt.com/docs/api/configuration/nuxt-config
import {resolve} from "path"

const cleanEnvValue = (val?: string) => {
  if (!val) return val;
  // 만약 마크다운 링크 형식 ([url](url))인 경우 실제 값만 추출
  const match = val.match(/\[.*?\]\((.*?)\)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return val.replace(/[\[\]\(\)]/g, '').trim();
};

/**
 * Nuxt Configuration
 * 설정은 통일
 * */
const nuxtConfig: any = {
  generate: undefined,
  vue: undefined,

  /**
   * Server side rendering 사용 안함
   * */
  ssr: false,

  /**
   * 특정 directory를 가르키는 alias 설정
   * */
  alias: {
    "~/*": "./*",
    "@/*": "./*",
  },

  build: {
    // transpile : [ /\.test$/, /\.spec$/ ],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "ko",
      },
      title: "인천 양육반 디지털 시스템",
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1, viewport-fit=cover",
      meta: [
        { "http-equiv": "X-UA-Compatible", content: "IE=edge,chrome=1" },
        { "http-equiv": "Pragma", content: "no-cache" },
        { "http-equiv": "Cache-control", content: "no-cache" },
        { "http-equiv": "Expires", content: "0" },
        {
          hid: "og:title",
          property: "og:title",
          content: "인천 양육반 디지털 시스템",
        },
        { hid: "og:image", property: "og:image", content: "/image_og1.png" },
        { hid: "og:description", property: "og:description", content: "설명" },
        { hid: "og:type", property: "og:type", content: "website" },
        { hid: "og:url", property: "og:url", content: "" },
      ],
      script: [],
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },

  /**
   * 일반 scss
   * */
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.css",
    "material-icons/iconfont/material-icons.css",
    "@/assets/style/CommonStyle.ts",
  ],

  nitro: {
    /**
     * Static으로 Build
     * public/ 디렉토리를 자산으로 import
     * */
    serveStatic: false,

    externals: {
      inline: ["h3"],
    },
  },

  proxy: {
    proxies: {},
  },

  modules: [
    "@pinia/nuxt", // pinia,
    "@pinia-plugin-persistedstate/nuxt", // pinia 상태 지속
    "@nuxt-alt/proxy", // proxy
    "nuxt-lodash",
    "@nuxtjs/supabase",
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: cleanEnvValue(process.env.SUPABASE_URL),
      supabaseKey: cleanEnvValue(process.env.SUPABASE_KEY),
    }
  },

  supabase: {
    url: cleanEnvValue(process.env.SUPABASE_URL),
    key: cleanEnvValue(process.env.SUPABASE_KEY),
    redirect: false,
  },

  webpack: {},

  /**
   * 타입스크립트 설정
   * */
  typescript: {
    strict: true,

    includeWorkspace: false,

    /**
     * build-time type checking을 활성화합니다.
     * 성능상의 이유로 기본적으로 꺼져있으며 이 설정을 키려면 아래 모듈을 설치해야 합니다.
     * `typescript` and `vue-tsc`
     * */
    typeCheck: false,

    shim: true,
  },

  imports: {
    dirs: [
      // Scan top-level modules
      "composables",
      // ... or scan modules nested one level deep with a specific name and file extension
      "composables/*/index.{ts,js,mjs,mts}",
      // ... or scan all modules within given directory
      "composables/**",
    ],
  },

  hooks: {
    //
    // "pages:extend"( pages: any ) {
    //   pages.push( {
    //     name: "notFoundPage",
    //     path: "/:catchall(.*)",
    //     file: resolve( "pages/errors/notFoundPage.vue" ),
    //   } );
    // },
  },

  compatibilityDate: '2026-07-26',

  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/vuetify')) {
              return 'vuetify';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
          }
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
};

export default defineNuxtConfig(nuxtConfig)//@ts-ignore