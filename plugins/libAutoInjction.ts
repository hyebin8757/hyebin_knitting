import {defineNuxtPlugin} from "#app";
import {libVuetify} from "./lib/vuetify"

/**
 * Nuxt3는 plugins 바로 밑에 있는 풀러그인만 자동으로 인젝션합니다.
 * 따라서 plugins 하위 디렉토리는 루트로 올려서 인젝션시켜야 합니다.
 * */
export default defineNuxtPlugin( ( nuxtApp: any ) => {

  /**
   * 1. 라이브러리 > Vuetify
   * */
  libVuetify( nuxtApp );
} );