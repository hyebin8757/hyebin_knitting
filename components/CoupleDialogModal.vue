<script setup lang="ts">
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

const dialogStore = useCoupleDialogStore();
</script>

<template>
  <Transition name="dialog-fade">
    <div
      v-if="dialogStore.isOpen"
      class="dialog-overlay"
      @click.self="dialogStore.type === 'alert' ? dialogStore.handleConfirm() : null"
    >
      <div class="dialog-card">
        <div class="dialog-icon-wrapper">
          <span class="icon-circle" :class="dialogStore.type">
            <i class="material-icons">{{ dialogStore.icon || 'notifications' }}</i>
          </span>
        </div>

        <div class="dialog-content">
          <h4 class="dialog-title">{{ dialogStore.title }}</h4>
          <p class="dialog-message">{{ dialogStore.message }}</p>
        </div>

        <div class="dialog-actions">
          <button
            v-if="dialogStore.type === 'confirm'"
            type="button"
            class="dialog-btn cancel-btn"
            @click="dialogStore.handleCancel()"
          >
            {{ dialogStore.cancelText }}
          </button>
          <button
            type="button"
            class="dialog-btn confirm-btn"
            :class="dialogStore.type"
            @click="dialogStore.handleConfirm()"
          >
            {{ dialogStore.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dialog-card {
  background: #ffffff;
  width: 100%;
  max-width: 320px;
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(240, 230, 220, 0.9);
  animation: dialog-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialog-pop {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-icon-wrapper {
  margin-bottom: 12px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.alert {
  background: #fff3e0;
  color: #ff9800;
}

.icon-circle.confirm {
  background: #ffebee;
  color: #e53935;
}

.icon-circle i {
  font-size: 1.6rem;
}

.dialog-content {
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #333333;
  margin-bottom: 6px;
}

.dialog-message {
  font-size: 0.85rem;
  color: #666666;
  line-height: 1.45;
  white-space: pre-line;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.dialog-btn {
  flex: 1;
  padding: 12px;
  border-radius: 16px;
  font-size: 0.88rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.dialog-btn:active {
  transform: scale(0.96);
}

.cancel-btn {
  background: #f0f0f0;
  color: #666666;
}

.confirm-btn.alert {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.confirm-btn.confirm {
  background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

/* Vue Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
