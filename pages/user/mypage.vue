<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  inject,
  computed,
  reactive,
} from "vue";
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
const userRole = computed(() => userStore.userRole);

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const name = computed(() => userStore.loggedInUser?.name || "홍길동");
const role = computed(() => userStore.loggedInUser ? `${userStore.loggedInUser.role} (${userStore.loggedInUser.group}조)` : "관리자");
const hireDate = computed(() => userStore.loggedInUser?.joinDate || "2024-03-02");
const birthDate = computed(() => userStore.loggedInUser?.birthDate || "1992-07-28");
const phone = computed(() => userStore.loggedInUser?.phone || "010-5678-1234");

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const newCredentials = reactive({
  id: "",
  password: "",
  phone: "",
  joinDate: "",
  birthDate: "",
});

const isConfirmOpen = ref(false);
const isSuccessOpen = ref(false);
const isErrorOpen = ref(false);
const isLogoutConfirmOpen = ref(false);
const errorText = ref("");

const hasChangedCredentials = computed(() => {
  const user = userStore.loggedInUser;
  const name = user?.name;
  const localFlag = name ? localStorage.getItem(`changed_credentials_${name}`) === "true" : false;
  
  // 1) explicitly hasChangedCredentials is true
  // 2) or localFlag is true
  // 3) or loginId is present and different from name (already changed)
  const isIdChanged = !!(user?.loginId && user?.loginId !== user?.name);
  
  return !!(
    user?.hasChangedCredentials ||
    loginUser.value?.hasChangedCredentials ||
    localFlag ||
    isIdChanged
  );
});

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const formatPhoneStr = (val: string): string => {
  if (!val) return "";
  const nums = val.replace(/[^0-9]/g, "");
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
};

const formatDateStr = (val: string): string => {
  if (!val) return "";
  const nums = val.replace(/[^0-9]/g, "");
  if (nums.length <= 4) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 4)}-${nums.slice(4)}`;
  return `${nums.slice(0, 4)}-${nums.slice(4, 6)}-${nums.slice(6, 8)}`;
};

const onPhoneInput = () => {
  newCredentials.phone = formatPhoneStr(newCredentials.phone);
};

const onJoinDateInput = () => {
  newCredentials.joinDate = formatDateStr(newCredentials.joinDate);
};

const onBirthDateInput = () => {
  newCredentials.birthDate = formatDateStr(newCredentials.birthDate);
};

const handleLogout = () => {
  isLogoutConfirmOpen.value = true;
};

const confirmLogout = () => {
  isLogoutConfirmOpen.value = false;
  userStore.logout();
};

const triggerChange = () => {
  if (isEmpty(newCredentials.password)) {
    errorText.value = "새로운 비밀번호를 입력해 주세요.";
    isErrorOpen.value = true;
    return;
  }

  if (newCredentials.password.length < 4) {
    errorText.value = "비밀번호는 최소 4글자 이상이어야 합니다.";
    isErrorOpen.value = true;
    return;
  }

  // ID가 입력되지 않은 경우 기존 ID(이름)로 대체
  if (isEmpty(newCredentials.id)) {
    newCredentials.id = userStore.loggedInUser?.loginId || userStore.loggedInUser?.name || "";
  }

  // 휴대폰 번호, 입사일, 생년월일이 작성되지 않았을 경우 기존 정보 유지
  if (isEmpty(newCredentials.phone)) newCredentials.phone = userStore.loggedInUser?.phone || "";
  if (isEmpty(newCredentials.joinDate)) newCredentials.joinDate = userStore.loggedInUser?.joinDate || "";
  if (isEmpty(newCredentials.birthDate)) newCredentials.birthDate = userStore.loggedInUser?.birthDate || "";

  // 하이픈 자동 포맷팅 2차 적용
  newCredentials.phone = formatPhoneStr(newCredentials.phone);
  newCredentials.joinDate = formatDateStr(newCredentials.joinDate);
  newCredentials.birthDate = formatDateStr(newCredentials.birthDate);

  isConfirmOpen.value = true;
};

const confirmChange = async () => {
  isConfirmOpen.value = false;

  const currentName = userStore.loggedInUser?.name;
  if (currentName) {
    localStorage.setItem(`changed_credentials_${currentName}`, "true");
  }

  // 변경 실행
  await userStore.changeCredentials(
    newCredentials.id,
    newCredentials.password,
    newCredentials.phone,
    newCredentials.joinDate,
    newCredentials.birthDate
  );

  // 로컬 바인딩 업데이트
  loginUser.value = userStore.getLoginUser();
  isSuccessOpen.value = true;

  // 인풋값을 최신 변경 데이터 포맷으로 유지
  if (userStore.loggedInUser) {
    newCredentials.id = userStore.loggedInUser.loginId || userStore.loggedInUser.name || "";
    newCredentials.phone = userStore.loggedInUser.phone || "";
    newCredentials.joinDate = userStore.loggedInUser.joinDate || "";
    newCredentials.birthDate = userStore.loggedInUser.birthDate || "";
  }
};

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  loginUser.value = userStore.getLoginUser();
  if (userStore.loggedInUser) {
    newCredentials.id = userStore.loggedInUser.loginId || userStore.loggedInUser.name || "";
    newCredentials.phone = formatPhoneStr(userStore.loggedInUser.phone || "");
    newCredentials.joinDate = formatDateStr(userStore.loggedInUser.joinDate || "");
    newCredentials.birthDate = formatDateStr(userStore.loggedInUser.birthDate || "");
  }
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
      <div class="avatar">{{ name ? name.slice(0, 1) : '홍' }}</div>
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
    <div
      v-if="userRole !== 'admin'"
      :class="cx('change-credentials-card', MypageStyle.ChangeCard)"
    >
      <div class="title">
        <i class="material-icons">lock_reset</i>
        <span>로그인 정보 변경</span>
      </div>

      <!-- If already changed, show completed banner -->
      <div v-if="hasChangedCredentials" class="completed-message" style="margin-bottom: 1.6rem; padding: 1.2rem 1.6rem; background: rgba(26, 209, 177, 0.12); border: 1px solid rgba(26, 209, 177, 0.3); border-radius: 1rem; color: #1ad1b1; display: flex; align-items: center; gap: 0.8rem; font-size: 1.3rem; font-weight: 600;">
        <i class="material-icons" style="font-size: 1.8rem; color: #1ad1b1;">check_circle</i>
        <span>로그인 정보 변경이 완료되었습니다 (재변경 불가).</span>
      </div>

      <div v-else class="warning-box">
        <i class="material-icons">info_outline</i>
        <span>
          ID/비밀번호 변경은 <strong>최초 1회만 가능</strong>하며, 변경 후에는
          안전을 위해 다시 수정하실 수 없습니다.
        </span>
      </div>

      <div class="input-group">
        <div class="input-item">
          <label>새 아이디</label>
          <v-text-field
            v-model="newCredentials.id"
            variant="solo"
            placeholder="변경할 아이디 입력"
            :disabled="hasChangedCredentials"
            hide-details
          />
        </div>
        <div class="input-item">
          <label>새 비밀번호</label>
          <v-text-field
            v-model="newCredentials.password"
            variant="solo"
            type="password"
            placeholder="변경할 비밀번호 입력 (필수)"
            :disabled="hasChangedCredentials"
            hide-details
          />
        </div>
        <div class="input-item">
          <label>휴대전화</label>
          <v-text-field
            v-model="newCredentials.phone"
            variant="solo"
            placeholder="예: 010-1234-5678"
            :disabled="hasChangedCredentials"
            hide-details
            @update:model-value="onPhoneInput"
          />
        </div>
        <div class="input-item">
          <label>입사일자</label>
          <v-text-field
            v-model="newCredentials.joinDate"
            variant="solo"
            placeholder="예: 2024-03-02"
            :disabled="hasChangedCredentials"
            hide-details
            @update:model-value="onJoinDateInput"
          />
        </div>
        <div class="input-item">
          <label>생년월일</label>
          <v-text-field
            v-model="newCredentials.birthDate"
            variant="solo"
            placeholder="예: 1992-07-28"
            :disabled="hasChangedCredentials"
            hide-details
            @update:model-value="onBirthDateInput"
          />
        </div>
      </div>

      <v-btn 
        class="change-btn" 
        :disabled="hasChangedCredentials"
        :style="hasChangedCredentials ? { opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,255,255,0.08) !important', color: 'rgba(255,255,255,0.4) !important' } : {}"
        @click="triggerChange"
      >
        {{ hasChangedCredentials ? '변경 완료됨 (재변경 불가)' : '로그인 정보 및 개인정보 변경 적용' }}
      </v-btn>
    </div>

    <!-- Action Areas (Logout Button) -->
    <div :class="cx('logout-container', MypageStyle.LogoutArea)">
      <v-btn class="logout-btn" @click="handleLogout"> 로그아웃 </v-btn>
    </div>

    <!-- Confirmation Warning Alert Dialog -->
    <v-dialog v-model="isConfirmOpen" max-width="320">
      <v-card
        class="pa-6"
        style="
          background: #0d1e33;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.6rem;
          color: #ffffff;
        "
      >
        <v-card-title
          class="text-h6 font-weight-bold px-0"
          style="
            color: var(--secondary-darken-color-1);
            display: flex;
            align-items: center;
            gap: 0.8rem;
          "
        >
          <i class="material-icons">warning</i>
          <span>변경 확인 알림</span>
        </v-card-title>
        <v-card-text
          class="py-4 px-0"
          style="
            font-size: 1.4rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          ID와 비밀번호를 변경하시겠습니까?<br />
          변경 완료 후에는 <strong>추가 변경이 절대 불가능</strong>합니다.
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn
            variant="text"
            style="
              color: rgba(255, 255, 255, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.8rem;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="isConfirmOpen = false"
            >취소</v-btn
          >
          <v-btn
            style="
              background: linear-gradient(
                135deg,
                var(--primary-darken-color-1) 0%,
                #153c6c 100%
              ) !important;
              color: white !important;
              border-radius: 0.8rem;
              font-weight: 600;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="confirmChange"
            >확인 및 변경</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Alert Dialog -->
    <v-dialog v-model="isSuccessOpen" max-width="320">
      <v-card
        class="pa-6"
        style="
          background: #0d1e33;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.6rem;
          color: #ffffff;
        "
      >
        <v-card-title
          class="text-h6 font-weight-bold px-0"
          style="
            color: var(--system-green-color);
            display: flex;
            align-items: center;
            gap: 0.8rem;
          "
        >
          <i class="material-icons">check_circle_outline</i>
          <span>변경 완료</span>
        </v-card-title>
        <v-card-text
          class="py-4 px-0"
          style="
            font-size: 1.4rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          아이디 및 비밀번호 변경이 성공적으로 완료되었습니다.
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn
            style="
              background: linear-gradient(
                135deg,
                var(--primary-darken-color-1) 0%,
                #153c6c 100%
              ) !important;
              color: white !important;
              border-radius: 0.8rem;
              font-weight: 600;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="isSuccessOpen = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Alert Dialog -->
    <v-dialog v-model="isErrorOpen" max-width="320">
      <v-card
        class="pa-6"
        style="
          background: #0d1e33;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.6rem;
          color: #ffffff;
        "
      >
        <v-card-title
          class="text-h6 font-weight-bold px-0"
          style="
            color: var(--system-red-color);
            display: flex;
            align-items: center;
            gap: 0.8rem;
          "
        >
          <i class="material-icons">error_outline</i>
          <span>입력 오류</span>
        </v-card-title>
        <v-card-text
          class="py-4 px-0"
          style="
            font-size: 1.4rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          {{ errorText }}
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn
            style="
              background: rgba(255, 255, 255, 0.1) !important;
              color: white !important;
              border-radius: 0.8rem;
              font-weight: 600;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="isErrorOpen = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Logout Confirmation Dialog -->
    <v-dialog v-model="isLogoutConfirmOpen" max-width="320">
      <v-card
        class="pa-6"
        style="
          background: #0d1e33;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.6rem;
          color: #ffffff;
        "
      >
        <v-card-title
          class="text-h6 font-weight-bold px-0"
          style="
            color: var(--system-red-color);
            display: flex;
            align-items: center;
            gap: 0.8rem;
          "
        >
          <i class="material-icons">exit_to_app</i>
          <span>로그아웃 확인</span>
        </v-card-title>
        <v-card-text
          class="py-4 px-0"
          style="
            font-size: 1.4rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          정말 로그아웃 하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn
            variant="text"
            style="
              color: rgba(255, 255, 255, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 0.8rem;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="isLogoutConfirmOpen = false"
            >취소</v-btn
          >
          <v-btn
            style="
              background: linear-gradient(
                135deg,
                rgba(225, 60, 60, 0.8) 0%,
                rgba(180, 30, 30, 0.8) 100%
              ) !important;
              color: white !important;
              border-radius: 0.8rem;
              font-weight: 600;
              padding: 0.8rem 2rem !important;
              min-width: 8rem !important;
              height: auto !important;
              font-size: 1.4rem;
            "
            @click="confirmLogout"
            >로그아웃</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
