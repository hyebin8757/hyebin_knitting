<script setup lang="ts">
import { useKnittingStore } from "~/stores/useKnittingStore";

const store = useKnittingStore();

const copyAccount = () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(`${store.settings.bankName} ${store.settings.accountNumber}`);
    store.showToast(`계좌번호가 복사되었습니다! (${store.settings.bankName} ${store.settings.accountNumber}) ✨`);
  }
};
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand-line">
          <span class="yarn-badge">🧶 앉은누이 뜨개옷장</span>
          <span class="hand-craft-badge">100% 핸드메이드</span>
        </div>
        <p class="brand-desc">
          {{ store.siteNotices.shopIntro || '동글동글 귀여운 인형 친구들을 위한 사랑스러운 맞춤 뜨개옷 & 소품 공방입니다.' }}
        </p>
      </div>

      <div class="footer-info-grid">
        <div class="info-block">
          <h4 class="block-title">💳 공식 입금 계좌</h4>
          <div class="account-card">
            <span class="acc-text">{{ store.settings.bankName }} {{ store.settings.accountNumber }}</span>
            <span class="acc-holder">예금주: {{ store.settings.accountHolder }}</span>
            <button class="btn-copy" @click="copyAccount">계좌 복사</button>
          </div>
        </div>

        <div class="info-block">
          <h4 class="block-title">📬 제작 및 상담 안내</h4>
          <p class="info-line">Instagram: <b>{{ store.siteNotices.instagramId }}</b> (DM 문의 환영)</p>
          <p class="info-line">제작 기간: {{ store.siteNotices.makingPeriod }}</p>
          <p class="info-line">배송: {{ store.siteNotices.courierInfo }}</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copy-text">© 2026 앉은누이 뜨개옷장 (혜빈이와 먼작콩). All rights reserved.</p>
        <div class="footer-links">
          <button class="text-link" @click="store.isFeedbackModalOpen = true">의견/건의 보내기</button>
          <span class="sep">|</span>
          <button class="text-link" @click="store.isOrderLookupModalOpen = true">주문 상태 조회</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #fbf7f2;
  border-top: 1px solid #ebdcd0;
  padding: 22px 16px 80px;
  color: #6b5c58;
  font-size: 0.85rem;
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 640px) {
  .site-footer {
    padding: 18px 12px 76px;
  }
  .footer-inner {
    gap: 14px;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.yarn-badge {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2b1f1d;
}

.hand-craft-badge {
  background: #fff0f3;
  color: #ff4d6d;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #ffd6de;
}

.brand-desc {
  font-size: 0.82rem;
  line-height: 1.6;
  color: #8c7e7b;
  margin: 0;
  white-space: pre-line;
  word-break: keep-all;
}

.footer-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #3f2f2c;
  margin: 0;
}

.account-card {
  background: #ffffff;
  border: 1px solid #ebdcd0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.acc-text {
  font-weight: 800;
  color: #2b1f1d;
  font-size: 0.95rem;
}

.acc-holder {
  font-size: 0.8rem;
  color: #8c7e7b;
}

.btn-copy {
  align-self: flex-start;
  margin-top: 6px;
  background: #f7f3ee;
  border: 1px solid #e0d4c8;
  color: #5c4e4b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-copy:hover {
  background: #ece3d8;
}

.info-line {
  margin: 0;
  font-size: 0.82rem;
  color: #6b5c58;
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #ebdcd0;
  padding-top: 16px;
}

.copy-text {
  font-size: 0.76rem;
  color: #a39591;
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

.text-link {
  background: none;
  border: none;
  color: #8c7e7b;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  text-decoration: none;
}

.text-link:hover {
  color: #ff4d6d;
}

.sep {
  color: #d8ccc0;
}
</style>
