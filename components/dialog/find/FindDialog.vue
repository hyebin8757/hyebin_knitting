<script setup lang="ts">
import {onMounted, reactive} from "vue";
import { cx } from "@emotion/css";
import BaseDialog from "~/components/base/dialog/BaseDialog.vue";
import {FindDialogStyle} from "~/components/dialog/find/style/FindDialogStyle";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  title : string,
}>(), {
  title : "아이디 찾기",
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * dialog 이벤트
   */
  ( eventName: "update:modelValue", value: boolean ): void,
}>();


/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const findData = reactive({
  idTab : "name",
  idRadio1: "one",
  idRadio2: "one",
  findGuide : "회원가입 시 입력된 개인정보로 아이디를 찾으실 수 있습니다.",
  name : "",
  birthDate : "",
})

const findBooleanData = reactive({

})
/************************************************************
 * Function
 ************************************************************/
const updateModelValue = ( value : boolean ) => {
  emit("update:modelValue", value );
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted(() => {

});

</script>
<template>
  <BaseDialog
      :class="cx( FindDialogStyle.Default )"
      :title="props.title"
      max-width="800"
      @update:model-value="updateModelValue"
  >
    <div :class="cx( FindDialogStyle.FindGuide )">
      <span v-text="'*' + findData.findGuide"></span>
    </div>
    <div :class="cx( FindDialogStyle.IdFrom )">
      <v-tabs
          v-model="findData.idTab"
          color="primary"
          direction="vertical"
      >
        <v-tab text="이름/생년월일" value="name"></v-tab>
        <v-tab text="휴대폰 인증" value="phone"></v-tab>
        <v-tab text="아이피(I-PIN)인증" value="i-pin"></v-tab>
      </v-tabs>

      <v-tabs-window v-model="findData.idTab">
        <v-tabs-window-item value="name">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <div class="title">
                  <span>이름</span>
                </div>
                <v-text-field
                    v-model="findData.name"
                    variant="solo"
                    placeholder="이름을 입력해주세요."
                />
              </div>
              <div class="tab-item">
                <div class="title">
                  <span>생년월일</span>
                </div>
                <v-text-field
                    v-model="findData.birthDate"
                    variant="solo"
                    placeholder="생년월일 8자리를 입력해주세요. Ex)19990101"
                />
              </div>
              <div class="tab-item__guide">
                <span>- [휴대폰(SMS)], [휴대폰 본인인증], [I-PIN 본인인증]은 전체 아이디 확인이 가능합니다</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="phone">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <span class="tab-item__sub-guide">휴대폰 인증으로 비밀번호를 재설정 할 수 있습니다.</span>
                <v-radio-group v-model="findData.idRadio1">
                  <v-radio label="본인 인증으로 가입" value="one"></v-radio>
                  <v-radio label="법정대리인 동의로 가입" value="two"></v-radio>
                </v-radio-group>
              </div>
              <div class="tab-item__guide">
                <span>- 회원가입 또는 회원정보 수정을 통해 본인인증을 받은 회원만 이용 가능합니다.</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <v-tabs-window-item value="i-pin">
          <v-card flat class="tab-content">
            <v-card-text>
              <div class="tab-item">
                <span class="tab-item__sub-guide">아이핀 인증으로 비밀번호를 재설정 할 수 있습니다.</span>
                <v-radio-group v-model="findData.idRadio2">
                  <v-radio label="본인 인증으로 가입" value="one"></v-radio>
                  <v-radio label="법정대리인 동의로 가입" value="two"></v-radio>
                </v-radio-group>
              </div>
              <div class="tab-item__guide">
                <span>- 회원가입 또는 회원정보 수정을 통해 본인인증을 받은 회원만 이용 가능합니다.</span>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <div :class="cx( FindDialogStyle.PasswordFrom )">

    </div>
  </BaseDialog>
</template>

<style lang="scss"></style>