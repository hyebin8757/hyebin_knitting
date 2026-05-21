<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import { cx } from "@emotion/css";
import { useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import BaseAlert from "~/components/base/alert/BaseAlert.vue";

/************************************************************
 * Style
 ************************************************************/
import { JoinStyle } from "~/assets/style/pages/JoinStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

import { useUserStore } from "~/stores/useUserStore";

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const router = useRouter();

const { setUserInfo } = useUserStore();

const { isEmpty, isNotEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const joinData = reactive({
  id: "",
  password: "",
  passwordReconfirm: "",
  eMail: "test@intellij.com",
  name: "테스트 유저",
  birthDate: new Date(),
  phone: "01012345678",
  radio: "one",
  alertText: "",
});

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const joinBooleanData = reactive({
  passwordShow: false,
  passwordReconfirmShow: false,
  alert: false,
});

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
// 로그인 페이지 이동
const onLogin = () => {
  router.push("/login");
};

// 생년월일 현재로 날짜 설정
const formatDateToString = (value: Date): string => {
  if (isEmpty(value)) {
    return "19990101";
  }

  const year: number | string = value.getFullYear();
  let month: number | string = value.getMonth() + 1;
  let date: number | string = value.getDate();

  if (10 > month) {
    month = "0" + month;
  }

  if (10 > value.getDate()) {
    date = "0" + value.getDate();
  }

  return year + month + date;
};

// 로그인 설정
const onJoin = async () => {
  const isCheck = await joinValidation();

  if (!isCheck) {
    return (joinBooleanData.alert = true);
  }

  setUserInfo({
    id: joinData.id,
    password: joinData.password,
  });

  onLogin();
};

// 로그인 시 데이터 확인
const joinValidation = () => {
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  if (isEmpty(joinData.id) && isEmpty(joinData.password)) {
    joinData.alertText = "아이디 와 비밀번호를 입력해주세요.";
    return false;
  } else if (isEmpty(joinData.id)) {
    joinData.alertText = "아이디를 입력해주세요.";
    return false;
  } else if (isEmpty(joinData.password)) {
    joinData.alertText = "비밀번호를 입력해주세요.";
    return false;
  } else if (isNotEmpty(joinData.id) && koreanRegex.test(joinData.id)) {
    joinData.alertText = "아이디에서 한글을 제외 해주세요.";
    return false;
  } else if (4 > joinData.id.length || 4 > joinData.password.length) {
    joinData.alertText = "최소 4글자 이상씩 작성해주세요.";
    return false;
  }

  if (joinData.password !== joinData.passwordReconfirm) {
    joinData.alertText = "비밀번호가 동일하지 않습니다. 다시 확인해주세요.";
    return false;
  }

  return true;
};

const onClose = () => {
  router.push("/login");
};

/************************************************************
 * Watch
 ************************************************************/
watch(
  () => joinBooleanData.alert,
  (newValue: boolean) => {
    if (newValue) {
      setTimeout(() => {
        joinBooleanData.alert = false;
      }, 1000);
    }
  }
);

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  joinData.radio = "one";
  joinData.birthDate = formatDateToString(joinData.birthDate);
});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta({
  layout: false,
  alias: ["/join"],
});
</script>

<template>
  <div :class="cx(JoinStyle.Default)">
    <div :class="cx(JoinStyle.Container)">
      <div :class="cx(JoinStyle.Title)" @click="onLogin">
        <img src="@/assets/images/logo/logo.png" alt="logo" />
        <span>Min U Ju - IntelliJ IDEA</span>
        <v-tooltip content-class="black-tooltip" location="top">
          <template v-slot:activator="{ props }">
            <span v-bind="props" class="material-icons">error_outline</span>
          </template>
          <div>
            <span>* [필수] 아이디 와 비밀번호만 작성 해주세요.</span>
          </div>
        </v-tooltip>
      </div>

      <div :class="cx('join-item', JoinStyle.JoinItem)">
        <v-text-field
          v-model="joinData.id"
          variant="solo"
          placeholder="아이디"
        />
        <em v-if="0 < joinData.id.length && 4 > joinData.id.length" class="">
          최소 4글자 이상 작성해주세요.
        </em>
        <v-text-field
          v-model="joinData.password"
          variant="solo"
          placeholder="비밀번호"
          :append-icon="
            joinBooleanData.passwordShow ? 'mdi-eye' : 'mdi-eye-off'
          "
          :type="joinBooleanData.passwordShow ? 'text' : 'password'"
          @click:append="
            joinBooleanData.passwordShow = !joinBooleanData.passwordShow
          "
        />
        <em v-if="0 < joinData.password.length && 4 > joinData.password.length">
          최소 4글자 이상 작성해주세요.
        </em>
        <v-text-field
          v-model="joinData.passwordReconfirm"
          variant="solo"
          placeholder="비밀번호 재확인"
          :append-icon="
            joinBooleanData.passwordReconfirmShow ? 'mdi-eye' : 'mdi-eye-off'
          "
          :type="joinBooleanData.passwordReconfirmShow ? 'text' : 'password'"
          @click:append="
            joinBooleanData.passwordReconfirmShow =
              !joinBooleanData.passwordReconfirmShow
          "
        />
        <em
          v-if="
            1 < joinData.passwordReconfirm.length &&
            joinData.password !== joinData.passwordReconfirm
          "
        >
          비밀번호를 다시 확인 해주세요.
        </em>
        <v-text-field
          v-model="joinData.eMail"
          variant="solo"
          placeholder="[선택]이메일주소 (비밀번호 찾기 등 본인 확인용)"
        />
      </div>

      <div :class="cx('join-item', JoinStyle.JoinItem)">
        <v-text-field
          v-model="joinData.name"
          variant="solo"
          placeholder="이름"
        />
        <v-text-field
          v-model="joinData.birthDate"
          variant="solo"
          placeholder="생년월일 8자리"
        />
        <v-radio-group v-model="joinData.radio">
          <v-radio label="남자" value="one"></v-radio>
          <v-radio label="여자" value="two"></v-radio>
          <v-radio label="선택안함" value="third"></v-radio>
        </v-radio-group>
        <v-text-field
          v-model="joinData.phone"
          variant="solo"
          placeholder="휴대전화번호 Ex) 01012345678"
        />
      </div>

      <div :class="cx(JoinStyle.JoinBtn)">
        <BaseBtn
          :class="cx( 'close-btn' )"
          @on-click="onClose"
        >
          <span>취소</span>
        </BaseBtn>

        <BaseBtn @on-click="onJoin">
          <span>회원가입</span>
        </BaseBtn>
      </div>
    </div>
    <BaseAlert
      v-model="joinBooleanData.alert"
      title=""
      :text="joinData.alertText"
      :is-footer="false"
    />
  </div>
</template>

<style lang="scss"></style>
