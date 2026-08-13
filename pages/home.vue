<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type DDayItem } from "~/stores/useCoupleStore";
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

definePageMeta({
  layout: "user-layout",
});

const coupleStore = useCoupleStore();
const dialogStore = useCoupleDialogStore();

// D-Day Modal state
const showDDayModal = ref(false);
const editingDDay = ref<Partial<DDayItem>>({
  title: "",
  date: new Date().toISOString().split("T")[0],
  icon: "favorite",
});

const isEditMode = ref(false);

const openAddModal = () => {
  editingDDay.value = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    icon: "favorite",
  };
  isEditMode.value = false;
  showDDayModal.value = true;
};

const openEditModal = (item: DDayItem) => {
  editingDDay.value = { ...item };
  isEditMode.value = true;
  showDDayModal.value = true;
};

const handleSaveDDay = () => {
  if (!editingDDay.value.title || !editingDDay.value.date) {
    dialogStore.showAlert("제목과 날짜를 입력해주세요.", "입력 확인", "info");
    return;
  }
  coupleStore.saveDDay(editingDDay.value);
  showDDayModal.value = false;
};

const handleDeleteDDay = (id: string) => {
  dialogStore.showConfirm("이 기념일을 삭제하시겠습니까?", () => {
    coupleStore.deleteDDay(id);
    showDDayModal.value = false;
  }, "기념일 삭제", "delete_outline");
};

// Current Month Summary Data
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

// Utility summary
const currentUtilityRec = computed(() => coupleStore.getUtilityRecord(currentYear, currentMonth));
const utilityTotal = computed(() => coupleStore.getUtilityTotal(currentUtilityRec.value));
const utilityPerPerson = computed(() => coupleStore.getUtilityPerPerson(currentUtilityRec.value));

// Living summary
const currentLivingRec = computed(() => coupleStore.getLivingRecord(currentYear, currentMonth));
const totalSpent = computed(() => currentLivingRec.value.items.reduce((sum, i) => sum + Number(i.amount), 0));
const remainingLiving = computed(() => currentLivingRec.value.targetSavings - totalSpent.value);

// Debts summary (소유자별 구분 및 정규화 매칭)
const selectedDebtOwner = ref<'전체' | '공동' | '우주' | '혜빈'>('전체');
const validDebts = computed(() => coupleStore.debts.filter((d) => !d.excludeFromStats));

const getNormalizedOwner = (ownerStr?: string): '공동' | '우주' | '혜빈' => {
  if (!ownerStr) return '공동';
  const clean = String(ownerStr).trim();
  if (clean === '공용' || clean === '공동') return '공동';
  if (clean.includes('우주')) return '우주';
  if (clean.includes('혜빈')) return '혜빈';
  return '공동';
};

const debtSummaryByOwner = computed(() => {
  const getSum = (ownerFilter?: '공동' | '우주' | '혜빈') => {
    const list = ownerFilter 
      ? validDebts.value.filter((d) => getNormalizedOwner(d.owner) === ownerFilter)
      : validDebts.value;
    return {
      interest: list.reduce((sum, d) => sum + Number(d.monthlyInterest) || 0, 0),
      payment: list.reduce((sum, d) => sum + Number(d.monthlyPayment) || 0, 0),
      remaining: list.reduce((sum, d) => sum + Number(d.remainingAmount) || 0, 0),
      count: list.length,
    };
  };

  return {
    전체: getSum(),
    공동: getSum('공동'),
    우주: getSum('우주'),
    혜빈: getSum('혜빈'),
  };
});

const currentDebtMetrics = computed(() => debtSummaryByOwner.value[selectedDebtOwner.value] || debtSummaryByOwner.value['전체']);

// Upcoming schedules (종료일 기준 오늘 이후 또는 진행 중인 일정)
const upcomingSchedules = computed(() => {
  const todayStr = today.toISOString().split("T")[0];
  return coupleStore.schedules
    .filter((s) => {
      const finishDate = s.endDate || s.date;
      return finishDate >= todayStr && !s.isCompleted;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
});
</script>

<template>
  <div class="home-page-container">
    <!-- D-Day Main Section -->
    <div class="section-container">
      <div class="section-header">
        <div class="section-title">
          <i class="material-icons text-pink-500">favorite</i>
          <span>우리들의 D-Day</span>
        </div>
        <button class="add-btn" @click="openAddModal">
          <i class="material-icons">add</i> 기념일 추가
        </button>
      </div>

      <!-- D-Day Cards Grid: nothing renders until Supabase fetch is fully complete -->
      <div v-if="coupleStore.isLoaded && coupleStore.ddays.length === 0" class="empty-dday-box">
        등록된 기념일이 없습니다. 오른쪽 위 '+ 기념일 추가' 버튼으로 소중한 날을 등록해보세요! 💕
      </div>
      <div v-else-if="coupleStore.isLoaded && coupleStore.ddays.length > 0" class="dday-grid">
        <div
          v-for="item in coupleStore.ddays"
          :key="item.id"
          class="dday-card"
          :class="{ 'main-card': item.isMain }"
          @click="openEditModal(item)"
        >
          <div class="dday-card-header">
            <span class="dday-icon">
              <i class="material-icons">{{ item.icon || 'favorite' }}</i>
            </span>
            <span class="dday-badge">D+{{ coupleStore.getDaysCount(item.date) }}</span>
          </div>
          <div class="dday-title">{{ item.title }}</div>
          <div class="dday-date">{{ item.date }} 부터 함께하는 중</div>
        </div>
      </div>
    </div>

    <!-- Quick Summary Section -->
    <div class="section-container">
      <div class="section-header">
        <div class="section-title">
          <i class="material-icons text-amber-500">pie_chart</i>
          <span>{{ currentMonth }}월 현황 요약</span>
        </div>
      </div>

      <div class="summary-cards-grid">
        <!-- Utility Summary Card -->
        <nuxt-link to="/utility" class="summary-card util-card">
          <div class="card-badge-row">
            <span class="cute-badge util">💡 공과금 (1인 부담)</span>
            <span class="more-txt">자세히 ›</span>
          </div>
          <div class="card-main-val util">
            {{ utilityPerPerson.toLocaleString() }} <span class="unit">원</span>
          </div>
          <div class="card-sub-info">
            전체 합계 {{ utilityTotal.toLocaleString() }}원
          </div>
        </nuxt-link>

        <!-- Living Summary Card -->
        <nuxt-link to="/living" class="summary-card living-card">
          <div class="card-badge-row">
            <span class="cute-badge living">👛 남은 생활비</span>
            <span class="more-txt">자세히 ›</span>
          </div>
          <div class="card-main-val living">
            {{ remainingLiving.toLocaleString() }} <span class="unit">원</span>
          </div>
          <div class="card-sub-info">
            모인 금액 {{ currentLivingRec.targetSavings.toLocaleString() }}원 중 {{ totalSpent.toLocaleString() }}원 사용
          </div>
        </nuxt-link>

        <!-- Debt Summary Card -->
        <div class="summary-card debt-card">
          <div class="card-badge-row">
            <span class="cute-badge debt">💳 월 대출 상환액 ({{ selectedDebtOwner }})</span>
            
            <!-- Owner Filter Pills -->
            <div class="mini-owner-selector">
              <button
                v-for="ow in (['전체', '공동', '우주', '혜빈'] as const)"
                :key="ow"
                type="button"
                class="mini-ow-btn"
                :class="{ active: selectedDebtOwner === ow }"
                @click.stop.prevent="selectedDebtOwner = ow"
              >
                {{ ow }}
              </button>
            </div>

            <nuxt-link to="/debt" class="more-txt">자세히 ›</nuxt-link>
          </div>

          <div class="card-main-val debt">
            {{ currentDebtMetrics.payment.toLocaleString() }} <span class="unit">원</span>
          </div>

          <!-- Owner Breakdown Chips (Monthly Payment per Owner) -->
          <div class="debt-owner-breakdown">
            <button
              type="button"
              class="ow-chip-item 공동"
              :class="{ active: selectedDebtOwner === '공동' }"
              @click.stop.prevent="selectedDebtOwner = '공동'"
            >
              <span class="ow-lbl">공동</span>
              <span class="ow-val">{{ debtSummaryByOwner.공동.payment.toLocaleString() }}원</span>
            </button>
            <button
              type="button"
              class="ow-chip-item 우주"
              :class="{ active: selectedDebtOwner === '우주' }"
              @click.stop.prevent="selectedDebtOwner = '우주'"
            >
              <span class="ow-lbl">우주</span>
              <span class="ow-val">{{ debtSummaryByOwner.우주.payment.toLocaleString() }}원</span>
            </button>
            <button
              type="button"
              class="ow-chip-item 혜빈"
              :class="{ active: selectedDebtOwner === '혜빈' }"
              @click.stop.prevent="selectedDebtOwner = '혜빈'"
            >
              <span class="ow-lbl">혜빈</span>
              <span class="ow-val">{{ debtSummaryByOwner.혜빈.payment.toLocaleString() }}원</span>
            </button>
          </div>

          <div class="card-sub-info">
            잔여 원금 {{ currentDebtMetrics.remaining.toLocaleString() }}원 · 이자 {{ currentDebtMetrics.interest.toLocaleString() }}원 (대출 {{ currentDebtMetrics.count }}건)
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Schedules Section -->
    <div class="section-container">
      <div class="section-header">
        <div class="section-title">
          <i class="material-icons text-indigo-500">event</i>
          <span>다가오는 약속 & 일정</span>
        </div>
        <nuxt-link to="/schedule" class="more-link">전체보기 ›</nuxt-link>
      </div>

      <div class="schedule-list">
        <div v-if="upcomingSchedules.length === 0" class="empty-state">
          <span>다가오는 일정이 없습니다. 일정을 등록해보세요! ✨</span>
        </div>
        <div
          v-for="item in upcomingSchedules"
          :key="item.id"
          class="schedule-card-mini"
        >
          <div class="sched-owner-badge" :class="item.owner">
            {{ item.owner }}
          </div>
          <div class="sched-info">
            <div class="sched-title">{{ item.title }}</div>
            <div class="sched-time">
              <span v-if="item.endDate && item.endDate !== item.date">📅 {{ item.date }} ~ {{ item.endDate }}</span>
              <span v-else>📅 {{ item.date }}</span>
              <span v-if="item.time"> ⏰ {{ item.time }}</span>
            </div>
          </div>
          <span class="category-chip">{{ item.category }}</span>
        </div>
      </div>
    </div>

    <!-- D-Day Add/Edit Modal -->
    <div v-if="showDDayModal" class="modal-overlay" @click.self="showDDayModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditMode ? '기념일 수정' : '새 기념일 등록' }}</h3>
          <button class="close-btn" @click="showDDayModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>기념일 제목</label>
            <input v-model="editingDDay.title" type="text" placeholder="예: 첫 데이트 날, 결혼기념일" />
          </div>
          <div class="input-group">
            <label>시작 날짜</label>
            <input v-model="editingDDay.date" type="date" />
          </div>
          <div class="input-group">
            <label>아이콘 선택</label>
            <div class="icon-selector">
              <button
                v-for="ic in ['favorite', 'pets', 'cake', 'flight', 'home', 'star']"
                :key="ic"
                type="button"
                class="icon-btn"
                :class="{ active: editingDDay.icon === ic }"
                @click="editingDDay.icon = ic"
              >
                <i class="material-icons">{{ ic }}</i>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="isEditMode" type="button" class="del-btn" @click="handleDeleteDDay(editingDDay.id!)">
            삭제
          </button>
          <button type="button" class="save-btn" @click="handleSaveDDay">
            저장하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  padding: 18px;
  border-radius: 24px;
  border: 1px solid #ffe0b2;
  box-shadow: 0 4px 15px rgba(255, 183, 77, 0.12);
}

.welcome-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.85);
  color: #e65100;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.welcome-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #4e2600;
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.welcome-sub {
  font-size: 0.78rem;
  color: #8c4c00;
}

/* Section Common */
.section-container {
  background: #ffffff;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid #f0e6dc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.08rem;
  font-weight: 700;
  color: #3e3332;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #fff0f5;
  color: #e91e63;
  border: none;
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.add-btn i {
  font-size: 1rem;
}

.more-link {
  font-size: 0.88rem;
  color: #888;
  text-decoration: none;
  font-weight: 600;
}

.empty-dday-box {
  text-align: center;
  padding: 20px 14px;
  background: #fffdfa;
  border: 1px dashed #ffd8cc;
  border-radius: 18px;
  font-size: 0.92rem;
  color: #888;
  line-height: 1.5;
}

/* D-Day Grid */
.dday-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
}

.dday-card {
  background: #fffaf5;
  border: 1px solid #ffe8d6;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.dday-card:active {
  transform: scale(0.97);
}

.dday-card.main-card {
  background: linear-gradient(135deg, #fff0f3 0%, #ffdde1 100%);
  border-color: #ffccd5;
}

.dday-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.dday-icon i {
  font-size: 1.35rem;
  color: #e91e63;
}

.dday-badge {
  background: #ff4081;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 10px;
}

.dday-title {
  font-size: 1.02rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
}

.dday-date {
  font-size: 0.8rem;
  color: #777;
}

/* Summary Grid */
.summary-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 22px;
  text-decoration: none;
  border: 1px solid;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

/* Summary Grid */
.summary-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: 18px;
  text-decoration: none;
  border: 1px solid #f0e6dc;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.summary-card:active {
  transform: scale(0.98);
}

.summary-card.util-card {
  background: #fffdf5;
  border-color: #fff3c4;
}

.summary-card.living-card {
  background: #f4fbf7;
  border-color: #d1f2e2;
}

.summary-card.debt-card {
  background: #fff7f8;
  border-color: #fdd8dd;
}

.card-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.mini-owner-selector {
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 4px;
  border-radius: 12px;
  border: 1px solid #ffd5d8;
}

.mini-ow-btn {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  color: #777;
  padding: 2px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-ow-btn.active {
  background: #e53935;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 1px 4px rgba(229, 57, 53, 0.25);
}

.debt-owner-breakdown {
  display: flex;
  gap: 6px;
  margin: 6px 0 4px 0;
}

.ow-chip-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ow-chip-item:active {
  transform: scale(0.95);
}

.ow-chip-item.공동 {
  background: #f3e5f5;
  border-color: #e1bee7;
  color: #7b1fa2;
}

.ow-chip-item.우주 {
  background: #e3f2fd;
  border-color: #bbdefb;
  color: #1565c0;
}

.ow-chip-item.혜빈 {
  background: #fce4ec;
  border-color: #f8bbd0;
  color: #c2185b;
}

.ow-chip-item.active {
  box-shadow: 0 0 0 2px currentColor;
}

.ow-lbl {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.85;
}

.ow-val {
  font-size: 0.82rem;
  font-weight: 800;
}

.cute-badge {
  font-size: 0.82rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.cute-badge.util {
  background: #fff3e0;
  color: #e65100;
}

.cute-badge.living {
  background: #e8f5e9;
  color: #2e7d32;
}

.cute-badge.debt {
  background: #ffebee;
  color: #c62828;
}

.more-txt {
  font-size: 0.78rem;
  color: #999;
  font-weight: 600;
}

.card-main-val {
  font-size: 1.25rem;
  font-weight: 900;
  color: #333;
  margin-bottom: 2px;
}

.card-main-val .unit {
  font-size: 0.88rem;
  font-weight: 700;
}

.card-main-val.util { color: #5d4037; }
.card-main-val.living { color: #1b5e20; }
.card-main-val.debt { color: #b71c1c; }

.card-sub-info {
  font-size: 0.78rem;
  color: #777;
}

/* Schedule List Mini */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 16px 0;
  font-size: 0.88rem;
  color: #999;
}

.schedule-card-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fbfbfb;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #f0f0f0;
}

.sched-owner-badge {
  font-size: 0.8rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
}

.sched-owner-badge.우주 {
  background: #e3f2fd;
  color: #1976d2;
}

.sched-owner-badge.혜빈 {
  background: #fce4ec;
  color: #c2185b;
}

.sched-owner-badge.공동 {
  background: #f3e5f5;
  color: #7b1fa2;
}

.sched-info {
  flex: 1;
}

.sched-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
}

.sched-time {
  font-size: 0.8rem;
  color: #888;
}

.category-chip {
  font-size: 0.78rem;
  background: #eeeeee;
  color: #666;
  padding: 3px 8px;
  border-radius: 6px;
}

/* Modal Styles */
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

.icon-selector {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-btn.active {
  background: #ffe0b2;
  border-color: #ffb74d;
  color: #e65100;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.save-btn {
  flex: 1;
  background: #ff7043;
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
