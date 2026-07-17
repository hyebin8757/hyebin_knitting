<script setup lang="ts">
import {
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  ref,
} from "vue";
import { cx } from "@emotion/css";
import { useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import BaseAlert from "~/components/base/alert/BaseAlert.vue";
import FindDialog from "~/components/dialog/find/FindDialog.vue";

/************************************************************
 * Style
 ************************************************************/
import { LoginStyle } from "~/assets/style/pages/LoginStyle";

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
const userStore = useUserStore();
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
const loginData = reactive({
  id: "",
  password: "",
  menuList: [],
  findTitle: "",
  alertText: "",
});

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const loginBooleanData = reactive({
  passwordShow: false,
  alert: false,
  isFirst: true,
  findDialog: false,
});

const rememberId = ref(false);

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const moveHome = () => {
  router.push("/user/attendance");
};

const onLogin = async () => {
  if (!loginValidation()) {
    return (loginBooleanData.alert = true);
  }
  
  userStore.setLogin(true);
  
  if (loginData.id === 'admin') {
    userStore.userRole = 'admin';
    userStore.loggedInUser = { name: '관리자', role: '관리자', phone: '010-0000-0000', group: 0 };
  } else {
    userStore.userRole = 'member';
    const worker = userStore.workers.find(w => w.name === loginData.id);
    if (worker) {
      userStore.loggedInUser = worker;
    } else {
      userStore.loggedInUser = { name: loginData.id, role: '조합원', phone: loginData.password, group: 1 };
    }
  }

  // 아이디/비밀번호 정보 세션 저장 및 아이디 기억하기 체크 처리
  userStore.setUserInfo({ id: loginData.id, password: loginData.password });
  if (rememberId.value) {
    localStorage.setItem("remember_id", loginData.id);
  } else {
    localStorage.removeItem("remember_id");
  }
  
  moveHome();
};

const findDialogToggle = (title: string) => {
  if (isEmpty(title)) {
    return;
  }

  loginData.findTitle = title;
  loginBooleanData.findDialog = true;
};

const loginValidation = () => {
  if (isEmpty(loginData.id) && isEmpty(loginData.password)) {
    loginData.alertText = "아이디 와 비밀번호를 입력해주세요.";
    return false;
  } else if (isEmpty(loginData.id)) {
    loginData.alertText = "아이디를 입력해주세요.";
    return false;
  } else if (isEmpty(loginData.password)) {
    loginData.alertText = "비밀번호를 입력해주세요.";
    return false;
  }

  // 1. 관리자 계정 로그인 체크
  if (loginData.id === 'admin' && loginData.password === '0000') {
    return true;
  }

  // 2. 등록된 조합원 중 일치하는 계정 찾기
  // ID = 실명 혹은 설정된 loginId, 비밀번호 = 설정된 loginPassword 혹은 휴대폰 번호 뒷 4자리/전체
  const worker = userStore.workers.find(w => w.name === loginData.id || w.loginId === loginData.id);
  if (worker) {
    const rawPhone = worker.phone.replace(/[^0-9]/g, '');
    const defaultPassword = rawPhone.slice(-4);
    const correctPassword = worker.loginPassword || defaultPassword;
    if (loginData.password === correctPassword || rawPhone === loginData.password) {
      return true;
    }
  }

  loginData.alertText = "아이디 혹은 비밀번호를 잘못 입력하였습니다. 입력하신 내용을 다시 확인해주세요.";
  return false;
};

/************************************************************
 * Watch
 ************************************************************/
watch(
  () => loginBooleanData.findDialog,
  (newValue: boolean) => {
    if (!newValue) {
      setTimeout(() => {
        loginData.findTitle = "";
      }, 200);
    }
  }
);

watch(
  () => loginBooleanData.alert,
  (newValue: boolean) => {
    if (newValue) {
      setTimeout(() => {
        loginBooleanData.alert = false;
      }, 1500);
    }
  }
);

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  document.documentElement.removeAttribute("dark-mode");
  const savedId = localStorage.getItem("remember_id");
  if (savedId) {
    loginData.id = savedId;
    rememberId.value = true;
  }
});
</script>

<template>
  <div :class="cx('login', LoginStyle.Default)">
    <div :class="cx(LoginStyle.Container)">
      <div :class="cx('form-card', LoginStyle.FormCard)">
        <div :class="cx('title', LoginStyle.Title)">
          인천 양육반
        </div>

        <div :class="cx(LoginStyle.Content)">
          <form :class="cx(LoginStyle.Form)" @submit.prevent="onLogin">
            <div :class="cx(LoginStyle.InfoArea)">
              <div :class="cx(LoginStyle.InfoItem)">
                <div class="is-flex">
                  <span class="title">아이디</span>
                </div>
                <v-text-field
                  v-model="loginData.id"
                  variant="solo"
                  placeholder="아이디를 입력해주세요."
                  hide-details
                />
              </div>
              <div :class="cx(LoginStyle.InfoItem)">
                <div class="is-flex">
                  <span class="title">비밀번호</span>
                </div>

                <v-text-field
                  v-model="loginData.password"
                  variant="solo"
                  placeholder="패스워드를 입력해주세요."
                  :append-icon="
                    loginBooleanData.passwordShow ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  :type="loginBooleanData.passwordShow ? 'text' : 'password'"
                  @click:append="
                    loginBooleanData.passwordShow =
                      !loginBooleanData.passwordShow
                  "
                  hide-details
                />
              </div>
            </div>

            <!-- 아이디 저장 체크박스 (커스텀 디자인) -->
            <div style="margin-top: 1.2rem; margin-bottom: 1.6rem; display: flex; align-items: center; gap: 0.8rem; cursor: pointer; user-select: none; width: fit-content;" @click="rememberId = !rememberId">
              <div 
                :style="{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.6rem',
                  border: '1px solid ' + (rememberId ? 'rgba(136, 197, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'),
                  background: rememberId ? 'rgba(35, 102, 180, 0.35)' : 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }"
              >
                <i 
                  v-if="rememberId" 
                  class="material-icons" 
                  style="font-size: 1.4rem; color: #88c5ff; font-weight: bold;"
                >
                  check
                </i>
              </div>
              <span style="color: rgba(255,255,255,0.75); font-size: 1.3rem; font-weight: 600;">아이디 저장</span>
            </div>

            <div :class="cx(LoginStyle.LoginBtn)">
              <v-btn type="submit"> 로그인 </v-btn>
            </div>
          </form>

          <div :class="cx(LoginStyle.MenuList)">
            <ul>
              <li v-for="(item, index) in loginData.menuList" :key="index">
                <span v-text="item.title" @click="item.event(item)"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <FindDialog
      v-model="loginBooleanData.findDialog"
      :title="loginData.findTitle"
    />
    <BaseAlert
      v-model="loginBooleanData.alert"
      title=""
      :text="loginData.alertText"
      :is-footer="false"
    />
  </div>
</template>

<style lang="scss"></style>
