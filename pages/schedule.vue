<script setup lang="ts">
import { ref, computed } from "vue";
import { useCoupleStore, type ScheduleItem } from "~/stores/useCoupleStore";
import { useCoupleDialogStore } from "~/stores/useCoupleDialogStore";

definePageMeta({
  layout: "user-layout",
});

const coupleStore = useCoupleStore();
const dialogStore = useCoupleDialogStore();

// Current Date & Filters
const today = new Date();
const currentThisYear = today.getFullYear();
const currentYear = ref(currentThisYear);
const currentMonth = ref(today.getMonth() + 1);
const availableYears = Array.from({ length: 16 }, (_, i) => 2020 + i);

const resetToThisYear = () => {
  currentYear.value = currentThisYear;
};

const selectedOwnerFilter = ref<'전체' | '우주' | '혜빈' | '공동'>('전체');
const ownerFilters: ('전체' | '우주' | '혜빈' | '공동')[] = ['전체', '우주', '혜빈', '공동'];

const onStartDateChange = () => {
  if (!editingSchedule.value.endDate || editingSchedule.value.endDate < editingSchedule.value.date!) {
    editingSchedule.value.endDate = editingSchedule.value.date;
  }
};

const isScheduleInMonth = (s: ScheduleItem, year: number, month: number) => {
  const ymStr = `${year}-${String(month).padStart(2, "0")}`;
  const startDate = s.date;
  const endDate = s.endDate || s.date;
  
  if (startDate.startsWith(ymStr) || endDate.startsWith(ymStr)) return true;

  const firstDay = `${ymStr}-01`;
  const lastDayObj = new Date(year, month, 0);
  const lastDay = `${ymStr}-${String(lastDayObj.getDate()).padStart(2, "0")}`;

  return startDate <= lastDay && endDate >= firstDay;
};

// Filtered schedules for selected year & month and owner filter
const monthSchedules = computed(() => {
  return coupleStore.schedules
    .filter((s) => {
      const matchMonth = isScheduleInMonth(s, currentYear.value, currentMonth.value);
      const matchOwner = selectedOwnerFilter.value === '전체' || s.owner === selectedOwnerFilter.value;
      return matchMonth && matchOwner;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
});

// Modal State
const showModal = ref(false);
const isEditMode = ref(false);

useBodyScrollLock(showModal);

const editingSchedule = ref<Partial<ScheduleItem>>({
  owner: '공동',
  title: '',
  date: today.toISOString().split("T")[0],
  endDate: today.toISOString().split("T")[0],
  time: '12:00',
  category: '약속',
  memo: '',
  isCompleted: false,
});

const openAddModal = () => {
  const defaultDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, "0")}-15`;
  editingSchedule.value = {
    owner: selectedOwnerFilter.value === '전체' ? '공동' : selectedOwnerFilter.value,
    title: '',
    date: defaultDate,
    endDate: defaultDate,
    time: '12:00',
    category: '약속',
    memo: '',
    isCompleted: false,
  };
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (item: ScheduleItem) => {
  editingSchedule.value = { ...item };
  if (!editingSchedule.value.endDate) {
    editingSchedule.value.endDate = editingSchedule.value.date;
  }
  isEditMode.value = true;
  showModal.value = true;
};

const handleSaveSchedule = () => {
  if (!editingSchedule.value.title || !editingSchedule.value.date) {
    dialogStore.showAlert("일정 제목과 시작 날짜를 입력해주세요.", "입력 확인", "info");
    return;
  }

  if (!editingSchedule.value.endDate) {
    editingSchedule.value.endDate = editingSchedule.value.date;
  }

  // 시작일이 종료일보다 늦을 경우 안전 처리
  if (editingSchedule.value.endDate < editingSchedule.value.date) {
    dialogStore.showAlert("종료 날짜는 시작 날짜보다 빠를 수 없습니다.", "날짜 확인", "warning");
    return;
  }

  coupleStore.saveSchedule(editingSchedule.value);
  showModal.value = false;
};

const handleDeleteSchedule = (id: string) => {
  dialogStore.showConfirm(
    "이 일정을 삭제하시겠습니까?",
    () => {
      coupleStore.deleteSchedule(id);
      showModal.value = false;
    },
    "일정 삭제",
    "delete_outline"
  );
};

const toggleComplete = (id: string, e: Event) => {
  e.stopPropagation();
  coupleStore.toggleScheduleComplete(id);
};

const getDurationBadge = (item: ScheduleItem) => {
  if (!item.endDate || item.endDate === item.date) return null;
  const start = new Date(item.date);
  const end = new Date(item.endDate);
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > 1) {
    return `${diffDays - 1}박 ${diffDays}일 (${diffDays}일간)`;
  }
  return null;
};
</script>

<template>
  <div class="schedule-page-container">
    <!-- Header Banner -->
    <div class="page-header-card">
      <div class="header-top">
        <div class="header-badge">📅 약속 & 일정 관리</div>
        <div class="month-selector">
          <select v-model="currentYear" class="select-chip">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}년</option>
          </select>
          <select v-model="currentMonth" class="select-chip">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
          </select>
          <button
            v-if="currentYear !== currentThisYear"
            class="reset-today-chip"
            @click="resetToThisYear"
            title="올해로 돌아가기"
          >
            올해
          </button>
        </div>
      </div>

      <!-- Owner Filters Row -->
      <div class="filter-chips-row">
        <button
          v-for="ow in ownerFilters"
          :key="ow"
          class="owner-chip"
          :class="{ active: selectedOwnerFilter === ow }"
          @click="selectedOwnerFilter = ow"
        >
          {{ ow }} 일정
        </button>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="count-info">
        <strong>{{ currentMonth }}월</strong> 총 <strong>{{ monthSchedules.length }}</strong>개의 일정
      </div>
      <button class="add-sched-btn" @click="openAddModal">
        <i class="material-icons">add</i> 일정 등록
      </button>
    </div>

    <!-- Schedule List -->
    <div class="schedules-list">
      <div v-if="monthSchedules.length === 0" class="empty-box">
        <i class="material-icons">event_busy</i>
        <p>이번 달에 등록된 일정이 없습니다.</p>
      </div>

      <div
        v-for="item in monthSchedules"
        :key="item.id"
        class="schedule-card"
        :class="{ completed: item.isCompleted }"
        @click="openEditModal(item)"
      >
        <div class="checkbox-col" @click.stop="toggleComplete(item.id, $event)">
          <i class="material-icons check-icon">
            {{ item.isCompleted ? 'check_box' : 'check_box_outline_blank' }}
          </i>
        </div>

        <div class="sched-main-info">
          <div class="sched-header-row">
            <span class="owner-badge" :class="item.owner">{{ item.owner }}</span>
            <span class="category-tag" :class="item.category">{{ item.category }}</span>
          </div>

          <div class="sched-title-text" :class="{ 'line-through': item.isCompleted }">
            {{ item.title }}
          </div>

          <div class="sched-time-text">
            <span v-if="item.endDate && item.endDate !== item.date" class="range-date-span">
              📅 {{ item.date }} ~ {{ item.endDate }}
              <span v-if="getDurationBadge(item)" class="duration-badge">{{ getDurationBadge(item) }}</span>
            </span>
            <span v-else>📅 {{ item.date }}</span>
            <span v-if="item.time">⏰ {{ item.time }}</span>
          </div>

          <div v-if="item.memo" class="sched-memo-text">
            💬 {{ item.memo }}
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>📅 {{ isEditMode ? '일정 수정' : '새 일정 등록' }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label>소유자 (구분)</label>
            <div class="radio-selector">
              <button
                v-for="ow in ['공동', '우주', '혜빈']"
                :key="ow"
                type="button"
                class="radio-btn"
                :class="{ active: editingSchedule.owner === ow }"
                @click="editingSchedule.owner = ow"
              >
                {{ ow }}
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>일정 제목</label>
            <input v-model="editingSchedule.title" type="text" placeholder="예: 여름 휴가, 땅콩이 예방접종, 부부 데이트" />
          </div>

          <div class="input-row-flex">
            <div class="input-group flex-1">
              <label>시작 날짜 (몇 일부터)</label>
              <input v-model="editingSchedule.date" type="date" @change="onStartDateChange" />
            </div>
            <div class="input-group flex-1">
              <label>종료 날짜 (몇 일까지)</label>
              <input v-model="editingSchedule.endDate" type="date" />
            </div>
          </div>

          <div class="input-group">
            <label>시간 (선택)</label>
            <input v-model="editingSchedule.time" type="time" />
          </div>

          <div class="input-group">
            <label>카테고리</label>
            <div class="radio-selector">
              <button
                v-for="cat in ['약속', '기념일', '일상', '중요']"
                :key="cat"
                type="button"
                class="radio-btn"
                :class="{ active: editingSchedule.category === cat }"
                @click="editingSchedule.category = cat"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="input-group">
            <label>메모 / 상세 내용</label>
            <input v-model="editingSchedule.memo" type="text" placeholder="예: 준비물 챙기기, 장소 정보" />
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="isEditMode" type="button" class="del-btn" @click="handleDeleteSchedule(editingSchedule.id!)">
            삭제
          </button>
          <button type="button" class="save-btn" @click="handleSaveSchedule">
            저장하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-page-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Card */
.page-header-card {
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  padding: 16px;
  border-radius: 24px;
  border: 1px solid #9fa8da;
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
  color: #1a237e;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 4px;
}

.select-chip {
  background: #fff;
  border: 1px solid #9fa8da;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #283593;
  outline: none;
  text-align: center;
  text-align-last: center;
  cursor: pointer;
}

.reset-today-chip {
  background: #3f51b5;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.filter-chips-row {
  display: flex;
  gap: 6px;
}

.owner-chip {
  flex: 1;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid #9fa8da;
  color: #283593;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 8px 0;
  border-radius: 14px;
  cursor: pointer;
  min-height: 40px;
  transition: all 0.15s ease;
}

.owner-chip.active {
  background: #3f51b5;
  color: #fff;
  border-color: #303f9f;
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
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

.add-sched-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #5c6bc0, #3f51b5);
  color: #fff;
  border: none;
  padding: 7px 13px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.2);
  transition: transform 0.15s ease;
}

.add-sched-btn:active {
  transform: scale(0.96);
}

.add-sched-btn i {
  font-size: 1.05rem;
}

/* Schedule List */
.schedules-list {
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

.schedule-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #f0e6dc;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  min-height: 60px;
}

.schedule-card.completed {
  opacity: 0.55;
  background: #f9f9f9;
}

.schedule-card:active {
  transform: scale(0.98);
  background: #f8f8f6;
}

.checkbox-col {
  padding-top: 3px;
  min-width: 28px;
}

.check-icon {
  font-size: 1.6rem;
  color: #3f51b5;
}

.sched-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sched-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.owner-badge {
  font-size: 0.8rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.owner-badge.우주 { background: #e3f2fd; color: #1565c0; }
.owner-badge.혜빈 { background: #fce4ec; color: #c2185b; }
.owner-badge.공동 { background: #f3e5f5; color: #7b1fa2; }

.category-tag {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: #e8eaf6;
  color: #3f51b5;
}

.category-tag.기념일 { background: #ffe0b2; color: #e65100; }
.category-tag.중요 { background: #ffebee; color: #c62828; }

.sched-title-text {
  font-size: 1.05rem;
  font-weight: 800;
  color: #333;
  line-height: 1.3;
}

.sched-title-text.line-through {
  text-decoration: line-through;
  color: #888;
}

.sched-time-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #666;
  flex-wrap: wrap;
}

.range-date-span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.duration-badge {
  background: #e8eaf6;
  color: #3f51b5;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid #c5cae9;
}

.sched-memo-text {
  font-size: 0.82rem;
  color: #777;
  background: #f9f9f9;
  padding: 4px 8px;
  border-radius: 8px;
  margin-top: 2px;
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
  max-height: 80vh;
  max-height: 80dvh;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
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

/* iOS WebKit Date & Time Input Fixes */
.input-group input[type="date"],
.input-group input[type="time"] {
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

.input-group input[type="date"]::-webkit-date-and-time-value,
.input-group input[type="time"]::-webkit-date-and-time-value {
  text-align: left;
  line-height: 1.4;
  min-height: 1.4em;
}

.radio-selector {
  display: flex;
  gap: 6px;
}

.radio-btn {
  flex: 1;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  font-size: 0.92rem;
  font-weight: 700;
  color: #555;
  cursor: pointer;
}

.radio-btn.active {
  background: #c5cae9;
  border-color: #3f51b5;
  color: #1a237e;
}

.input-row-flex {
  display: flex;
  gap: 8px;
}

.flex-1 {
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.save-btn {
  flex: 1;
  background: #3f51b5;
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
