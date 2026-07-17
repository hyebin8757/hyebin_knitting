<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject, computed, reactive } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import BaseAlert from "~/components/base/alert/BaseAlert.vue";

/************************************************************
 * Style
 ************************************************************/
import { MypageStyle } from "~/assets/style/pages/user/MypageStyle";

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
const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const { isEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const name = "홍길동";
const role = "조합원 (2조)";
const hireDate = "2024-03-02";
const birthDate = "1992-07-28";
const phone = "010-5678-1234";

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const newCredentials = reactive({
  id: "",
  password: "",
});

const isConfirmOpen = ref(false);
const isSuccessOpen = ref(false);
const isErrorOpen = ref(false);
const isLogoutConfirmOpen = ref(false);
const errorText = ref("");

const loginUser = ref(userStore.getLoginUser());

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const handleLogout = () => {
  isLogoutConfirmOpen.value = true;
};

const confirmLogout = () => {
  isLogoutConfirmOpen.value = false;
  userStore.setLogin(false);
  router.push("/login");
};

const triggerChange = () => {
  if (isEmpty(newCredentials.id) || isEmpty(newCredentials.password)) {
    errorText.value = "새로운 아이디와 비밀번호를 모두 입력해 주세요.";
    isErrorOpen.value = true;
    return;
  }
  
  if (newCredentials.id.length < 4 || newCredentials.password.length < 4) {
    errorText.value = "아이디와 비밀번호는 각각 최소 4글자 이상이어야 합니다.";
    isErrorOpen.value = true;
    return;
  }

  isConfirmOpen.value = true;
};

const confirmChange = () => {
  isConfirmOpen.value = false;
  
  // 변경 실행
  userStore.changeCredentials(newCredentials.id, newCredentials.password);
  
  // 로컬 바인딩 업데이트
  loginUser.value = userStore.getLoginUser();
  isSuccessOpen.value = true;
  
  // 폼 비우기
  newCredentials.id = "";
  newCredentials.password = "";
};

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  loginUser.value = userStore.getLoginUser();
});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta({
  layout: "user-layout",
});
</script>

<template>
  <div :class="cx('mypage-screen', MypageStyle.Default)">
    <!-- Header Avatar Profile Card -->
    <div :class="cx('profile-header', MypageStyle.ProfileHeaderCard)">
      <div class="avatar">홍</div>
      <div class="name">{{ name }}</div>
      <div class="sub">{{ role }}</div>
    </div>

    <!-- User Information Card List -->
    <div :class="cx('info-list', MypageStyle.InfoListCard)">
      <div class="info-row">
        <span class="label">현재 로그인 ID</span>
        <span class="value">{{ loginUser?.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">휴대전화</span>
        <span class="value">{{ phone }}</span>
      </div>
      <div class="info-row">
        <span class="label">입사일자</span>
        <span class="value">{{ hireDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">생년월일</span>
        <span class="value">{{ birthDate }}</span>
      </div>
    </div>

    <!-- ID/Password One-time Change Area -->
    <div :class="cx('change-credentials-card', MypageStyle.ChangeCard)">
      <div class="title">
        <i class="material-icons">lock_reset</i>
        <span>로그인 정보 변경</span>
      </div>

      <!-- If already changed, show completed message -->
      <div v-if="loginUser?.hasChangedCredentials" class="completed-message">
        <i class="material-icons">check_circle</i>
        <span>로그인 정보 변경이 완료되었습니다 (재변경 불가).</span>
      </div>

      <!-- Else, show the form -->
      <template v-else>
        <div class="warning-box">
          <i class="material-icons">info_outline</i>
          <span>
            ID/비밀번호 변경은 <strong>최초 1회만 가능</strong>하며, 변경 후에는 안전을 위해 다시 수정하실 수 없습니다.
          </span>
        </div>

        <div class="input-group">
          <div class="input-item">
            <label>새 아이디</label>
            <v-text-field
              v-model="newCredentials.id"
              variant="solo"
              placeholder="변경할 아이디 입력"
              hide-details
            />
          </div>
          <div class="input-item">
            <label>새 비밀번호</label>
            <v-text-field
              v-model="newCredentials.password"
              variant="solo"
              type="password"
              placeholder="변경할 비밀번호 입력"
              hide-details
            />
          </div>
        </div>

        <v-btn class="change-btn" @click="triggerChange">
          ID/비밀번호 변경 적용
        </v-btn>
      </template>
    </div>

    <!-- Action Areas (Logout Button) -->
    <div :class="cx('logout-container', MypageStyle.LogoutArea)">
      <v-btn class="logout-btn" @click="handleLogout">
        로그아웃
      </v-btn>
    </div>

    <!-- Confirmation Warning Alert Dialog -->
    <v-dialog v-model="isConfirmOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--secondary-darken-color-1); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">warning</i>
          <span>변경 확인 알림</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          ID와 비밀번호를 변경하시겠습니까?<br />
          변경 완료 후에는 <strong>추가 변경이 절대 불가능</strong>합니다.
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isConfirmOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="confirmChange">확인 및 변경</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Alert Dialog -->
    <v-dialog v-model="isSuccessOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--system-green-color); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">check_circle_outline</i>
          <span>변경 완료</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          아이디 및 비밀번호 변경이 성공적으로 완료되었습니다.
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isSuccessOpen = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Alert Dialog -->
    <v-dialog v-model="isErrorOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--system-red-color); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">error_outline</i>
          <span>입력 오류</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          {{ errorText }}
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn style="background: rgba(255, 255, 255, 0.1) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isErrorOpen = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Logout Confirmation Dialog -->
    <v-dialog v-model="isLogoutConfirmOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--system-red-color); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">exit_to_app</i>
          <span>로그아웃 확인</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          정말 로그아웃 하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isLogoutConfirmOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, rgba(225, 60, 60, 0.8) 0%, rgba(180, 30, 30, 0.8) 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="confirmLogout">로그아웃</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
