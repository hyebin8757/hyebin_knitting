import { watch, onUnmounted, type Ref } from "vue";

let lockCount = 0;
let savedScrollY = 0;
let previousBodyPosition = "";
let previousBodyTop = "";
let previousBodyLeft = "";
let previousBodyRight = "";
let previousBodyWidth = "";
let previousBodyOverflowY = "";

export const lockBody = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  lockCount++;
  if (lockCount === 1) {
    // 🔒 현재 스크롤 위치 정확히 캡처
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // 기존 인라인 스타일 백업
    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyLeft = document.body.style.left;
    previousBodyRight = document.body.style.right;
    previousBodyWidth = document.body.style.width;
    previousBodyOverflowY = document.body.style.overflowY;

    // 🔒 배경을 현재 위치에 고정 (스크롤 탑 점프 100% 방지)
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll"; // 스크롤바 유무로 인한 레이아웃 쉬프트 방지

    document.body.classList.add("modal-open");
  }
};

export const unlockBody = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    // 🔓 고정 스타일 원복
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.left = previousBodyLeft;
    document.body.style.right = previousBodyRight;
    document.body.style.width = previousBodyWidth;
    document.body.style.overflowY = previousBodyOverflowY;

    document.body.classList.remove("modal-open");

    // 📍 원래 보고 있던 스크롤 위치로 1px 오차 없이 즉시 복원
    window.scrollTo({
      top: savedScrollY,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }
};

/**
 * 🔒 모달 오픈 시 배경(body) 스크롤 방지 & 스크롤 위치 보존 Composable
 * 모달의 open 상태 Ref를 전달하면 열릴 때 스크롤을 잠그고 닫힐 때 원래 위치로 안전하게 복원합니다.
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
