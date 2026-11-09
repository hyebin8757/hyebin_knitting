<script setup lang="ts">
import { useKnittingStore } from "~/stores/useKnittingStore";

const store = useKnittingStore();

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "🎉";
    case "warning":
      return "⚠️";
    case "error":
      return "❌";
    default:
      return "🔔";
  }
};
</script>

<template>
  <div>
    <!-- 1. 커스텀 인앱 알림 모달 (브라우저 기본 alert 완전 대체) -->
    <transition name="alert-fade">
      <div
        v-if="store.alertModal.isOpen"
        class="custom-alert-backdrop"
        @click.self="store.closeAlert"
      >
        <div class="custom-alert-card" role="dialog" aria-modal="true">
          <div class="alert-icon-wrap" :class="store.alertModal.type">
            <span class="alert-emoji">{{ getIcon(store.alertModal.type) }}</span>
          </div>

          <h3 class="alert-title">{{ store.alertModal.title }}</h3>
          <p class="alert-message">{{ store.alertModal.message }}</p>

          <div class="alert-btn-box">
            <button
              type="button"
              class="btn-alert-confirm"
              @click="store.closeAlert"
              autofocus
            >
              {{ store.alertModal.confirmText || "확인" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. 커스텀 인앱 토스트 팝업 (가벼운 복사/저장 알림) -->
    <transition name="toast-slide">
      <div v-if="store.toast.show" class="custom-toast-container">
        <div class="custom-toast-pill" :class="store.toast.type">
          <span class="toast-icon">
            {{ store.toast.type === "success" ? "✓" : store.toast.type === "warning" ? "!" : "i" }}
          </span>
          <span class="toast-message">{{ store.toast.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ========================================================
   인앱 알림 모달 (Custom Alert Modal)
   ======================================================== */
.custom-alert-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(30, 20, 20, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.custom-alert-card {
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px 20px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  border: 1px solid #f0e6dd;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.alert-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: #fff0f3;
}

.alert-icon-wrap.success {
  background: #ecfdf5;
}

.alert-icon-wrap.warning {
  background: #fffbeb;
}

.alert-icon-wrap.error {
  background: #fef2f2;
}

.alert-emoji {
  font-size: 1.8rem;
}

.alert-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 8px;
}

.alert-message {
  font-size: 0.88rem;
  color: #6b5c58;
  line-height: 1.55;
  margin: 0 0 20px;
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.alert-btn-box {
  width: 100%;
}

.btn-alert-confirm {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-alert-confirm:active {
  transform: scale(0.97);
}

/* ========================================================
   인앱 토스트 팝업 (Custom Toast)
   ======================================================== */
.custom-toast-container {
  position: fixed;
  top: 24px;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding: 0 16px;
}

.custom-toast-pill {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(35, 25, 24, 0.92);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  max-width: 90%;
  box-sizing: border-box;
}

.custom-toast-pill.success {
  background: rgba(22, 101, 52, 0.94);
  border-color: rgba(74, 222, 128, 0.3);
}

.custom-toast-pill.warning {
  background: rgba(180, 83, 9, 0.94);
  border-color: rgba(251, 191, 36, 0.3);
}

.toast-icon {
  font-weight: 900;
  font-size: 0.95rem;
}

.toast-message {
  font-size: 0.86rem;
  font-weight: 700;
  word-break: keep-all;
}

/* 애니메이션 */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.2s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

.alert-fade-enter-active .custom-alert-card {
  animation: alert-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes alert-pop {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
