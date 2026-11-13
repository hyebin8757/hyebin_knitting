<script setup lang="ts">
import { onMounted } from 'vue';
import { useKnittingStore } from '~/stores/useKnittingStore';

const knittingStore = useKnittingStore();

// Netlify "Powered by Netlify" 뱃지 및 툴바 완전 숨김 전역 주입
useHead({
  style: [
    {
      children: `
        iframe#nl-badge-frame,
        iframe[title*="Powered by Netlify" i],
        iframe[title*="Netlify" i],
        iframe[src*="netlify" i],
        iframe[src*="/.netlify/scripts/hud" i],
        [id*="netlify-badge" i],
        [id*="nl-badge" i],
        [class*="netlify-badge" i],
        [data-netlify-badge],
        #netlify-hud,
        .netlify-hud,
        netlify-hud,
        netlify-cdp,
        netlify-drawer {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          clip: rect(0, 0, 0, 0) !important;
          z-index: -9999 !important;
        }
      `,
    },
  ],
});

onMounted(() => {
  knittingStore.loadFromLocalStorage();

  // 클라이언트 사이드에서 동적으로 DOM에 삽입되는 Netlify 뱃지 즉시 제거 감시자
  if (typeof window !== 'undefined') {
    const removeBadge = () => {
      const badge = document.querySelector('iframe#nl-badge-frame, iframe[title*="Powered by Netlify" i], iframe[title*="Netlify" i], #netlify-hud, [data-netlify-badge]');
      if (badge) {
        badge.remove();
      }
    };
    removeBadge();
    const observer = new MutationObserver(() => {
      removeBadge();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
</script>

<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<style>
/* 전역 스크롤바 및 기본 스타일 */
* {
  box-sizing: border-box;
}

/* 🍎 iOS Safari (WebKit) 전역 UX/UI 최적화 */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  padding: 0;
  background-color: #faf7f2;
  color: #2b1f1d;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior-y: none;
}

/* 📱 iOS Safari에서 인풋 터치 시 16px 미만 폰트로 인한 강제 화면 확대(줌인 및 화면 좌우 깨짐) 완전 방지 */
@media screen and (max-width: 768px) {
  input,
  textarea,
  select {
    font-size: 16px !important;
  }
}

/* iOS 기본 버튼 및 인풋 둥근 그림자 방지 */
input[type="text"],
input[type="tel"],
input[type="password"],
input[type="number"],
input[type="search"],
textarea {
  -webkit-appearance: none;
}

/* 숫자 폰트 고정 */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* 🚫 Netlify "Powered by Netlify" 뱃지 및 HUD 오버레이 CSS 숨김 */
iframe#nl-badge-frame,
iframe[title*="Powered by Netlify" i],
iframe[title*="Netlify" i],
iframe[src*="netlify" i],
iframe[src*="/.netlify/scripts/hud" i],
[id*="netlify-badge" i],
[id*="nl-badge" i],
[class*="netlify-badge" i],
[data-netlify-badge],
#netlify-hud,
.netlify-hud,
netlify-hud,
netlify-cdp,
netlify-drawer {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
  clip: rect(0, 0, 0, 0) !important;
  z-index: -9999 !important;
}
</style>
