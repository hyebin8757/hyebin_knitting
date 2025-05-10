<script setup lang="ts">
import { reactive, watch, onMounted } from "vue";
import { cx } from "@emotion/css";
import { useRouter } from "vue-router";

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

const { setLogin, getLoginUser } = useUserStore();

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
  id : "",
  password : "",
  menuList : [
    {
      title : "아이디 찾기",
      event : ( itemInfo : any ) => {
        findDialogToggle( itemInfo.title );
      },
    },
    {
      title : "비밀번호 찾기",
      event : ( itemInfo : any  ) => {
        findDialogToggle( itemInfo.title );
      },
    },
    {
      title : "회원가입",
      path : "/join/join",
      event : ( itemInfo : any  ) => {
        if ( isEmpty( itemInfo.path ) ) {
          return;
        }

        router.push( itemInfo.path );
      },
    }
  ],
  findTitle : "",
  alertText :  "",
})

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const loginBooleanData = reactive({
  passwordShow : false,
  alert : false,loginData,
  isFirst : true,
  findDialog : false,
})

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const moveMain = () => {
  router.push( "/main/main" );
}

const onLogin = async () => {
  const isCheck = await loginValidation();

  if ( !isCheck ) {
    return ( loginBooleanData.alert = true );
  }

  setLogin( true );
  moveMain();
}

const findDialogToggle = ( title : string ) => {
  if ( isEmpty( title ) ) {
    return;
  }

  loginData.findTitle = title;

  loginBooleanData.findDialog = true;
}

const loginValidation = () => {
  const loginUser = getLoginUser();

  if ( isEmpty( loginData.id ) && isEmpty( loginData.password ) ) {
    loginData.alertText = "아이디 와 비밀번호를 입력해주세요.";
    return false;
  }
  else if ( isEmpty( loginData.id ) && isNotEmpty( loginData.password ) ) {
    loginData.alertText = "아이디를 입력해주세요.";
    return false;
  }
  else if ( isNotEmpty( loginData.id ) && isEmpty( loginData.password ) ) {
    loginData.alertText = "비밀번호를 입력해주세요.";
    return false;
  }
  else if ( isEmpty( loginUser ) && ( "testUser" !== loginData.id || "0000" !== loginData.password ) ) {
    loginData.alertText = "아이디 혹은 비밀번호를 잘못 입력하였습니다. 입력하신 내용을 다시 확인해주세요.";
    return false;
  }
  else if ( isNotEmpty( loginUser ) && ( loginData.id !== loginUser?.id || loginData.password !== loginUser?.password )) {
    loginData.alertText = "아이디 혹은 비밀번호를 잘못 입력하였습니다. 입력하신 내용을 다시 확인해주세요.";
    return false;
  }

  return true;
}

/************************************************************
 * Watch
 ************************************************************/
watch( () => loginBooleanData.findDialog, ( newValue : boolean ) => {
  if( !newValue ) {
    setTimeout( () => {
      loginData.findTitle = "";
    }, 200);
  }
});

watch( () => loginBooleanData.alert, ( newValue : boolean ) => {
  if ( newValue ) {
    setTimeout( () => {
      loginBooleanData.alert = false;
    }, 1000);
  }
});

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  document.documentElement.removeAttribute( "dark-mode" );
})

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <div :class="cx( LoginStyle.Default )">
    <div :class="cx( LoginStyle.Container )">
      <div :class="cx( LoginStyle.FormBg )">
        <img src="@/assets/images/bg/bg_login.jpg" alt="loginBg">
      </div>
      <div :class="cx( LoginStyle.FormCard )">
        <div :class="cx( LoginStyle.Title )" @click="moveMain">
          <img src="@/assets/images/logo/logo.png" alt="logo">
          <span>Min U Ju - IntelliJ IDEA</span>
        </div>
        <div :class="cx( LoginStyle.Content )">
          <form :class="cx( LoginStyle.Form )">
            <div :class="cx( LoginStyle.InfoArea )">
              <div :class="cx( LoginStyle.InfoItem )">
                <div class="is-flex">
                  <span class="title">아이디</span>
                  <v-tooltip
                    content-class="black-tooltip"
                    location="right"
                  >
                    <template v-slot:activator="{ props }">
                      <span v-bind="props" class="material-icons">error_outline</span>
                    </template>
                    <div>
                      <span>초기 아이디 / 비밀번호</span>
                      <ul>
                        <li>
                          <span>아이디 : testUser</span>
                        </li>
                        <li>
                          <span>비밀번호 : 0000</span>
                        </li>
                      </ul>
                    </div>
                  </v-tooltip>
                </div>
                <v-text-field
                  v-model="loginData.id"
                  variant="solo"
                  placeholder="아이디를 입력해주세요."
                />
              </div>
              <div :class="cx( LoginStyle.InfoItem )">
                <span class="title">비밀번호</span>
                <v-text-field
                  v-model="loginData.password"
                  variant="solo"
                  placeholder="패스워드를 입력해주세요."
                  :append-icon="loginBooleanData.passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="loginBooleanData.passwordShow ? 'text' : 'password'"
                  @click:append="loginBooleanData.passwordShow = !loginBooleanData.passwordShow"
                />
              </div>
            </div>
            <div :class="cx( LoginStyle.LoginBtn )">
              <BaseBtn @on-click="onLogin">
                <span>로그인</span>
              </BaseBtn>
            </div>
          </form>
          <div :class="cx( LoginStyle.MenuList )">
            <ul>
              <li
                v-for="( item, index ) in loginData.menuList"
                :key="index"
              >
                <span v-text="item.title" @click="item.event( item )"></span>
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
