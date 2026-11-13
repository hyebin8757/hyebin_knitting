<script setup lang="ts">
import { ref, computed } from "vue";
import { useKnittingStore, type OrderItem } from "~/stores/useKnittingStore";

const store = useKnittingStore();

const searchQuery = ref("");
const searched = ref(false);
const activeRefundOrderId = ref<string | null>(null);

const refundForm = ref({
  buyerName: "",
  phone: "",
  amount: 0,
  reason: "",
  refundBank: "카카오뱅크",
  refundAccount: "",
  refundHolder: "",
});

const closeModal = () => {
  store.isOrderLookupModalOpen = false;
  searchQuery.value = "";
  searched.value = false;
  activeRefundOrderId.value = null;
};

// 검색 결과
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().replace(/[^0-9a-zA-Z]/g, "");
  if (!q) return [];
  return store.orders.filter((o) => {
    const cleanPhone = o.phone.replace(/[^0-9]/g, "");
    const cleanId = o.id.toLowerCase().replace(/[^0-9a-zA-Z]/g, "");
    const cleanInsta = o.instagramId.toLowerCase();
    const cleanName = o.buyerName.toLowerCase();
    return (
      cleanPhone.includes(q) ||
      cleanId.includes(q) ||
      cleanInsta.includes(q) ||
      cleanName.includes(q)
    );
  });
});

const onSearch = () => {
  if (!searchQuery.value.trim()) {
    store.showAlert("전화번호, 주문번호 또는 주문자명을 입력해주세요.", { type: "warning", title: "검색어 입력" });
    return;
  }
  store.checkAndCancelExpiredOrders();
  searched.value = true;
};

const copyText = (text: string, label: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    store.showToast(`${label}이(가) 복사되었습니다: ${text}`);
  }
};

const openRefundForm = (order: OrderItem) => {
  activeRefundOrderId.value = order.id;
  refundForm.value = {
    buyerName: order.buyerName,
    phone: order.phone,
    amount: order.totalAmount,
    reason: "",
    refundBank: "카카오뱅크",
    refundAccount: "",
    refundHolder: order.depositorName || order.buyerName,
  };
};

const submitRefund = (orderId: string) => {
  if (!refundForm.value.reason.trim()) {
    store.showAlert("환불 사유를 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!refundForm.value.refundAccount.trim()) {
    store.showAlert("환불받으실 계좌번호를 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }
  if (!refundForm.value.refundHolder.trim()) {
    store.showAlert("예금주명을 입력해주세요.", { type: "warning", title: "입력 확인" });
    return;
  }

  store.requestRefund(orderId, {
    buyerName: refundForm.value.buyerName,
    phone: refundForm.value.phone,
    amount: refundForm.value.amount,
    reason: refundForm.value.reason,
    refundBank: refundForm.value.refundBank,
    refundAccount: refundForm.value.refundAccount,
    refundHolder: refundForm.value.refundHolder,
  });

  store.showAlert("환불 요청이 접수되었습니다! 관리자가 확인 후 계좌로 입금해 드립니다.", {
    title: "환불 접수 완료",
    type: "success",
  });
  activeRefundOrderId.value = null;
};
</script>

<template>
  <div v-if="store.isOrderLookupModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <div class="title-wrap">
          <span class="icon-bubble">🔍</span>
          <div>
            <h3 class="modal-title">내 주문 조회 / 배송 상태</h3>
            <p class="modal-subtitle">주문서 작성 시 기재한 연락처나 주문번호로 실시간 확인하세요.</p>
          </div>
        </div>
        <button class="close-btn" @click="closeModal" aria-label="닫기">
          <i class="material-icons">close</i>
        </button>
      </div>

      <div class="modal-body">
        <!-- 검색 입력 바 -->
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="연락처(예: 01012345678) 또는 주문번호 입력"
            @keyup.enter="onSearch"
          />
          <button class="search-btn" @click="onSearch">조회</button>
        </div>

        <!-- 검색 전 안내 -->
        <div v-if="!searched" class="guide-box">
          <p class="guide-title">💡 간편 조회 팁</p>
          <ul class="guide-list">
            <li>주문 시 입력하신 <b>휴대폰 번호(뒷자리나 전체)</b>를 입력하시면 바로 조회가 가능합니다.</li>
            <li>주문 완료 화면에 발급된 <b>주문번호(ORD-...)</b>로도 즉시 검색할 수 있어요.</li>
          </ul>
        </div>

        <!-- 검색 후 결과 없음 -->
        <div v-else-if="searchResults.length === 0" class="empty-results">
          <span class="empty-icon">📂</span>
          <p class="empty-text">일치하는 주문 내역을 찾을 수 없습니다.</p>
          <p class="empty-sub">전화번호나 주문번호를 다시 한번 확인해 주세요.</p>
        </div>

        <!-- 주문 결과 목록 -->
        <div v-else class="results-list">
          <div v-for="order in searchResults" :key="order.id" class="order-result-card">
            <div class="card-head">
              <div class="order-id-group">
                <span class="order-id">{{ order.id }}</span>
                <span class="order-date">{{ order.createdAt }}</span>
              </div>
              <span class="status-badge" :style="{ backgroundColor: store.getStatusColor(order.status) }">
                {{ store.getStatusLabel(order.status) }}
              </span>
            </div>

            <!-- 진행 단계 바 -->
            <div class="stepper-wrap" v-if="order.status !== 'cancelled'">
              <div class="step-item" :class="{ done: ['pending', 'paid', 'making', 'shipping', 'completed'].includes(order.status), active: order.status === 'pending' }">
                <div class="step-dot">1</div>
                <span class="step-label">입금대기</span>
              </div>
              <div class="step-line" :class="{ filled: ['paid', 'making', 'shipping', 'completed'].includes(order.status) }"></div>
              <div class="step-item" :class="{ done: ['paid', 'making', 'shipping', 'completed'].includes(order.status), active: order.status === 'paid' }">
                <div class="step-dot">2</div>
                <span class="step-label">입금확인</span>
              </div>
              <div class="step-line" :class="{ filled: ['making', 'shipping', 'completed'].includes(order.status) }"></div>
              <div class="step-item" :class="{ done: ['making', 'shipping', 'completed'].includes(order.status), active: order.status === 'making' }">
                <div class="step-dot">3</div>
                <span class="step-label">제작 중</span>
              </div>
              <div class="step-line" :class="{ filled: ['shipping', 'completed'].includes(order.status) }"></div>
              <div class="step-item" :class="{ done: ['shipping', 'completed'].includes(order.status), active: order.status === 'shipping' }">
                <div class="step-dot">4</div>
                <span class="step-label">배송 중</span>
              </div>
              <div class="step-line" :class="{ filled: order.status === 'completed' }"></div>
              <div class="step-item" :class="{ done: order.status === 'completed', active: order.status === 'completed' }">
                <div class="step-dot">5</div>
                <span class="step-label">완료</span>
              </div>
            </div>

            <!-- 취소/환불 상태 알림 -->
            <div v-else class="cancelled-notice">
              <div class="cancel-main-msg">⚠️ 본 주문은 취소되었습니다.</div>
              <div v-if="order.statusHistory?.length && order.statusHistory[order.statusHistory.length - 1].note" class="cancel-reason-text">
                사유: {{ order.statusHistory[order.statusHistory.length - 1].note }}
              </div>
            </div>

            <!-- 주문 첨부 맞춤제작 / 완성 사진 -->
            <div v-if="order.customImage" class="buyer-custom-photo-card">
              <span class="custom-photo-badge">📸 맞춤제작 / 주문 첨부 사진</span>
              <div class="custom-photo-wrapper" @click="store.previewImageUrl = order.customImage">
                <img :src="order.customImage" alt="주문 첨부 사진" class="buyer-attached-photo" />
                <span class="photo-hint-tag">🔍 크게보기</span>
              </div>
            </div>

            <!-- 주문 상세 내역 -->
            <div class="order-summary-box">
              <div class="summary-row">
                <span class="sum-label">주문자</span>
                <span class="sum-value">{{ order.buyerName }} (인스타: @{{ order.instagramId }})</span>
              </div>
              <div class="summary-row">
                <span class="sum-label">배송지</span>
                <span class="sum-value">{{ order.address }}</span>
              </div>
              <div class="summary-row">
                <span class="sum-label">배송방식</span>
                <span class="sum-value">{{ order.shippingType }}</span>
              </div>
              <div v-if="order.trackingNumber" class="summary-row highlight">
                <span class="sum-label">운송장번호</span>
                <span class="sum-value font-mono">
                  {{ order.trackingNumber }}
                  <button class="mini-copy-btn" @click="copyText(order.trackingNumber!, '운송장번호')">복사</button>
                </span>
              </div>
              <div class="summary-row">
                <span class="sum-label">주문상품</span>
                <div class="order-items-sublist">
                  <div v-for="item in order.items" :key="item.productId" class="item-pill">
                    <img :src="item.image" :alt="item.productName" class="item-thumb" />
                    <span>{{ item.productName }} x {{ item.quantity }}개</span>
                  </div>
                </div>
              </div>
              <div class="summary-row total-row">
                <span class="sum-label">총 결제금액</span>
                <span class="total-price">{{ order.totalAmount.toLocaleString() }}원</span>
              </div>
            </div>

            <!-- 입금 대기 상태일 때 계좌 안내 카드 -->
            <div v-if="order.status === 'pending'" class="pending-bank-box">
              <div class="bank-top">
                <span class="badge-tag">입금 안내</span>
                <span class="bank-exp">⏱️ 24시간 이내 미입금 시 주문이 자동 취소됩니다.</span>
              </div>
              <div class="bank-info-card">
                <div class="bank-acc-details font-mono">
                  <span class="bank-name-label">{{ store.settings.bankName }}</span>
                  <span class="bank-number-bold">{{ store.settings.accountNumber }}</span>
                  <span class="bank-holder-label">(예금주: {{ store.settings.accountHolder }})</span>
                </div>
                <button
                  type="button"
                  class="btn-copy-account"
                  @click="copyText(`${store.settings.bankName} ${store.settings.accountNumber}`, '계좌번호')"
                >
                  <i class="material-icons">content_copy</i>
                  <span>계좌번호 복사</span>
                </button>
              </div>
            </div>

            <!-- 환불 신청 버튼 / 폼 -->
            <div class="card-footer-actions">
              <button
                v-if="['pending', 'paid'].includes(order.status) && activeRefundOrderId !== order.id"
                class="btn-refund-toggle"
                @click="openRefundForm(order)"
              >
                주문 취소 및 환불 신청
              </button>
            </div>

            <!-- 환불 신청 입력 폼 -->
            <div v-if="activeRefundOrderId === order.id" class="refund-form-card">
              <h5 class="refund-form-title">💸 환불 계좌 정보 입력</h5>
              <div class="form-row">
                <label>환불 사유 <span class="req">*</span></label>
                <input v-model="refundForm.reason" type="text" class="form-input" placeholder="예: 개인 사정으로 인한 취소" />
              </div>
              <div class="form-grid-2">
                <div>
                  <label>은행명 <span class="req">*</span></label>
                  <input v-model="refundForm.refundBank" type="text" class="form-input" placeholder="예: 카카오뱅크, 신한" />
                </div>
                <div>
                  <label>예금주명 <span class="req">*</span></label>
                  <input v-model="refundForm.refundHolder" type="text" class="form-input" placeholder="예: 홍길동" />
                </div>
              </div>
              <div class="form-row">
                <label>환불 계좌번호 <span class="req">*</span></label>
                <input v-model="refundForm.refundAccount" type="text" class="form-input" placeholder="'-' 없이 입력" />
              </div>
              <div class="form-actions">
                <button class="btn-cancel" @click="activeRefundOrderId = null">닫기</button>
                <button class="btn-submit-refund" @click="submitRefund(order.id)">환불 신청 접수</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 20px 40px rgba(78, 42, 50, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0eae1;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-bubble {
  font-size: 1.8rem;
}

.modal-title {
  font-size: 1.22rem;
  font-weight: 700;
  color: #2b1f1d;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: #8c7e7b;
  margin: 2px 0 0;
}

.close-btn {
  background: none;
  border: none;
  color: #9c8e8b;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.search-bar {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  border: 1.5px solid #e8ded4;
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 0.92rem;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #ff758f;
  box-shadow: 0 0 0 3px rgba(255, 117, 143, 0.15);
}

.search-btn {
  padding: 0 24px;
  background: #ff758f;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background: #ff4d6d;
}

.guide-box {
  background: #fff9f5;
  border: 1px solid #ffe8dc;
  border-radius: 14px;
  padding: 16px;
}

.guide-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #b45309;
  margin: 0 0 8px;
}

.guide-list {
  font-size: 0.82rem;
  color: #6b5c58;
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-results {
  text-align: center;
  padding: 36px 16px;
}

.empty-icon {
  font-size: 2.8rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 700;
  color: #2b1f1d;
  margin: 8px 0 4px;
}

.empty-sub {
  font-size: 0.82rem;
  color: #8c7e7b;
  margin: 0;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-result-card {
  border: 1.5px solid #ebdcd0;
  border-radius: 18px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.order-id-group {
  display: flex;
  flex-direction: column;
}

.order-id {
  font-size: 0.95rem;
  font-weight: 800;
  color: #2b1f1d;
}

.order-date {
  font-size: 0.76rem;
  color: #9c8e8b;
}

.status-badge {
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* Stepper */
.stepper-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 6px;
  background: #fbf9f6;
  border-radius: 12px;
  margin-bottom: 14px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2d7cc;
  color: #8c7e7b;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.step-item.done .step-dot {
  background: #ff758f;
  color: #ffffff;
}

.step-item.active .step-dot {
  box-shadow: 0 0 0 4px rgba(255, 117, 143, 0.3);
}

.step-label {
  font-size: 0.72rem;
  color: #8c7e7b;
  font-weight: 500;
}

.step-item.done .step-label {
  color: #ff4d6d;
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e2d7cc;
  margin: 0 4px 14px;
}

.step-line.filled {
  background: #ff758f;
}

.cancelled-notice {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-bottom: 14px;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cancel-main-msg {
  font-weight: 700;
  font-size: 0.88rem;
}

.cancel-reason-text {
  font-size: 0.78rem;
  color: #991b1b;
  line-height: 1.4;
}

.buyer-custom-photo-card {
  background: #fff8f9;
  border: 1.5px solid #ffccd5;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-photo-badge {
  font-size: 0.76rem;
  font-weight: 800;
  color: #ff4d6d;
}

.custom-photo-wrapper {
  position: relative;
  width: 100%;
  max-height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buyer-attached-photo {
  width: 100%;
  max-height: 160px;
  object-fit: contain;
}

.photo-hint-tag {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
}

.order-summary-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.84rem;
  border-top: 1px dashed #ebdcd0;
  padding-top: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sum-label {
  color: #8c7e7b;
  font-weight: 500;
  min-width: 70px;
}

.sum-value {
  color: #2b1f1d;
  font-weight: 600;
  text-align: right;
}

.total-row {
  border-top: 1px solid #ebdcd0;
  padding-top: 8px;
  margin-top: 4px;
}

.total-price {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ff4d6d;
}

.order-items-sublist {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.item-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f7f3ee;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.78rem;
  font-weight: 600;
}

.item-thumb {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
}

.mini-copy-btn {
  background: #ede6dd;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.72rem;
  cursor: pointer;
  margin-left: 4px;
}

.pending-bank-box {
  background: #fff8f0;
  border: 1.5px solid #fed7aa;
  border-radius: 14px;
  padding: 14px 12px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-tag {
  background: #f97316;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.bank-exp {
  font-size: 0.76rem;
  color: #9a3412;
  line-height: 1.4;
  word-break: keep-all;
  flex: 1;
  min-width: 180px;
}

.bank-info-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 10px 12px;
}

.bank-acc-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 0.88rem;
  color: #431407;
}

.bank-name-label {
  font-weight: 800;
  color: #c2410c;
}

.bank-number-bold {
  font-weight: 900;
  color: #431407;
}

.bank-holder-label {
  font-size: 0.78rem;
  color: #78350f;
  font-weight: 600;
}

.btn-copy-account {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f97316;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-copy-account i {
  font-size: 0.95rem;
}

.btn-copy-account:hover {
  background: #ea580c;
}

.card-footer-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-refund-toggle {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refund-toggle:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.refund-form-card {
  margin-top: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.refund-form-title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #991b1b;
}

.form-row,
.form-grid-2 {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: #4b5563;
  font-weight: 600;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.req {
  color: #ef4444;
}

.form-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.82rem;
  background: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-submit-refund {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .modal-card {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 88dvh;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    -webkit-overflow-scrolling: touch;
  }
}
</style>
