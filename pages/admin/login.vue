<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const router = useRouter();
const store = useKnittingStore();

const password = ref("");
const errorMessage = ref("");
const showPassword = ref(false);

const handleLogin = () => {
  errorMessage.value = "";
  if (!password.value) {
    errorMessage.value = "비밀번호를 입력해주세요.";
    return;
  }

  const success = store.loginAdmin(password.value);
  if (success) {
    router.push("/admin");
  } else {
    errorMessage.value = "비밀번호가 일치하지 않습니다. 다시 확인해주세요.";
  }
};
</script>

<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="brand-circle">
          <i class="material-icons" style="font-size: 2rem; color: #ff4d6d;">lock</i>
        </div>
        <h1 class="login-title">뜨개 공방 관리자 로그인</h1>
        <p class="login-subtitle">주문 내역, 환불 요청, 고객 의견 관리를 위한 전용 페이지입니다.</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="admin-pw">관리자 비밀번호</label>
          <div class="pw-input-wrapper">
            <input
              id="admin-pw"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="pw-input"
              placeholder="비밀번호 입력"
              autofocus
            />
            <button
              type="button"
              class="btn-toggle-pw"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <i class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</i>
            </button>
          </div>
          <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>
        </div>

        <button type="submit" class="btn-login">
          <span>관리자 대시보드 입장</span>
          <i class="material-icons">login</i>
        </button>

        <div class="back-link-wrap">
          <nuxt-link to="/" class="back-home-link">← 쇼핑몰 홈으로 돌아가기</nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: radial-gradient(circle at top, #fff2f4 0%, #faf7f2 70%);
}

.login-card {
  background: #ffffff;
  border: 1.5px solid #ebdcd0;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  padding: 36px 28px;
  box-shadow: 0 12px 36px rgba(78, 42, 50, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-circle {
  font-size: 2.2rem;
  width: 64px;
  height: 64px;
  background: #fff0f3;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(255, 117, 143, 0.2);
}

.login-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 0.84rem;
  color: #8c7e7b;
  margin: 0;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #3f2f2c;
}

.pw-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.pw-input {
  width: 100%;
  border: 1.5px solid #ebdcd0;
  border-radius: 12px;
  padding: 12px 42px 12px 14px;
  font-size: 0.95rem;
  background: #fdfcfb;
  outline: none;
  transition: all 0.2s;
}

.pw-input:focus {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
  background: #ffffff;
}

.btn-toggle-pw {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #9c8e8b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: 600;
  margin-top: 4px;
}

.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff758f 0%, #ff4d6d 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: all 0.2s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255, 77, 109, 0.45);
}

.back-link-wrap {
  text-align: center;
}

.back-home-link {
  color: #8c7e7b;
  font-size: 0.82rem;
  text-decoration: none;
}

.back-home-link:hover {
  color: #ff4d6d;
}
</style>
