<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type DebtItem } from "~/stores/useCoupleStore";
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

const filteredDebts = computed(() => {
  if (activeOwnerTab.value === '전체') {
    return coupleStore.debts;
  }
  return coupleStore.debts.filter((d) => d.owner === activeOwnerTab.value);
});

// Summary calculations (통계 제외 옵션이 체크되지 않은 항목만 합산)
const totalRemainingPrincipal = computed(() => {
  return filteredDebts.value
    .filter((d) => !d.excludeFromStats)
    .reduce((sum, d) => sum + Number(d.remainingAmount), 0);
});

const totalMonthlyPaymentSum = computed(() => {
  return filteredDebts.value
    .filter((d) => !d.excludeFromStats)
    .reduce((sum, d) => sum + Number(d.monthlyPayment), 0);
});

const totalMonthlyInterestSum = computed(() => {
  return filteredDebts.value
    .filter((d) => !d.excludeFromStats)
    .reduce((sum, d) => sum + Number(d.monthlyInterest), 0);
});

// Add / Edit Modal State
const showModal = ref(false);
const isEditMode = ref(false);

const editingDebt = ref<Partial<DebtItem>>({
  owner: '공동',
  title: '',
  totalAmount: 0,
  remainingAmount: 0,
  interestRate: 0,
  monthlyPayment: 0,
  monthlyInterest: 0,
  totalMonths: 0,
  remainingMonths: 0,
  excludeFromStats: false,
  memo: '',
});

const openAddModal = () => {
  editingDebt.value = {
    owner: activeOwnerTab.value === '전체' ? '공동' : activeOwnerTab.value,
    title: '',
    totalAmount: 0,
    remainingAmount: 0,
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

const openEditModal = (item: DebtItem) => {
  editingDebt.value = { ...item };
  isEditMode.value = true;
  showModal.value = true;
};

const handleSaveDebt = () => {
  if (!editingDebt.value.title) {
    dialogStore.showAlert("대출/빚 이름을 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.saveDebt(editingDebt.value);
  showModal.value = false;
};

const handleDeleteDebt = (id: string) => {
  dialogStore.showConfirm(
    "이 대출 내역을 삭제하시겠습니까?",
    () => {
      coupleStore.deleteDebt(id);
      showModal.value = false;
    },
    "대출 삭제",
    "delete_outline"
  );
};

const handleProcessMonthlyPayment = (item: DebtItem) => {
  if (item.remainingAmount <= 0) {
    dialogStore.showAlert("이미 대출 원금이 모두 상환되었습니다!", "상환 완료", "info");
    return;
  }
  const payment = Number(item.monthlyPayment) || 0;
  const newRemaining = Math.max(0, Number(item.remainingAmount) - payment);

  dialogStore.showConfirm(
    `[${item.title}] 대출의 이번 달 월 상환액(${payment.toLocaleString()}원)을 상환 처리하시겠습니까?\n\n· 잔여 원금: ${Number(item.remainingAmount).toLocaleString()}원 ➔ ${newRemaining.toLocaleString()}원\n· 남은 기간: ${item.remainingMonths}개월 ➔ ${Math.max(0, item.remainingMonths - 1)}개월`,
    () => {
      coupleStore.processDebtMonthlyPayment(item.id);
      dialogStore.showAlert("이번 달 대출 상환액이 반영되어 잔여 원금이 최신화되었습니다! 👏", "상환 최신화 완료", "success");
    },
    "이번 달 상환 처리",
    "payments"
  );
};

const getRepaymentPercent = (item: any) => {
  if (!item.totalAmount || item.totalAmount === 0) return 0;
  const paid = item.totalAmount - item.remainingAmount;
  if (paid <= 0) return 0;
  const pct = Math.round((paid / item.totalAmount) * 100);
  return Math.min(Math.max(pct, 0), 100);
};

const autoCalculateInterestAndPayment = () => {
  const rem = Number(editingDebt.value.remainingAmount) > 0 
    ? Number(editingDebt.value.remainingAmount) 
    : (Number(editingDebt.value.totalAmount) || 0);
  const rate = Number(editingDebt.value.interestRate) || 0;
  const months = Number(editingDebt.value.remainingMonths) || 1;

  if (rem > 0 && rate >= 0) {
    // 월 이자액 = Math.round((잔여 원금 * (금리 / 100)) / 12)
    const calculatedInterest = Math.round((rem * (rate / 100)) / 12);
    editingDebt.value.monthlyInterest = calculatedInterest;

    // 월 총 상환액 = (잔여 원금 / 남은 개월 수) + 월 이자액
    const monthlyPrincipal = months > 0 ? rem / months : 0;
    editingDebt.value.monthlyPayment = Math.round(monthlyPrincipal + calculatedInterest);
  }
};
</script>

<template>
  <div class="debt-page-container">
    <!-- Header Banner -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-badge">
          <span class="badge-icon">💳</span>
          <span>대출 및 빚 관리</span>
        </div>
        <div class="owner-tabs-row">
          <button
            v-for="tab in ownerTabs"
            :key="tab"
            class="tab-chip"
            :class="{ active: activeOwnerTab === tab }"
            @click="activeOwnerTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Debt Summary Box -->
      <div class="debt-summary-box">
        <div class="metrics-grid">
          <div class="metric-card remaining">
            <div class="metric-label">잔여 원금 합계</div>
            <div class="metric-val text-rose-600 bold">{{ totalRemainingPrincipal.toLocaleString() }} <span class="unit">원</span></div>
          </div>
          <div class="metric-card payment">
            <div class="metric-label">월 상환액 (원리금)</div>
            <div class="metric-val bold">{{ totalMonthlyPaymentSum.toLocaleString() }} <span class="unit">원</span></div>
          </div>
          <div class="metric-card interest">
            <div class="metric-label">월 이자액</div>
            <div class="metric-val text-rose-600 bold">{{ totalMonthlyInterestSum.toLocaleString() }} <span class="unit">원</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="count-info">
        총 <strong>{{ filteredDebts.length }}</strong>건의 항목
      </div>
      <button class="add-debt-btn" @click="openAddModal">
        <i class="material-icons">add</i> 항목 등록
      </button>
    </div>

    <!-- Debts Cards Grid -->
    <div class="debt-cards-list">
      <div v-if="filteredDebts.length === 0" class="empty-box">
        <i class="material-icons">credit_card_off</i>
        <p>등록된 대출/빚 내역이 없습니다.</p>
      </div>

      <div
        v-for="item in filteredDebts"
        :key="item.id"
        class="debt-card"
        @click="openEditModal(item)"
      >
        <div class="debt-card-header">
          <span class="owner-tag" :class="item.owner">{{ item.owner }}</span>
          <h3 class="debt-title">{{ item.title }}</h3>
          <span v-if="item.excludeFromStats" class="exclude-tag">📊 통계 제외</span>
          <span class="interest-tag">금리 {{ item.interestRate }}%</span>
        </div>

        <div class="debt-card-body">
          <!-- Remaining Principal & Repayment Progress Box -->
          <div class="amount-main-box">
            <div class="amount-top-line">
              <div class="rem-group">
                <span class="rem-lbl">잔여 원금</span>
                <span class="rem-val text-rose-600">{{ Number(item.remainingAmount).toLocaleString() }}<span class="unit">원</span></span>
              </div>
              <div class="total-badge">
                총 {{ Number(item.totalAmount).toLocaleString() }}원
              </div>
            </div>

            <!-- Repayment Progress Track -->
            <div class="repay-progress-wrapper">
              <div class="repay-track">
                <div
                  class="repay-fill"
                  :style="{ width: getRepaymentPercent(item) + '%' }"
                ></div>
              </div>
              <div class="repay-txt">
                <span>상환 {{ getRepaymentPercent(item) }}% 완료</span>
                <span>잔여 {{ 100 - getRepaymentPercent(item) }}%</span>
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-cell">
              <span class="lbl">월 상환액</span>
              <span class="val">{{ Number(item.monthlyPayment).toLocaleString() }}원</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">월 이자</span>
              <span class="val text-rose-600">{{ Number(item.monthlyInterest).toLocaleString() }}원</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">남은 기간</span>
              <span class="val">{{ item.remainingMonths }}개월 / {{ item.totalMonths }}개월</span>
            </div>
          </div>

          <div v-if="item.memo" class="debt-memo">
            📌 {{ item.memo }}
          </div>

          <!-- Monthly Repayment Action Bar -->
          <div class="card-repay-action-row">
            <button
              type="button"
              class="repay-pay-btn"
              @click.stop.prevent="handleProcessMonthlyPayment(item)"
            >
              ⚡ 이번 달 월 상환 완료 (원금 차감)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card edit-debt-modal">
        <div class="modal-header">
          <h3>💳 {{ isEditMode ? '대출 내역 수정' : '새 대출 내역 등록' }}</h3>
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
                :class="{ active: editingDebt.owner === ow }"
                @click="editingDebt.owner = ow"
              >
                {{ ow }}
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>대출 / 빚 항목 이름</label>
            <input v-model="editingDebt.title" type="text" placeholder="예: 신용대출, 학자금, 전세자금" />
          </div>

          <div class="input-group">
            <label>총 대출 원금 (원)</label>
            <input v-model.number="editingDebt.totalAmount" type="number" step="100000" @input="autoCalculateInterestAndPayment" />
            <div class="quick-amount-pills-wrap">
              <button
                v-for="qa in quickAmountList"
                :key="qa.label"
                type="button"
                class="q-amt-pill"
                @click="applyQuickAmountObj(editingDebt, 'totalAmount', qa.val)"
              >
                {{ qa.label }}
              </button>
              <button type="button" class="q-amt-pill reset" @click="applyQuickAmountObj(editingDebt, 'totalAmount', 0)">
                C 초기화
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>잔여 원금 (원)</label>
            <input v-model.number="editingDebt.remainingAmount" type="number" step="100000" @input="autoCalculateInterestAndPayment" />
            <div class="quick-amount-pills-wrap">
              <button
                v-for="qa in quickAmountList"
                :key="qa.label"
                type="button"
                class="q-amt-pill"
                @click="applyQuickAmountObj(editingDebt, 'remainingAmount', qa.val)"
              >
                {{ qa.label }}
              </button>
              <button type="button" class="q-amt-pill reset" @click="applyQuickAmountObj(editingDebt, 'remainingAmount', 0)">
                C 초기화
              </button>
            </div>
          </div>

          <div class="input-row-flex">
            <div class="input-group flex-1">
              <label>금리 (%) <span class="auto-calc-hint">✨ 자동계산</span></label>
              <input v-model.number="editingDebt.interestRate" type="number" step="0.1" placeholder="4.5" @input="autoCalculateInterestAndPayment" />
            </div>
            <div class="input-group flex-1">
              <label>월 이자액 (원)</label>
              <input v-model.number="editingDebt.monthlyInterest" type="number" step="1000" />
            </div>
          </div>

          <div class="input-group">
            <label>월 총 상환액 (원)</label>
            <input v-model.number="editingDebt.monthlyPayment" type="number" step="10000" placeholder="0" />
            <div class="quick-amount-pills-wrap">
              <button
                v-for="qa in quickAmountList"
                :key="qa.label"
                type="button"
                class="q-amt-pill"
                @click="applyQuickAmountObj(editingDebt, 'monthlyPayment', qa.val)"
              >
                {{ qa.label }}
              </button>
              <button type="button" class="q-amt-pill reset" @click="applyQuickAmountObj(editingDebt, 'monthlyPayment', 0)">
                C 초기화
              </button>
            </div>
          </div>

          <div class="input-row-flex">
            <div class="input-group flex-1">
              <label>총 대출 기간 (개월)</label>
              <input v-model.number="editingDebt.totalMonths" type="number" min="0" step="1" placeholder="0" />
            </div>
            <div class="input-group flex-1">
              <label>남은 개월 수 (개월)</label>
              <input v-model.number="editingDebt.remainingMonths" type="number" min="0" step="1" placeholder="0" @input="autoCalculateInterestAndPayment" />
            </div>
          </div>

          <div class="input-group">
            <label>메모</label>
            <input v-model="editingDebt.memo" type="text" placeholder="예: 매월 15일 이체" />
          </div>

          <div class="input-group checkbox-group">
            <label class="custom-checkbox-label">
              <input v-model="editingDebt.excludeFromStats" type="checkbox" />
              <span class="checkbox-txt">📊 상단 통계 합계에서 제외하기</span>
            </label>
            <p class="field-hint">체크 시 잔여 원금, 월 상환액 등 전체 통계 합계금액에 포함되지 않습니다.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditMode" type="button" class="del-btn" @click="handleDeleteDebt(editingDebt.id!)">
            삭제
          </button>
          <button type="button" class="save-btn" @click="handleSaveDebt">
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
  background: #f3e5f5;
  border: 1px solid #e1bee7;
  color: #7b1fa2;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.q-amt-pill:active {
  background: #ab47bc;
  color: #fff;
  transform: scale(0.95);
}

.q-amt-pill.reset {
  background: #ffebee;
  border-color: #ffcdd2;
  color: #c62828;
}

.debt-page-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Card */
.page-header-card {
  background: #ffffff;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #fdd8dd;
  box-shadow: 0 4px 16px rgba(229, 57, 53, 0.05);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffebee;
  color: #c62828;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
}

.header-badge .badge-icon {
  font-size: 1.1rem;
}

.owner-tabs-row {
  display: flex;
  gap: 4px;
}

.tab-chip {
  background: #fff;
  border: 1px solid #ffcdd2;
  color: #c62828;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
}

.tab-chip.active {
  background: #e53935;
  color: #fff;
  border-color: #d32f2f;
}

/* Debt Summary Box & Metrics Grid */
.debt-summary-box {
  display: flex;
  flex-direction: column;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #fff7f8;
  border: 1px solid #ffebee;
  border-radius: 18px;
  padding: 12px 8px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-card.remaining {
  border-right: 1px dashed #ffcdd2;
  padding-right: 2px;
}

.metric-card.payment {
  border-right: 1px dashed #ffcdd2;
  padding-right: 2px;
}

.metric-label {
  font-size: 0.76rem;
  color: #666;
  font-weight: 700;
  margin-bottom: 2px;
}

.metric-val {
  font-size: 0.96rem;
  font-weight: 800;
  color: #333;
}

.metric-val .unit {
  font-size: 0.76rem;
  font-weight: 600;
}

/* Action Bar */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.count-info {
  font-size: 0.9rem;
  color: #666;
}

.add-debt-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #e53935;
  color: #fff;
  border: none;
  padding: 5px 11px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
}

.add-debt-btn i {
  font-size: 0.95rem;
}

/* Debt Cards List */
.debt-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-box {
  text-align: center;
  padding: 30px 0;
  color: #aaa;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f0e6dc;
}

.empty-box i {
  font-size: 2rem;
  color: #ccc;
}

.debt-card {
  background: #ffffff;
  border: 1px solid #f0e6dc;
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: transform 0.2s;
}

.debt-card:active {
  transform: scale(0.98);
}

.debt-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.owner-tag {
  font-size: 0.8rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.owner-tag.우주 { background: #e3f2fd; color: #1565c0; }
.owner-tag.혜빈 { background: #fce4ec; color: #c2185b; }
.owner-tag.공동 { background: #f3e5f5; color: #7b1fa2; }

.debt-title {
  flex: 1;
  font-size: 1.02rem;
  font-weight: 700;
  color: #333;
}

.interest-tag {
  background: #ffe0b2;
  color: #e65100;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.exclude-tag {
  background: #f1f3f4;
  color: #5f6368;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #dadce0;
}

.debt-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.amount-main-box {
  background: #fff8f8;
  border: 1px solid #ffebee;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.amount-top-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rem-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rem-lbl {
  font-size: 0.8rem;
  color: #666;
  font-weight: 700;
}

.rem-val {
  font-size: 1.15rem;
  font-weight: 900;
}

.rem-val .unit {
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 1px;
}

.total-badge {
  font-size: 0.78rem;
  color: #777;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 7px;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
}

/* Repayment Progress Track */
.repay-progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.repay-track {
  width: 100%;
  height: 7px;
  background: #ffebee;
  border-radius: 4px;
  overflow: hidden;
}

.repay-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef5350 0%, #c62828 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.repay-txt {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  color: #777;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #fafafa;
  border: 1px solid #f0e6dc;
  border-radius: 12px;
  padding: 8px;
  gap: 4px;
}

.detail-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-cell .lbl {
  font-size: 0.76rem;
  color: #888;
}

.detail-cell .val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #444;
  margin-top: 1px;
}

.debt-memo {
  font-size: 0.82rem;
  color: #666;
  background: #fff8e1;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #ffe082;
}

.card-repay-action-row {
  margin-top: 4px;
}

.repay-pay-btn {
  width: 100%;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  color: #e53935;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 7px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.repay-pay-btn:active {
  background: #e53935;
  color: #fff;
  transform: scale(0.98);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
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
  font-size: 1.15rem;
  font-weight: 800;
  color: #333;
}

.scrollable-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.auto-calc-hint {
  font-size: 0.82rem;
  color: #e53935;
  font-weight: 700;
  margin-left: 4px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #aaa;
  cursor: pointer;
}

.input-group {
  margin-bottom: 4px;
}

.input-group label {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: #444;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  box-sizing: border-box;
  background: #ffffff;
  color: #333;
}

.edit-debt-modal {
  max-width: 440px;
}

.input-row-flex {
  display: flex;
  gap: 8px;
}

.flex-1 {
  flex: 1;
}

.radio-selector {
  display: flex;
  gap: 8px;
}

.radio-btn {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 0.88rem;
  font-weight: 700;
  color: #555;
  cursor: pointer;
}

.radio-btn.active {
  background: #ffcdd2;
  border-color: #e53935;
  color: #b71c1c;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-shrink: 0;
}

.save-btn {
  flex: 1;
  background: #e53935;
  color: #fff;
  border: none;
  padding: 13px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.02rem;
  cursor: pointer;
}

.del-btn {
  background: #ffebee;
  color: #c62828;
  border: none;
  padding: 13px 18px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.02rem;
  cursor: pointer;
}

.checkbox-group {
  margin-top: 6px;
}

.custom-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #e53935;
  cursor: pointer;
}

.checkbox-txt {
  font-size: 0.92rem;
  font-weight: 700;
  color: #333;
}

.field-hint {
  font-size: 0.78rem;
  color: #888;
  margin-top: 4px;
  margin-left: 26px;
}
</style>
