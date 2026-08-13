<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type LivingCategoryItem } from "~/stores/useCoupleStore";
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

definePageMeta({
  layout: "user-layout",
});

const coupleStore = useCoupleStore();
const dialogStore = useCoupleDialogStore();

// Year & Month Selector
const today = new Date();
const currentThisYear = today.getFullYear();
const selectedYear = ref(currentThisYear);
const selectedMonth = ref(today.getMonth() + 1);
const availableYears = Array.from({ length: 16 }, (_, i) => 2020 + i);

const resetToThisYear = () => {
  selectedYear.value = currentThisYear;
};

const record = computed(() => coupleStore.getLivingRecord(selectedYear.value, selectedMonth.value));

// Budget Target Edit Modal State
const showTargetModal = ref(false);
const editingTargetAmount = ref(1000000);

const openTargetModal = () => {
  editingTargetAmount.value = record.value.targetSavings;
  showTargetModal.value = true;
};

const saveTargetAmount = () => {
  coupleStore.saveLivingTarget(selectedYear.value, selectedMonth.value, editingTargetAmount.value);
  showTargetModal.value = false;
};

// Add Category Modal State
const showAddCategoryModal = ref(false);
const newCategoryInput = ref("");

const handleAddCategory = () => {
  if (!newCategoryInput.value.trim()) {
    dialogStore.showAlert("카테고리 이름을 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.addLivingCategory(newCategoryInput.value);
  newCategoryInput.value = "";
  showAddCategoryModal.value = false;
};

const handleDeleteCategory = (catName: string) => {
  dialogStore.showConfirm(
    `'${catName}' 카테고리를 삭제하시겠습니까?`,
    () => {
      coupleStore.deleteLivingCategory(catName);
      if (activeCategoryFilter.value === catName) {
        activeCategoryFilter.value = "전체";
      }
    },
    "카테고리 삭제",
    "delete_outline"
  );
};

// Expense Item Modal State (Add & Edit)
const showItemModal = ref(false);
const isEditMode = ref(false);

const editingItem = ref<Partial<LivingCategoryItem>>({
  category: "식비",
  title: "",
  amount: 0,
  date: today.toISOString().split("T")[0],
  paidBy: "공동",
});

const openAddItemModal = () => {
  const defaultCat = coupleStore.livingCategories[0] || "식비";
  editingItem.value = {
    category: defaultCat,
    title: "",
    amount: 0,
    date: `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}-01`,
    paidBy: "공동",
  };
  isEditMode.value = false;
  showItemModal.value = true;
};

const openEditItemModal = (item: LivingCategoryItem) => {
  editingItem.value = { ...item };
  isEditMode.value = true;
  showItemModal.value = true;
};

const handleSaveItem = () => {
  if (!editingItem.value.title || (editingItem.value.amount || 0) <= 0) {
    dialogStore.showAlert("내역 이름과 올바른 금액을 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.saveLivingItem(selectedYear.value, selectedMonth.value, editingItem.value);
  showItemModal.value = false;
};

const handleDeleteItem = (id: string) => {
  dialogStore.showConfirm(
    "이 지출 내역을 삭제하시겠습니까?",
    () => {
      coupleStore.deleteLivingItem(selectedYear.value, selectedMonth.value, id);
      showItemModal.value = false;
    },
    "지출 내역 삭제",
    "delete_outline"
  );
};

// Category filter selection
const activeCategoryFilter = ref<string>("전체");

const filteredItems = computed(() => {
  if (activeCategoryFilter.value === "전체") {
    return record.value.items;
  }
  return record.value.items.filter((i) => i.category === activeCategoryFilter.value);
});

// Calculations
const totalSpent = computed(() => {
  return record.value.items.reduce((sum, item) => sum + Number(item.amount), 0);
});

const remainingBalance = computed(() => {
  return record.value.targetSavings - totalSpent.value;
});

const spentPercentage = computed(() => {
  if (!record.value.targetSavings || record.value.targetSavings === 0) return 0;
  const pct = Math.round((totalSpent.value / record.value.targetSavings) * 100);
  return Math.min(pct, 100);
});

// 카테고리별 지출 금액 집계
const categoryTotals = computed(() => {
  const map: Record<string, number> = {};
  coupleStore.livingCategories.forEach((cat) => {
    map[cat] = 0;
  });
  record.value.items.forEach((item) => {
    const amount = Number(item.amount) || 0;
    map[item.category] = (map[item.category] || 0) + amount;
  });
  return map;
});

// 현재 선택된 카테고리의 상세 통계 요약
const selectedCategoryStats = computed(() => {
  const isAll = activeCategoryFilter.value === "전체";
  const items = isAll ? record.value.items : record.value.items.filter((i) => i.category === activeCategoryFilter.value);
  const categoryTotal = items.reduce((sum, i) => sum + Number(i.amount) || 0, 0);
  const overallTotal = totalSpent.value;
  const percentage = overallTotal > 0 ? Math.round((categoryTotal / overallTotal) * 100) : 0;
  
  const paidByGongdong = items.filter((i) => i.paidBy === "공동").reduce((sum, i) => sum + Number(i.amount) || 0, 0);
  const paidByUju = items.filter((i) => i.paidBy === "우주").reduce((sum, i) => sum + Number(i.amount) || 0, 0);
  const paidByHyebin = items.filter((i) => i.paidBy === "혜빈").reduce((sum, i) => sum + Number(i.amount) || 0, 0);

  return {
    isAll,
    name: activeCategoryFilter.value,
    total: categoryTotal,
    count: items.length,
    percentage,
    paidByGongdong,
    paidByUju,
    paidByHyebin,
  };
});
</script>

<template>
  <div class="living-page-container">
    <!-- Header Banner -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-badge">
          <span class="badge-icon">👛</span>
          <span>생활비 현황</span>
        </div>
        <div class="date-picker-row">
          <select v-model="selectedYear" class="select-chip">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}년</option>
          </select>
          <select v-model="selectedMonth" class="select-chip">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
          </select>
          <button
            v-if="selectedYear !== currentThisYear"
            class="reset-today-chip"
            @click="resetToThisYear"
            title="올해로 돌아가기"
          >
            올해
          </button>
        </div>
      </div>

      <!-- Living Summary Dashboard -->
      <div class="savings-summary-box">
        <div class="metrics-grid">
          <!-- Collected Amount Column -->
          <div class="metric-card collected" @click="openTargetModal">
            <div class="metric-label">
              <span>이번 달 모인 금액</span>
              <i class="material-icons edit-icon">edit</i>
            </div>
            <div class="metric-val bold">{{ record.targetSavings.toLocaleString() }} <span class="unit">원</span></div>
          </div>

          <!-- Spent Amount Column -->
          <div class="metric-card spent">
            <div class="metric-label">사용한 지출</div>
            <div class="metric-val text-rose-600">-{{ totalSpent.toLocaleString() }} <span class="unit">원</span></div>
          </div>

          <!-- Remaining Balance Column -->
          <div class="metric-card remaining">
            <div class="metric-label">남은 잔액</div>
            <div class="metric-val bold" :class="remainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'">
              {{ remainingBalance.toLocaleString() }} <span class="unit">원</span>
            </div>
          </div>
        </div>

        <!-- Modern Progress Bar -->
        <div class="progress-bar-wrapper">
          <div class="progress-info">
            <span class="left-txt">지출 {{ totalSpent.toLocaleString() }}원 ({{ spentPercentage }}%)</span>
            <span class="right-txt">잔액 {{ remainingBalance.toLocaleString() }}원</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: spentPercentage + '%' }"
              :class="{ warning: spentPercentage > 85 }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Filter Chips & Add Category / Add Expense Button -->
    <div class="action-bar flex-col gap-2">
      <div class="category-scroll-chips">
        <button
          class="cat-chip"
          :class="{ active: activeCategoryFilter === '전체' }"
          @click="activeCategoryFilter = '전체'"
        >
          <span>전체</span>
          <span class="chip-sub-amt">{{ totalSpent.toLocaleString() }}원</span>
        </button>

        <button
          v-for="cat in coupleStore.livingCategories"
          :key="cat"
          class="cat-chip"
          :class="{ active: activeCategoryFilter === cat }"
          @click="activeCategoryFilter = cat"
        >
          <span>{{ cat }}</span>
          <span class="chip-sub-amt">{{ (categoryTotals[cat] || 0).toLocaleString() }}원</span>
        </button>

        <button class="add-cat-chip-btn" @click="showAddCategoryModal = true">
          + 항목 추가
        </button>
      </div>

      <div class="flex-end-row">
        <button class="add-expense-btn" @click="openAddItemModal">
          <i class="material-icons">add</i> 지출 등록
        </button>
      </div>
    </div>

    <!-- Selected Category Summary Dashboard Card (UX/UI Optimized) -->
    <div class="category-summary-dashboard-card">
      <div class="dash-top">
        <div class="dash-title-group">
          <span class="dash-tag">🏷️ {{ selectedCategoryStats.name }} 지출 합계</span>
          <h4 class="dash-amount text-rose-600">{{ selectedCategoryStats.total.toLocaleString() }} <span class="unit">원</span></h4>
        </div>
        <div class="dash-right-info">
          <span v-if="!selectedCategoryStats.isAll && totalSpent > 0" class="pct-badge">
            전체 지출의 {{ selectedCategoryStats.percentage }}%
          </span>
          <span class="count-badge">총 {{ selectedCategoryStats.count }}건</span>
        </div>
      </div>

      <!-- PaidBy Breakdown Row -->
      <div v-if="selectedCategoryStats.count > 0" class="dash-paidby-row">
        <div class="paidby-item 공동">
          <span class="lbl">공동 결제</span>
          <span class="val">{{ selectedCategoryStats.paidByGongdong.toLocaleString() }}원</span>
        </div>
        <div class="paidby-item 우주">
          <span class="lbl">우주 결제</span>
          <span class="val">{{ selectedCategoryStats.paidByUju.toLocaleString() }}원</span>
        </div>
        <div class="paidby-item 혜빈">
          <span class="lbl">혜빈 결제</span>
          <span class="val">{{ selectedCategoryStats.paidByHyebin.toLocaleString() }}원</span>
        </div>
      </div>
    </div>

    <!-- Expense Items List -->
    <div class="items-container">
      <div v-if="filteredItems.length === 0" class="empty-box">
        <i class="material-icons">receipt_long</i>
        <p>등록된 지출 내역이 없습니다.</p>
      </div>

      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="expense-item-card"
        @click="openEditItemModal(item)"
      >
        <div class="item-left">
          <div class="item-category-tag" :class="item.category">
            {{ item.category }}
          </div>
          <div class="item-details">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-meta">
              <span>📅 {{ item.date }}</span>
              <span class="paid-by-badge" :class="item.paidBy">{{ item.paidBy || '공동' }} 결제</span>
            </div>
          </div>
        </div>

        <div class="item-right">
          <span class="item-amount">-{{ Number(item.amount).toLocaleString() }}원</span>
          <button class="del-icon-btn" @click.stop="handleDeleteItem(item.id)">
            <i class="material-icons">delete_outline</i>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Target Savings Modal -->
    <div v-if="showTargetModal" class="modal-overlay" @click.self="showTargetModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>💰 {{ selectedMonth }}월 모인 금액 설정</h3>
          <button class="close-btn" @click="showTargetModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>이번 달 모인 금액 (원)</label>
            <input
              v-model.number="editingTargetAmount"
              type="number"
              step="10000"
              placeholder="예: 1500000"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="save-btn" @click="saveTargetAmount">
            저장하기
          </button>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCategoryModal" class="modal-overlay" @click.self="showAddCategoryModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>🏷️ 새 지출 카테고리 추가</h3>
          <button class="close-btn" @click="showAddCategoryModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>새 카테고리 이름</label>
            <input
              v-model="newCategoryInput"
              type="text"
              placeholder="예: 경조사비, 병원비, 부모님용돈"
              @keyup.enter="handleAddCategory"
            />
          </div>

          <div class="existing-cats-list">
            <label>현재 등록된 카테고리</label>
            <div class="cat-tags-wrap">
              <span
                v-for="c in coupleStore.livingCategories"
                :key="c"
                class="existing-cat-badge"
              >
                {{ c }}
                <button
                  v-if="!['식비', '문화생활', '생필품', '기타'].includes(c)"
                  class="del-tag-btn"
                  @click="handleDeleteCategory(c)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="save-btn" @click="handleAddCategory">
            추가하기
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div v-if="showItemModal" class="modal-overlay" @click.self="showItemModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>👛 {{ isEditMode ? '지출 내역 수정' : '지출 내역 등록' }}</h3>
          <button class="close-btn" @click="showItemModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>카테고리</label>
            <select v-model="editingItem.category" class="form-select">
              <option
                v-for="c in coupleStore.livingCategories"
                :key="c"
                :value="c"
              >
                {{ c }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label>내역 이름</label>
            <input v-model="editingItem.title" type="text" placeholder="예: 주말 장보기, 영화 데이트" />
          </div>

          <div class="input-group">
            <label>금액 (원)</label>
            <input v-model.number="editingItem.amount" type="number" step="1000" placeholder="0" />
          </div>

          <div class="input-group">
            <label>결제일</label>
            <input v-model="editingItem.date" type="date" />
          </div>

          <div class="input-group">
            <label>결제 주체</label>
            <div class="radio-selector">
              <button
                v-for="owner in ['공동', '우주', '혜빈']"
                :key="owner"
                type="button"
                class="radio-btn"
                :class="{ active: editingItem.paidBy === owner }"
                @click="editingItem.paidBy = owner"
              >
                {{ owner }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="isEditMode" type="button" class="del-btn" @click="handleDeleteItem(editingItem.id!)">
            삭제
          </button>
          <button type="button" class="save-btn" @click="handleSaveItem">
            저장하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.living-page-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Card */
.page-header-card {
  background: #ffffff;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #d1f2e2;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.05);
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
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
}

.header-badge .badge-icon {
  font-size: 1.1rem;
}

.date-picker-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.select-chip {
  background: #fff;
  border: 1px solid #a5d6a7;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2e7d32;
  outline: none;
  text-align: center;
  text-align-last: center;
  cursor: pointer;
}

.reset-today-chip {
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

/* Living Summary Box & Metrics Grid */
.savings-summary-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #f4fbf7;
  border: 1px solid #e0f2f1;
  border-radius: 18px;
  padding: 12px 8px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-card.collected {
  cursor: pointer;
  border-right: 1px dashed #b2dfdb;
  padding-right: 2px;
}

.metric-card.spent {
  border-right: 1px dashed #b2dfdb;
  padding-right: 2px;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.76rem;
  color: #666;
  font-weight: 700;
  margin-bottom: 2px;
}

.metric-label .edit-icon {
  font-size: 0.85rem;
  color: #2e7d32;
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

/* Progress Bar */
.progress-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e0f2f1;
  border-radius: 14px;
  padding: 10px 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #555;
  font-weight: 700;
}

.progress-track {
  width: 100%;
  height: 9px;
  background: #e8f5e9;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #66bb6a 0%, #388e3c 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-fill.warning {
  background: linear-gradient(90deg, #ff7043 0%, #e53935 100%);
}

/* Action Bar */
.action-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-scroll-chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.cat-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #555;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cat-chip.active {
  background: #2e7d32;
  color: #fff;
  border-color: #1b5e20;
  box-shadow: 0 3px 10px rgba(46, 125, 50, 0.25);
}

.chip-sub-amt {
  font-size: 0.72rem;
  font-weight: 800;
  color: #888;
  margin-top: 1px;
}

.cat-chip.active .chip-sub-amt {
  color: #e8f5e9;
}

.add-cat-chip-btn {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px stroke #a5d6a7;
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.flex-end-row {
  display: flex;
  justify-content: flex-end;
}

.add-expense-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.add-expense-btn i {
  font-size: 1.15rem;
}

/* Category Summary Dashboard Card */
.category-summary-dashboard-card {
  background: #ffffff;
  border: 1px solid #c8e6c9;
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow: 0 4px 14px rgba(46, 125, 50, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dash-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dash-title-group {
  display: flex;
  flex-direction: column;
}

.dash-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2e7d32;
}

.dash-amount {
  font-size: 1.25rem;
  font-weight: 800;
  margin-top: 2px;
}

.dash-right-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.pct-badge {
  background: #fff3e0;
  color: #e65100;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #ffe0b2;
}

.count-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.dash-paidby-row {
  display: flex;
  gap: 6px;
  border-top: 1px dashed #e0f2f1;
  padding-top: 8px;
}

.paidby-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  border-radius: 10px;
}

.paidby-item.공동 { background: #f3e5f5; color: #7b1fa2; }
.paidby-item.우주 { background: #e3f2fd; color: #1565c0; }
.paidby-item.혜빈 { background: #fce4ec; color: #c2185b; }

.paidby-item .lbl {
  font-size: 0.68rem;
  font-weight: 700;
  opacity: 0.85;
}

.paidby-item .val {
  font-size: 0.82rem;
  font-weight: 800;
}

/* Items List */
.items-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.expense-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #f0e6dc;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: transform 0.2s;
}

.expense-item-card:active {
  transform: scale(0.98);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-category-tag {
  font-size: 0.82rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 10px;
  background: #eee;
  color: #555;
}

.item-category-tag.식비 { background: #ffe0b2; color: #e65100; }
.item-category-tag.문화생활 { background: #e1bee7; color: #6a1b9a; }
.item-category-tag.생필품 { background: #b2dfdb; color: #004d40; }
.item-category-tag.기타 { background: #cfd8dc; color: #37474f; }

.item-details {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #333;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #888;
}

.paid-by-badge {
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 6px;
}

.paid-by-badge.우주 { background: #e3f2fd; color: #1565c0; }
.paid-by-badge.혜빈 { background: #fce4ec; color: #c2185b; }
.paid-by-badge.공동 { background: #f3e5f5; color: #7b1fa2; }

.item-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-amount {
  font-size: 1.02rem;
  font-weight: 800;
  color: #e53935;
}

.del-icon-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
}

.del-icon-btn i {
  font-size: 1.1rem;
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
  max-width: 360px;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #aaa;
  cursor: pointer;
}

.input-group {
  margin-bottom: 14px;
}

.input-group label {
  display: block;
  font-size: 0.92rem;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.02rem;
  box-sizing: border-box;
  background: #ffffff;
  color: #333;
}

/* iOS WebKit Date Input Fixes */
.input-group input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
  min-height: 46px;
  line-height: 1.4;
  background-color: #ffffff;
  display: block;
  width: 100%;
  font-size: 1.02rem;
  color: #333;
}

.input-group input[type="date"]::-webkit-date-and-time-value {
  text-align: left;
  line-height: 1.4;
  min-height: 1.4em;
}

.form-select {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.02rem;
}

.radio-selector {
  display: flex;
  gap: 8px;
}

.radio-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 0.95rem;
  font-weight: 700;
  color: #555;
  cursor: pointer;
}

.radio-btn.active {
  background: #a5d6a7;
  border-color: #4caf50;
  color: #1b5e20;
}

.existing-cats-list {
  margin-top: 10px;
}

.cat-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.existing-cat-badge {
  background: #f0f0f0;
  color: #444;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.del-tag-btn {
  background: none;
  border: none;
  color: #ef5350;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.save-btn {
  flex: 1;
  background: #4caf50;
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
</style>
