<script setup lang="ts">
import { ref } from "vue";
import { cx } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";

/************************************************************
 * Style
 ************************************************************/
import { MainNoticeDialogStyle, MainNoticeDialogStyleClass } from "~/components/dialog/main/style/MainNoticeDialogStyle";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults(defineProps<{
  modelValue: boolean;
}>(), {
  modelValue: false,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  (eventName: "update:modelValue", value: boolean): void;
  (eventName: "onCheck"): void;
}>();

/************************************************************
 * Dynamic Data
 ************************************************************/
const dontShowAgain = ref(false);

/************************************************************
 * Function
 ************************************************************/
const updateModelValue = (value: boolean) => {
  emit("update:modelValue", value);
};

const onClose = () => {
  if (dontShowAgain.value) {
    // 오늘 하루 보지 않기 처리 (오늘 자정 타임스탬프 저장)
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    localStorage.setItem("main_notice_expiry", midnight.getTime().toString());
  }
  updateModelValue(false);
};

const onCheck = () => {
  if (dontShowAgain.value) {
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    localStorage.setItem("main_notice_expiry", midnight.getTime().toString());
  }
  emit("onCheck");
  updateModelValue(false);
};
</script>

<template>
  <v-dialog
    :model-value="props.modelValue"
    :class="cx(MainNoticeDialogStyleClass)"
    persistent
    @update:model-value="updateModelValue"
  >
    <v-card>
      <!-- 헤더 영역 -->
      <template #title>
        <div class="title">
          <span>SALOMON PORTFOLIO</span>
        </div>
        <BaseBtn
          :hover="false"
          variant="text"
          @on-click="onClose"
        >
          <span class="material-icons">close</span>
        </BaseBtn>
      </template>

      <!-- 콘텐츠 영역 -->
      <v-card-text>
        <div :class="cx(MainNoticeDialogStyle.PopupContent)">
          <div class="badge">🏆 UX/UI REFACTORING</div>
          <h2 class="main-title">
            살로몬 공식 스토어<br>
            <span>UX/UI 개선 오마주 프로젝트</span>
          </h2>
          <p class="desc">
            살로몬 공식 온라인스토어의 **5대 사용자 병목 요인**<br>
            (비회원 장바구니 강제 로그인 장벽, 호버 시 레이아웃 시프트(CLS),<br>
            무거운 jQuery 의존성, 모바일 스와치 과다 노출, 웹 접근성 위배)을<br>
            <strong>완벽히 리팩토링한 퍼블리싱 포트폴리오</strong>를 구축했습니다.<br>
            이력서 검토를 위해 준비된 실무형 결과물을 지금 경험해 보세요!
          </p>

          <!-- 옵션 영역 (오늘 하루 보지 않기) -->
          <div class="options-row">
            <label class="dont-show-again">
              <input
                type="checkbox"
                v-model="dontShowAgain"
              />
              <span>오늘 하루 이 창을 열지 않기</span>
            </label>
          </div>
        </div>
      </v-card-text>

      <!-- 하단 액션 영역 -->
      <v-card-actions>
        <div :class="cx(MainNoticeDialogStyle.ActionButtons)">
          <BaseBtn
            class="btn-close"
            :hover="false"
            variant="flat"
            @on-click="onClose"
          >
            닫기
          </BaseBtn>
          <BaseBtn
            class="btn-go"
            :hover="false"
            variant="flat"
            @on-click="onCheck"
          >
            오마주 스토어 입장 👟
          </BaseBtn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
/* Scoped styles if needed, mostly handled by Emotion CSS in Style file */
</style>
