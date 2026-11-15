import { watch, onUnmounted, type Ref } from "vue";

let lockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";

export const lockBody = () => {
  if (typeof document === "undefined") return;
  lockCount++;
  if (lockCount === 1) {
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }
};

export const unlockBody = () => {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  }
};

/**
 * 🔒 모달 오픈 시 배경(body/html) 스크롤 방지 Composable
 * 모달의 open 상태 Ref를 전달하면 열릴 때 스크롤을 잠그고 닫힐 때 안전하게 해제합니다.
 */
export const useBodyScrollLock = (isOpenRef: Ref<boolean>) => {
  watch(
    isOpenRef,
    (isOpen, wasOpen) => {
      if (isOpen && !wasOpen) {
        lockBody();
      } else if (!isOpen && wasOpen) {
        unlockBody();
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (isOpenRef.value) {
      unlockBody();
    }
  });
};
