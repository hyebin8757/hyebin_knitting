<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {useRouter} from "vue-router";
import {useUtil} from "~/utils/useUtil";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import {loginStyle} from "~/components/login/style/loginStyle";

const router = useRouter();
const { isEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/


/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const loginData = reactive({
  id : "",
  password : "",
  menuList : [
    {
      title : "아이디 찾기",
      path : "",
    },
    {
      title : "비밀번호 찾기",
      path : "",
    },
    {
      title : "회원가입",
      path : "",
    }
  ],
})

const loginBooleanData = reactive({
  passwordShow : false,
})

/************************************************************
 * Function
 ************************************************************/
const menuEvent = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  router.push( path );
}
/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <div :class="cx( loginStyle.Default )">
    <div :class="cx( loginStyle.FormCard )">
      <div :class="cx( loginStyle.Title )">
        <img src="@/assets/images/logo/logo.png" alt="logo">
        <span>IntelliJ IDEA</span>
      </div>
      <div :class="cx( loginStyle.Content )">
        <form :class="cx( loginStyle.Form )">
          <div :class="cx( loginStyle.InfoArea )">
            <div :class="cx( loginStyle.InfoItem )">
              <span class="title">아이디</span>
              <v-text-field
                  v-model="loginData.id"
                  variant="solo">
              </v-text-field>
            </div>
            <div :class="cx( loginStyle.InfoItem )">
              <span class="title">비밀번호</span>
              <v-text-field
                  v-model="loginData.password"
                  variant="solo"
                  :append-icon="loginBooleanData.passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="loginBooleanData.passwordShow ? 'text' : 'password'"
                  @click:append="loginBooleanData.passwordShow = !loginBooleanData.passwordShow"
              />
            </div>
          </div>
          <div :class="cx( loginStyle.LoginBtn )">
            <BaseBtn>
              <span>로그인</span>
            </BaseBtn>
          </div>
        </form>
        <div :class="cx( loginStyle.MenuList )">
          <ul>
            <li
                v-for="( item, index ) in loginData.menuList"
                :key="index"
            >
              <span v-text="item.title" @click="menuEvent( item.path )"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>