import { watch, onUnmounted, type Ref } from "vue";

export function useBodyScrollLock(isLocked: Ref<boolean>) {
  if (typeof window === "undefined") return;

  const lock = () => {
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  };

  const unlock = () => {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
  };

  watch(
    isLocked,
    (val) => {
      if (val) {
        lock();
      } else {
        unlock();
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    unlock();
  });
}
