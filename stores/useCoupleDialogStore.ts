import { defineStore } from "pinia";
import { ref } from "vue";

export type DialogType = "alert" | "confirm";

export const useCoupleDialogStore = defineStore("coupleDialog", () => {
  const isOpen = ref(false);
  const type = ref<DialogType>("alert");
  const title = ref("알림");
  const message = ref("");
  const icon = ref("info");
  const confirmText = ref("확인");
  const cancelText = ref("취소");
  
  let confirmCallback: (() => void) | null = null;
  let cancelCallback: (() => void) | null = null;

  const showAlert = (msg: string, customTitle = "알림", customIcon = "info") => {
    type.value = "alert";
    title.value = customTitle;
    message.value = msg;
    icon.value = customIcon;
    confirmText.value = "확인";
    confirmCallback = null;
    cancelCallback = null;
    isOpen.value = true;
  };

  const showConfirm = (
    msg: string,
    onConfirm: () => void,
    customTitle = "확인",
    customIcon = "help_outline",
    onCancel?: () => void
  ) => {
    type.value = "confirm";
    title.value = customTitle;
    message.value = msg;
    icon.value = customIcon;
    confirmText.value = "확인";
    cancelText.value = "취소";
    confirmCallback = onConfirm;
    cancelCallback = onCancel || null;
    isOpen.value = true;
  };

  const handleConfirm = () => {
    isOpen.value = false;
    if (confirmCallback) {
      confirmCallback();
      confirmCallback = null;
    }
  };

  const handleCancel = () => {
    isOpen.value = false;
    if (cancelCallback) {
      cancelCallback();
      cancelCallback = null;
    }
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    type,
    title,
    message,
    icon,
    confirmText,
    cancelText,
    showAlert,
    showConfirm,
    handleConfirm,
    handleCancel,
    close,
  };
});
