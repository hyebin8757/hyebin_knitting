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
  menuList: [
    {
      title: "아이디 찾기",
      event: (itemInfo: any) => {
        findDialogToggle(itemInfo.title);
      },
    },
    {
      title: "비밀번호 찾기",
      event: (itemInfo: any) => {
        findDialogToggle(itemInfo.title);
      },
    },
    {
      title: "회원가입",
      path: "/join",
      event: (itemInfo: any) => {
        if (isEmpty(itemInfo.path)) {
          return;
        }
        router.push(itemInfo.path);
      },
    },
  ],
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
      // 혹시 정보가 누락되었을 경우 폴백
      userStore.loggedInUser = { name: loginData.id, role: '조합원', phone: loginData.password, group: 1 };
    }
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
  // ID = 이름, 비밀번호 = 휴대폰 번호 전체 혹은 뒷 4자리
  const worker = userStore.workers.find(w => w.name === loginData.id);
  if (worker) {
    const rawPhone = worker.phone.replace(/[^0-9]/g, '');
    const inputPassword = loginData.password.replace(/[^0-9]/g, '');
    if (rawPhone === inputPassword || rawPhone.slice(-4) === inputPassword) {
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
