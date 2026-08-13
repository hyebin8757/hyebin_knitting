<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type SavingItem } from "~/stores/useCoupleStore";
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

definePageMeta({
  layout: "user-layout",
});

const coupleStore = useCoupleStore();
const dialogStore = useCoupleDialogStore();

// Owner Filter Tab
const activeOwnerTab = ref<'전체' | '우주' | '혜빈' | '공동'>('전체');
const ownerTabs: ('전체' | '우주' | '혜빈' | '공동')[] = ['전체', '우주', '혜빈', '공동'];

const quickAmountList = [
  { label: '+10원', val: 10 },
  { label: '+100원', val: 100 },
  { label: '+1천원', val: 1000 },
  { label: '+1만원', val: 10000 },
  { label: '+10만원', val: 100000 },
  { label: '+100만원', val: 1000000 },
  { label: '+1000만원', val: 10000000 },
];

const applyQuickAmountObj = (obj: any, key: string, delta: number) => {
  if (delta === 0) {
    obj[key] = 0;
  } else {
    obj[key] = (Number(obj[key]) || 0) + delta;
  }
};

const filteredSavings = computed(() => {
  if (activeOwnerTab.value === '전체') {
    return coupleStore.savings;
  }
  return coupleStore.savings.filter((s) => s.owner === activeOwnerTab.value);
});

// Summary calculations (통계 제외 옵션 제외)
const totalCurrentPrincipal = computed(() => {
  return filteredSavings.value
    .filter((s) => !s.excludeFromStats)
    .reduce((sum, s) => sum + Number(s.currentAmount), 0);
});

const totalMonthlyPaymentSum = computed(() => {
  return filteredSavings.value
    .filter((s) => !s.excludeFromStats)
    .reduce((sum, s) => sum + Number(s.monthlyPayment), 0);
});

const totalMonthlyInterestSum = computed(() => {
  return filteredSavings.value
    .filter((s) => !s.excludeFromStats)
    .reduce((sum, s) => sum + Number(s.monthlyInterest), 0);
});

// Add / Edit Modal State
const showModal = ref(false);
const isEditMode = ref(false);

const editingSaving = ref<Partial<SavingItem>>({
  owner: '공동',
  title: '',
  totalAmount: 0,
  currentAmount: 0,
  interestRate: 0,
  monthlyPayment: 0,
  monthlyInterest: 0,
  totalMonths: 0,
  remainingMonths: 0,
  excludeFromStats: false,
  memo: '',
});

const openAddModal = () => {
  editingSaving.value = {
    owner: activeOwnerTab.value === '전체' ? '공동' : activeOwnerTab.value,
    title: '',
    totalAmount: 0,
    currentAmount: 0,
    interestRate: 0,
    monthlyPayment: 0,
    monthlyInterest: 0,
    totalMonths: 0,
    remainingMonths: 0,
    excludeFromStats: false,
    memo: '',
  };
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (item: SavingItem) => {
  editingSaving.value = { ...item };
  isEditMode.value = true;
  showModal.value = true;
};

const handleSaveSaving = () => {
  if (!editingSaving.value.title) {
    dialogStore.showAlert("적금/자산 이름을 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.saveSaving(editingSaving.value);
  showModal.value = false;
};

const handleDeleteSaving = (id: string) => {
  dialogStore.showConfirm(
    "이 적금 내역을 삭제하시겠습니까?",
    () => {
      coupleStore.deleteSaving(id);
      showModal.value = false;
    },
    "적금 삭제",
    "delete_outline"
  );
};

// 금리 & 월 예상 이자 자동 계산 헬퍼
const autoCalculateInterest = () => {
  const current = Number(editingSaving.value.currentAmount) || 0;
  const rate = Number(editingSaving.value.interestRate) || 0;
  if (current > 0 && rate > 0) {
    const annualInterest = current * (rate / 100);
    editingSaving.value.monthlyInterest = Math.round(annualInterest / 12);
  }
};
</script>

<template>
  <div class="savings-page-container">
    <!-- Header Card -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-badge font-bold">
          <span>🏦 적금 & 자산 현황</span>
        </div>
        <div class="header-sub-tag font-semibold">
          차곡차곡 모아가는 우리의 자산 💎
        </div>
      </div>

      <!-- Owner Filters -->
      <div class="owner-tabs-row">
        <button
          v-for="tab in ownerTabs"
          :key="tab"
          class="owner-tab-btn"
          :class="{ active: activeOwnerTab === tab }"
          @click="activeOwnerTab = tab"
        >
          {{ tab }} 자산
        </button>
      </div>

      <!-- Summary Metrics Grid -->
      <div class="metrics-dashboard">
        <div class="metric-card primary-card">
          <span class="m-label">총 모은 자산 (현재 잔액)</span>
          <div class="m-val text-sky-600">
            {{ totalCurrentPrincipal.toLocaleString() }} <span class="unit">원</span>
          </div>
        </div>

        <div class="metric-sub-grid">
          <div class="sub-metric">
            <span class="sub-label">월 납입액</span>
            <span class="sub-val text-blue-700">{{ totalMonthlyPaymentSum.toLocaleString() }}원</span>
          </div>
          <div class="sub-metric">
            <span class="sub-label">월 예상 이자</span>
            <span class="sub-val text-amber-600">+{{ totalMonthlyInterestSum.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="count-txt">
        <strong>{{ activeOwnerTab }}</strong> 적금/자산 총 <strong>{{ filteredSavings.length }}</strong>건
      </div>
      <button class="add-btn" @click="openAddModal">
        <i class="material-icons">add</i> 적금 등록
      </button>
    </div>

    <!-- Savings Cards List -->
    <div class="savings-list">
      <div v-if="filteredSavings.length === 0" class="empty-box">
        <i class="material-icons">savings</i>
        <p>등록된 적금/자산 내역이 없습니다.</p>
      </div>

      <div
        v-for="item in filteredSavings"
        :key="item.id"
        class="saving-card"
        @click="openEditModal(item)"
      >
        <div class="card-top-row">
          <div class="left-badge-group">
            <span class="owner-badge" :class="item.owner">{{ item.owner }}</span>
            <span v-if="item.excludeFromStats" class="exclude-badge">📊 통계 제외</span>
          </div>
          <div class="rate-badge">
            금리 {{ item.interestRate }}%
          </div>
        </div>

        <div class="card-main-title">
          {{ item.title }}
        </div>

        <!-- Savings Progress & Principal -->
        <div class="principal-row">
          <div class="main-amount text-sky-600">
            {{ Number(item.currentAmount).toLocaleString() }}원
          </div>
        </div>

        <!-- Details Grid -->
        <div class="card-details-grid">
          <div class="detail-col">
            <span class="lbl">월 납입액</span>
            <span class="val font-semibold">{{ Number(item.monthlyPayment).toLocaleString() }}원</span>
          </div>
          <div class="detail-col">
            <span class="lbl">월 예상 이자</span>
            <span class="val text-amber-600 font-semibold">+{{ Number(item.monthlyInterest).toLocaleString() }}원</span>
          </div>
          <div class="detail-col">
            <span class="lbl">남은 기간</span>
            <span class="val font-semibold">{{ item.remainingMonths }}개월 / 총 {{ item.totalMonths }}개월</span>
          </div>
        </div>

        <div v-if="item.memo" class="card-memo">
          💬 {{ item.memo }}
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card edit-debt-modal">
        <div class="modal-header">
          <h3>🏦 {{ isEditMode ? '적금/자산 수정' : '새 적금/자산 등록' }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>

        <div class="modal-body scrollable-body">
          <div class="input-group">
            <label>소유자</label>
            <div class="radio-selector">
              <button
                v-for="ow in ['공동', '우주', '혜빈']"
                :key="ow"
                type="button"
                class="radio-btn"
                :class="{ active: editingSaving.owner === ow }"
                @click="editingSaving.owner = ow"
              >
                {{ ow }}
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>적금 / 예금 / 자산 항목 이름</label>
            <input v-model="editingSaving.title" type="text" placeholder="예: 청년희망적금, 주택청약, 정기예금" />
          </div>

          <div class="input-group">
            <label>현재 모은 금액 / 잔액 (원)</label>
            <input v-model.number="editingSaving.currentAmount" type="number" step="100000" @input="autoCalculateInterest" />
            <div class="quick-amount-pills-wrap">
              <button
                v-for="qa in quickAmountList"
                :key="qa.label"
                type="button"
                class="q-amt-pill"
                @click="applyQuickAmountObj(editingSaving, 'currentAmount', qa.val)"
              >
                {{ qa.label }}
              </button>
              <button type="button" class="q-amt-pill reset" @click="applyQuickAmountObj(editingSaving, 'currentAmount', 0)">
                C 초기화
              </button>
            </div>
          </div>

          <div class="input-row-flex">
            <div class="input-group flex-1">
              <label>금리 (%) <span class="auto-calc-hint">✨ 이자 자동계산</span></label>
              <input v-model.number="editingSaving.interestRate" type="number" step="0.1" placeholder="3.5" @input="autoCalculateInterest" />
            </div>
            <div class="input-group flex-1">
              <label>월 예상 이자 (원)</label>
              <input v-model.number="editingSaving.monthlyInterest" type="number" step="1000" />
            </div>
          </div>

          <div class="input-group">
            <label>월 불입/납입액 (원)</label>
            <input v-model.number="editingSaving.monthlyPayment" type="number" step="10000" placeholder="0" />
            <div class="quick-amount-pills-wrap">
              <button
                v-for="qa in quickAmountList"
                :key="qa.label"
                type="button"
                class="q-amt-pill"
                @click="applyQuickAmountObj(editingSaving, 'monthlyPayment', qa.val)"
              >
                {{ qa.label }}
              </button>
              <button type="button" class="q-amt-pill reset" @click="applyQuickAmountObj(editingSaving, 'monthlyPayment', 0)">
                C 초기화
              </button>
            </div>
          </div>

          <div class="input-row-flex">
            <div class="input-group flex-1">
              <label>총 약정 기간 (개월)</label>
              <input v-model.number="editingSaving.totalMonths" type="number" min="0" step="1" placeholder="12" />
            </div>
            <div class="input-group flex-1">
              <label>남은 만기 개월 수 (개월)</label>
              <input v-model.number="editingSaving.remainingMonths" type="number" min="0" step="1" placeholder="12" />
            </div>
          </div>

          <div class="input-group">
            <label>메모</label>
            <input v-model="editingSaving.memo" type="text" placeholder="예: 국민은행 자동이체 10일" />
          </div>

          <div class="input-group checkbox-group">
            <label class="custom-checkbox-label">
              <input v-model="editingSaving.excludeFromStats" type="checkbox" />
              <span class="checkbox-txt">📊 상단 통계 합계에서 제외하기</span>
            </label>
            <p class="field-hint">체크 시 총 모은 자산, 월 납입액 등 전체 통계 합계금액에 포함되지 않습니다.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditMode" type="button" class="del-btn" @click="handleDeleteSaving(editingSaving.id!)">
            삭제
          </button>
          <button type="button" class="save-btn" @click="handleSaveSaving">
            저장하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-amount-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.q-amt-pill {
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  color: #0369a1;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.q-amt-pill:active {
  background: #0284c7;
  color: #fff;
  transform: scale(0.95);
}

.q-amt-pill.reset {
  background: #ffebee;
  border-color: #ffcdd2;
  color: #c62828;
}

.savings-page-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Card */
.page-header-card {
  background: #ffffff;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #bae6fd;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-badge {
  font-size: 1.12rem;
  color: #0369a1;
}

.header-sub-tag {
  font-size: 0.78rem;
  color: #666;
}

/* Owner Tabs */
.owner-tabs-row {
  display: flex;
  gap: 6px;
  background: #f0f9ff;
  padding: 4px;
  border-radius: 16px;
}

.owner-tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.owner-tab-btn.active {
  background: #ffffff;
  color: #0284c7;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.12);
}

/* Metrics Dashboard */
.metrics-dashboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-card.primary-card {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
}

.m-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #0284c7;
}

.m-val {
  font-size: 1.35rem;
  font-weight: 800;
  margin-top: 2px;
}

.m-val .unit {
  font-size: 0.85rem;
  font-weight: 600;
}

.metric-sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sub-metric {
  background: #f0f7ff;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
}

.sub-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #0369a1;
}

.sub-val {
  font-size: 0.95rem;
  font-weight: 800;
  margin-top: 1px;
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.count-txt {
  font-size: 0.88rem;
  color: #666;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 5px 11px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  transition: transform 0.15s ease, background 0.15s ease;
}

.add-btn i {
  font-size: 0.95rem;
}

.add-btn:active {
  transform: scale(0.95);
  background: #0369a1;
}

/* Cards List */
.savings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-box {
  text-align: center;
  padding: 35px 0;
  color: #aaa;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f0e6dc;
}

.empty-box i {
  font-size: 2.2rem;
  color: #ccc;
}

.saving-card {
  background: #ffffff;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.04);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.saving-card:active {
  transform: scale(0.98);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-badge-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.owner-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.owner-badge.공동 { background: #f3e5f5; color: #7b1fa2; }
.owner-badge.우주 { background: #e3f2fd; color: #1565c0; }
.owner-badge.혜빈 { background: #fce4ec; color: #c2185b; }

.exclude-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
  background: #eee;
  padding: 2px 6px;
  border-radius: 8px;
}

.rate-badge {
  font-size: 0.76rem;
  font-weight: 800;
  color: #0369a1;
  background: #e0f2fe;
  padding: 2px 8px;
  border-radius: 10px;
}

.card-main-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #333;
}

.principal-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.main-amount {
  font-size: 1.28rem;
  font-weight: 800;
}

.total-target-txt {
  font-size: 0.78rem;
  font-weight: 600;
  color: #888;
}

.card-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #f0f7ff;
  padding: 8px 10px;
  border-radius: 12px;
  margin-top: 2px;
}

.detail-col {
  display: flex;
  flex-direction: column;
}

.detail-col .lbl {
  font-size: 0.68rem;
  color: #666;
}

.detail-col .val {
  font-size: 0.8rem;
  color: #333;
  margin-top: 1px;
}

.card-memo {
  font-size: 0.78rem;
  color: #777;
  background: #f9f9f9;
  padding: 4px 8px;
  border-radius: 8px;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
  box-sizing: border-box;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #aaa;
  cursor: pointer;
}

.scrollable-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #555;
}

.auto-calc-hint {
  font-size: 0.72rem;
  color: #0284c7;
  font-weight: 700;
}

.input-group input[type="text"],
.input-group input[type="number"] {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 9px 12px;
  font-size: 0.92rem;
  outline: none;
}

.input-group input:focus {
  border-color: #0284c7;
}

.input-row-flex {
  display: flex;
  gap: 10px;
}

.flex-1 {
  flex: 1;
}

.radio-selector {
  display: flex;
  gap: 6px;
}

.radio-btn {
  flex: 1;
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 0;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
}

.radio-btn.active {
  background: #e0f2fe;
  color: #0284c7;
  border-color: #bae6fd;
}

.checkbox-group {
  margin-top: 4px;
}

.custom-checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-txt {
  font-size: 0.82rem;
  font-weight: 700;
  color: #333;
}

.field-hint {
  font-size: 0.72rem;
  color: #888;
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-shrink: 0;
}

.del-btn {
  background: #ffebee;
  color: #e53935;
  border: none;
  padding: 10px 16px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  flex: 1;
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 10px 0;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
</style>
