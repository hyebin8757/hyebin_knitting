<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type MonthlyUtilityRecord, type UtilityCategoryItem } from "~/stores/useCoupleStore";
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

definePageMeta({
  layout: "user-layout",
});

const coupleStore = useCoupleStore();
const dialogStore = useCoupleDialogStore();

// Current This Year
const currentThisYear = new Date().getFullYear();

// Year Selector (2020 ~ 2035)
const selectedYear = ref(currentThisYear);
const allAvailableYears = Array.from({ length: 16 }, (_, i) => 2020 + i);

const changeYear = (delta: number) => {
  selectedYear.value += delta;
};

const resetToThisYear = () => {
  selectedYear.value = currentThisYear;
};

// View Mode: 'cards' or 'table'
const viewMode = ref<'cards' | 'table'>('cards');

// Edit Modal state
const showEditModal = ref(false);
const editingMonth = ref(1);
const editingItems = ref<UtilityCategoryItem[]>([]);
const editingMemo = ref("");

// Add Custom Category sub-modal state
const showAddCatSubModal = ref(false);
const newCatNameInput = ref("");

// Standard default categories (도시가스 제거)
const defaultCategoryNames = [
  "전기세",
  "관리비",
  "수도세",
  "인터넷",
  "마통 이자",
  "보증금 이자",
];


const openEditModalForMonth = (month: number) => {
  editingMonth.value = month;
  const rec = coupleStore.getUtilityRecord(selectedYear.value, month);

  let items: UtilityCategoryItem[];
  if (rec && rec.items && rec.items.length > 0) {
    items = rec.items.map((i) => ({ ...i }));
  } else {
    items = defaultCategoryNames.map((catName, idx) => ({
      id: `u_${idx + 1}`,
      name: catName,
      amount: 0,
    }));
  }

  // 렌더 시점에 도시가스 0원 항목 완전 제거
  editingItems.value = items.filter(
    (item) => !(item.name === "도시가스" && (Number(item.amount) || 0) === 0)
  );

  editingMemo.value = rec.memo || "";
  showEditModal.value = true;
};


const handleConfirmAddCustomCategory = () => {
  const name = newCatNameInput.value.trim();
  if (!name) {
    dialogStore.showAlert("공과금 항목 이름을 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.addCustomUtilityCategory(name);
  editingItems.value.push({
    id: "u_custom_" + Date.now(),
    name: name,
    amount: 0,
  });
  newCatNameInput.value = "";
  showAddCatSubModal.value = false;
};

const removeItemRow = (index: number) => {
  const item = editingItems.value[index];
  dialogStore.showConfirm(
    `'${item.name}' 항목을 삭제하시겠습니까?`,
    () => {
      editingItems.value.splice(index, 1);
    },
    "항목 삭제",
    "delete_outline"
  );
};

// All active category names present in any month of selected year for matrix table
const activeCategoryNames = computed(() => {
  const set = new Set<string>();
  for (let m = 1; m <= 12; m++) {
    const rec = coupleStore.getUtilityRecord(selectedYear.value, m);
    rec.items.forEach((i) => set.add(i.name));
  }
  if (set.size === 0) {
    defaultCategoryNames.forEach((name) => set.add(name));
  }
  return Array.from(set);
});

// Auto calculated total sum & 1-person split in edit modal
const modalTotalSum = computed(() => {
  return editingItems.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

const modalPerPerson = computed(() => {
  return Math.round(modalTotalSum.value / 2);
});

// Unsaved changes guard: true if any amount > 0 or memo filled
const hasUnsavedChanges = computed(() => {
  const anyAmount = editingItems.value.some((item) => Number(item.amount) > 0);
  return anyAmount || editingMemo.value.trim().length > 0;
});

const handleCloseModal = () => {
  if (hasUnsavedChanges.value) {
    dialogStore.showConfirm(
      "작성 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?",
      () => { showEditModal.value = false; },
      "닫기 확인",
      "warning"
    );
  } else {
    showEditModal.value = false;
  }
};

const handleSaveUtility = () => {
  coupleStore.saveUtilityRecord(
    selectedYear.value,
    editingMonth.value,
    editingItems.value,
    editingMemo.value
  );
  showEditModal.value = false;
};

// 도시가스 0원 일괄 삭제
const isCleaningUp = ref(false);
const handleCleanupDosiGas = async () => {
  isCleaningUp.value = true;
  try {
    const removed = await coupleStore.cleanupDosiGas();
    if (removed > 0) {
      dialogStore.showAlert(`도시가스 항목 ${removed}개를 DB에서 완전히 제거했습니다. ✅`, "삭제 완료", "success");
    } else {
      dialogStore.showAlert("도시가스 항목이 이미 모두 제거되어 있습니다.", "확인", "info");
    }
  } finally {
    isCleaningUp.value = false;
  }
};

// Yearly stats calculation
const yearlyTotal = computed(() => {
  let total = 0;
  for (let m = 1; m <= 12; m++) {
    const rec = coupleStore.getUtilityRecord(selectedYear.value, m);
    total += coupleStore.getUtilityTotal(rec);
  }
  return total;
});

const yearlyPerPerson = computed(() => Math.round(yearlyTotal.value / 2));
</script>

<template>
  <div class="utility-page-container">
    <!-- Header Banner -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-badge">💡 공과금 정산내역</div>
        
        <!-- Sleek & Cute Year Control Panel -->
        <div class="year-control-panel">
          <div class="year-nav-box">
            <button class="nav-arrow-btn" @click="changeYear(-1)" title="이전 연도">
              <i class="material-icons">chevron_left</i>
            </button>

            <div class="year-select-pill">
              <select v-model="selectedYear" class="year-select-native">
                <option v-for="y in allAvailableYears" :key="y" :value="y">
                  {{ y }}년
                </option>
              </select>
              <span class="pill-label">{{ selectedYear }}년 ▾</span>
            </div>

            <button class="nav-arrow-btn" @click="changeYear(1)" title="다음 연도">
              <i class="material-icons">chevron_right</i>
            </button>
          </div>

          <button
            class="reset-today-btn"
            :class="{ highlighted: selectedYear !== currentThisYear }"
            @click="resetToThisYear"
            title="올해로 돌아가기"
          >
            <i class="material-icons">restart_alt</i> 올해
          </button>
        </div>
      </div>

      <div class="yearly-summary-box">
        <div class="summary-col">
          <span class="label">{{ selectedYear }}년 총 공과금</span>
          <span class="value text-amber-900">{{ yearlyTotal.toLocaleString() }} 원</span>
        </div>
        <div class="divider"></div>
        <div class="summary-col">
          <span class="label">1인 부담 총액 (÷2)</span>
          <span class="value text-rose-600">{{ yearlyPerPerson.toLocaleString() }} 원</span>
        </div>
      </div>
    </div>

    <!-- Top Action Bar with Register Button -->
    <div class="action-bar-row">
      <div class="toggle-group">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'cards' }"
          @click="viewMode = 'cards'"
        >
          <i class="material-icons">grid_view</i> 월별 카드
        </button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <i class="material-icons">table_chart</i> 연간 매트릭스 표
        </button>
      </div>
      <!-- 도시가스 0원 일괄 삭제 버튼 -->
      <button
        class="cleanup-btn"
        :disabled="isCleaningUp"
        @click="handleCleanupDosiGas"
        title="DB에서 도시가스 0원 항목 일괄 삭제"
      >
        <i class="material-icons">{{ isCleaningUp ? 'hourglass_empty' : 'cleaning_services' }}</i>
        {{ isCleaningUp ? '삭제 중...' : '도시가스 제거' }}
      </button>

      <button class="add-utility-btn" @click="openEditModalForMonth(new Date().getMonth() + 1)">
        <i class="material-icons">edit_note</i> 공과금 등록/수정
      </button>
    </div>

    <!-- View Mode 1: Monthly Cards (1월 ~ 12월) -->
    <div v-if="viewMode === 'cards'" class="monthly-cards-grid">
      <div
        v-for="m in 12"
        :key="m"
        class="month-card"
        @click="openEditModalForMonth(m)"
      >
        <div class="month-card-header">
          <span class="month-badge">{{ m }}월</span>
          <button class="edit-icon-btn">
            <i class="material-icons">edit</i>
          </button>
        </div>

        <div class="month-totals">
          <div class="total-row">
            <span class="lbl">월 합계</span>
            <span class="val bold">
              {{ coupleStore.getUtilityTotal(coupleStore.getUtilityRecord(selectedYear, m)).toLocaleString() }}원
            </span>
          </div>
          <div class="per-person-row">
            <span class="lbl">1인 비용 (÷2)</span>
            <span class="val highlight">
              {{ coupleStore.getUtilityPerPerson(coupleStore.getUtilityRecord(selectedYear, m)).toLocaleString() }}원
            </span>
          </div>
        </div>

        <!-- Preview Items -->
        <div class="month-items-preview">
          <div
            v-for="item in coupleStore.getUtilityRecord(selectedYear, m).items.filter(i => i.amount > 0).slice(0, 4)"
            :key="item.name"
            class="item-row-mini"
          >
            <span>{{ item.name }}</span>
            <span>{{ item.amount.toLocaleString() }}원</span>
          </div>
          <div
            v-if="coupleStore.getUtilityRecord(selectedYear, m).items.filter(i => i.amount > 0).length === 0"
            class="no-data"
          >
            기록 없음 (터치하여 입력)
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode 2: Responsive Matrix Table (Horizontal Scrollable) -->
    <div v-else class="table-container">
      <div class="table-scroll-wrapper">
        <table class="utility-matrix-table">
          <thead>
            <tr>
              <th class="sticky-col">항목</th>
              <th v-for="m in 12" :key="m" @click="openEditModalForMonth(m)" class="clickable-th">
                {{ m }}월 ✏️
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in activeCategoryNames" :key="cat">
              <td class="sticky-col font-semibold">{{ cat }}</td>
              <td v-for="m in 12" :key="m" @click="openEditModalForMonth(m)" class="clickable-td">
                {{ (coupleStore.getUtilityRecord(selectedYear, m).items.find(i => i.name === cat)?.amount || 0).toLocaleString() }}
              </td>
            </tr>

            <!-- Total Row -->
            <tr class="total-tr">
              <td class="sticky-col bold">합계</td>
              <td v-for="m in 12" :key="m" class="bold">
                {{ coupleStore.getUtilityTotal(coupleStore.getUtilityRecord(selectedYear, m)).toLocaleString() }}
              </td>
            </tr>
            <!-- 1 Person Cost Row -->
            <tr class="per-person-tr">
              <td class="sticky-col highlight-text">1인 비용</td>
              <td v-for="m in 12" :key="m" class="highlight-text">
                {{ coupleStore.getUtilityPerPerson(coupleStore.getUtilityRecord(selectedYear, m)).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit/Register Utility Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="handleCloseModal">
      <div class="modal-card edit-utility-modal">
        <div class="modal-header">
          <h3>💡 {{ selectedYear }}년 공과금 등록</h3>
          <button class="close-btn" @click="handleCloseModal">×</button>
        </div>

        <!-- Month Switcher inside Modal -->
        <div class="modal-month-switcher">
          <button
            v-for="m in 12"
            :key="m"
            class="m-btn"
            :class="{ active: editingMonth === m }"
            @click="openEditModalForMonth(m)"
          >
            {{ m }}월
          </button>
        </div>

        <div class="modal-body scrollable-body">
          <div class="items-edit-list">
            <div
              v-for="(item, idx) in editingItems"
              :key="item.id"
              class="utility-input-row"
            >
              <span class="cat-label">{{ item.name }}</span>
              <div class="input-with-unit">
                <input
                  v-model.number="item.amount"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="100"
                />
                <span class="unit">원</span>
              </div>
              <button
                v-if="item.amount > 0"
                type="button"
                class="reset-amount-btn"
                @click="item.amount = 0"
                title="금액 초기화"
              >
                <i class="material-icons">restart_alt</i>
              </button>
              <button
                v-else
                type="button"
                class="del-cat-btn"
                @click="removeItemRow(idx)"
                title="항목 삭제"
              >
                ×
              </button>
            </div>
          </div>

          <button type="button" class="add-custom-cat-btn" @click="showAddCatSubModal = true">
            + 새 공과금 항목 추가
          </button>

          <!-- Auto Calculation Summary -->
          <div class="auto-calc-box">
            <div class="calc-row">
              <span>{{ editingMonth }}월 총 합계금액</span>
              <span class="amount bold">{{ modalTotalSum.toLocaleString() }} 원</span>
            </div>
            <div class="calc-row highlight font-bold">
              <span>1인 부담금 (÷ 2)</span>
              <span class="amount text-rose-600">{{ modalPerPerson.toLocaleString() }} 원</span>
            </div>
          </div>

          <div class="input-group mt-3">
            <label>특이사항 / 메모</label>
            <input v-model="editingMemo" type="text" placeholder="예: 여름철 난방/전기세 영향" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="save-btn" @click="handleSaveUtility">
            저장하기
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-modal for adding custom utility category name -->
    <div v-if="showAddCatSubModal" class="modal-overlay sub-overlay" @click.self="showAddCatSubModal = false">
      <div class="modal-card sub-modal-card">
        <div class="modal-header">
          <h3>⚡ 공과금 항목 추가</h3>
          <button class="close-btn" @click="showAddCatSubModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>추가할 공과금/이자 항목 이름</label>
            <input
              v-model="newCatNameInput"
              type="text"
              placeholder="예: 청소비, TV수신료, 자동차세"
              @keyup.enter="handleConfirmAddCustomCategory"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="save-btn" @click="handleConfirmAddCustomCategory">
            추가하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.utility-page-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Card */
.page-header-card {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #ffe082;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-badge {
  font-size: 1.08rem;
  font-weight: 800;
  color: #5d4037;
}

/* Year Control Panel */
.year-control-panel {
  display: flex;
  align-items: center;
  gap: 6px;
}

.year-nav-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #ffe082;
  border-radius: 18px;
  padding: 2px 4px;
  box-shadow: 0 2px 6px rgba(255, 179, 0, 0.1);
}

.nav-arrow-btn {
  background: none;
  border: none;
  color: #795548;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.nav-arrow-btn:active {
  background: #ffe082;
}

.nav-arrow-btn i {
  font-size: 1.1rem;
}

.year-select-pill {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px 8px;
}

.year-select-native {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.pill-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: #5d4037;
  letter-spacing: -0.2px;
}

.reset-today-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #ffffff;
  border: 1px solid #ffe082;
  color: #795548;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-today-btn.highlighted {
  background: #ff7043;
  color: #ffffff;
  border-color: #f57c00;
  box-shadow: 0 2px 8px rgba(255, 112, 67, 0.3);
  animation: pulse-badge 1.8s infinite;
}

@keyframes pulse-badge {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.reset-today-btn i {
  font-size: 0.95rem;
}

.yearly-summary-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(255, 179, 0, 0.3);
}

.summary-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-col .label {
  font-size: 0.82rem;
  color: #6d4c41;
  font-weight: 600;
}

.summary-col .value {
  font-size: 1.1rem;
  font-weight: 800;
  margin-top: 2px;
}

.divider {
  width: 1px;
  height: 28px;
  background: #ffe082;
}

/* Action Bar Row */
.action-bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.toggle-group {
  display: flex;
  background: #f0e6dc;
  padding: 3px;
  border-radius: 14px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
}

.toggle-btn i {
  font-size: 0.95rem;
}

.toggle-btn.active {
  background: #ffffff;
  color: #ff6f00;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.cleanup-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1.5px solid #ce93d8;
  padding: 7px 12px;
  border-radius: 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.cleanup-btn:hover {
  background: #e1bee7;
}

.cleanup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cleanup-btn i {
  font-size: 1rem;
}

.add-utility-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #ff9800;
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.add-utility-btn i {
  font-size: 1.05rem;
}

/* Monthly Cards Grid */
.monthly-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.month-card {
  background: #ffffff;
  border: 1px solid #f0e6dc;
  border-radius: 20px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s;
}

.month-card:active {
  transform: scale(0.97);
}

.month-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.month-badge {
  background: #fff3e0;
  color: #e65100;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
}

.edit-icon-btn {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
}

.edit-icon-btn i {
  font-size: 1.1rem;
}

.month-totals {
  background: #fffaf0;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 8px;
}

.total-row, .per-person-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.total-row {
  margin-bottom: 3px;
}

.lbl {
  color: #777;
}

.val.bold {
  font-weight: 800;
  color: #333;
}

.val.highlight {
  font-weight: 800;
  color: #e53935;
}

.month-items-preview {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-row-mini {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #666;
}

.no-data {
  font-size: 0.78rem;
  color: #aaa;
  text-align: center;
  padding: 6px 0;
}

/* Matrix Table View */
.table-container {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f0e6dc;
  overflow: hidden;
}

.table-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.utility-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  min-width: 600px;
}

.utility-matrix-table th, .utility-matrix-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f5f5f5;
  white-space: nowrap;
}

.utility-matrix-table th {
  background: #fff8e1;
  color: #5d4037;
  font-weight: 700;
}

.clickable-th, .clickable-td {
  cursor: pointer;
}

.clickable-td:hover {
  background: #fffde7;
}

.sticky-col {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 10;
  text-align: left !important;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.03);
}

.total-tr {
  background: #fffde7;
  font-weight: 800;
}

.per-person-tr {
  background: #ffebee;
  font-weight: 800;
  color: #c62828;
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

.sub-overlay {
  z-index: 110;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 360px;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.edit-utility-modal {
  max-width: 440px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.05rem;
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

.modal-month-switcher {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  margin-bottom: 12px;
  padding-bottom: 4px;
}

.m-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
}

.m-btn.active {
  background: #ff9800;
  color: #fff;
  border-color: #f57c00;
}

.scrollable-body {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 4px;
}

.items-edit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.utility-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid #eee;
}

.cat-label {
  width: 95px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #444;
}

.input-with-unit {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 4px 8px;
}

.input-with-unit input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: right;
}

.unit {
  font-size: 0.72rem;
  color: #888;
  margin-left: 4px;
}

.del-cat-btn {
  background: none;
  border: none;
  color: #ef5350;
  font-size: 1.2rem;
  cursor: pointer;
  flex-shrink: 0;
}

.reset-amount-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 8px;
  color: #e65100;
  width: 28px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

.reset-amount-btn .material-icons {
  font-size: 1rem;
}

.add-custom-cat-btn {
  width: 100%;
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 12px;
}

.auto-calc-box {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.save-btn {
  flex: 1;
  background: #ff9800;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.input-group {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #555;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.85rem;
  box-sizing: border-box;
}
</style>
