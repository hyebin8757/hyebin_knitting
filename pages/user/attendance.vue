<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject, computed } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { AttendanceStyle } from "~/assets/style/pages/user/AttendanceStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
interface AttendanceDay {
  dayNum: number;
  isCurrentMonth: boolean;
  status: "day" | "night" | "field" | "absent" | "leave" | "none";
}

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();
const router = useRouter();

const { isEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const hireDate = "2024-03-02";
const birthDate = "1992-07-28";

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const currentDate = ref(new Date());
const isCheckedIn = ref(false);
const isAdminApproved = ref(false); // 관리자 승인 데모 상태 스위치용
const isLeaveConfirmOpen = ref(false);

// Mock attendance history
const attendanceHistory = ref<Record<string, "day" | "night" | "field" | "absent" | "leave">>({
  "2026-07-01": "day",
  "2026-07-02": "day",
  "2026-07-03": "day",
  "2026-07-06": "day",
  "2026-07-07": "night",
  "2026-07-08": "absent",
  "2026-07-09": "field",
  "2026-07-10": "day",
  "2026-07-13": "field",
  "2026-07-14": "night",
  "2026-07-15": "day",
  "2026-07-16": "day",
});

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const toggleCheckIn = () => {
  const todayStr = getFormattedDate(new Date());
  if (!isCheckedIn.value) {
    attendanceHistory.value[todayStr] = "day";
    isCheckedIn.value = true;
  } else {
    delete attendanceHistory.value[todayStr];
    isCheckedIn.value = false;
  }
};

const triggerLeave = () => {
  isLeaveConfirmOpen.value = true;
};

const confirmLeave = () => {
  const todayStr = getFormattedDate(new Date());
  attendanceHistory.value[todayStr] = "leave";
  isLeaveConfirmOpen.value = false;
};

const getFormattedDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/************************************************************
 * Computed
 ************************************************************/
const currentYearMonthLabel = computed(() => {
  return `${currentDate.value.getFullYear()}년 ${currentDate.value.getMonth() + 1}월`;
});

const totalWorkedDays = computed(() => {
  return Object.values(attendanceHistory.value).filter(
    (v) => v === "day" || v === "night" || v === "field" || v === "leave"
  ).length;
});

const totalMissedDays = computed(() => {
  return Object.values(attendanceHistory.value).filter((v) => v === "absent").length;
});

const calendarDays = computed<AttendanceDay[]>(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: AttendanceDay[] = [];

  // Previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      dayNum: prevMonthTotalDays - i,
      isCurrentMonth: false,
      status: "none",
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const status = attendanceHistory.value[dateKey] || "none";
    days.push({
      dayNum: i,
      isCurrentMonth: true,
      status,
    });
  }

  // Next month days (to fill the grid to multiple of 7)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      dayNum: i,
      isCurrentMonth: false,
      status: "none",
    });
  }

  return days;
});

const isTodayEarlyLeave = computed(() => {
  const todayStr = getFormattedDate(new Date());
  return attendanceHistory.value[todayStr] === "leave";
});

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  // Check if already checked in today
  const todayStr = getFormattedDate(new Date());
  const todayStatus = attendanceHistory.value[todayStr];
  if (
    todayStatus === "day" ||
    todayStatus === "night" ||
    todayStatus === "field" ||
    todayStatus === "leave"
  ) {
    isCheckedIn.value = true;
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
  <div :class="cx('attendance-page', AttendanceStyle.Default)">
    <!-- Admin Simulation Switch (관리자 승인 데모 상태 스위치) -->
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.2rem; margin-bottom: 1.6rem; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 1.2rem; color: var(--text-color-3);">[데모용] 관리자 출근 완료(승인) 토글 스위치</span>
      <v-switch v-model="isAdminApproved" hide-details density="compact" color="primary"></v-switch>
    </div>

    <!-- Profile Card (출퇴근 통계, 생일, 입사일) -->
    <div :class="cx('profile-card', AttendanceStyle.ProfileCard)">
      <div class="profile-info">
        <div class="avatar">홍</div>
        <div class="meta">
          <div class="name">홍길동 조합원</div>
          <div class="dates">
            <span>입사일: {{ hireDate }}</span>
            <span>생일: {{ birthDate }}</span>
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="label">출근 일수</span>
          <span class="value work">{{ totalWorkedDays }}일</span>
        </div>
        <div class="stat-item">
          <span class="label">결근 일수</span>
          <span class="value miss">{{ totalMissedDays }}일</span>
        </div>
      </div>
    </div>

    <!-- Real-time Shift Controls (관리자 승인 완료 시 다른 위치에 뜨는 조퇴 신청 버튼 영역) -->
    <div v-if="isAdminApproved && isCheckedIn" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1.6rem; padding: 1.6rem; margin-bottom: 2.4rem; display: flex; flex-direction: column; gap: 1.2rem;">
      <div style="display: flex; align-items: center; gap: 0.8rem; font-size: 1.4rem; font-weight: 700; color: var(--white-color);">
        <i class="material-icons" style="color: #b5179e;">time_to_leave</i>
        <span>실시간 근무 조율</span>
      </div>
      
      <div v-if="isTodayEarlyLeave" style="text-align: center; padding: 1rem; font-size: 1.3rem; color: #b5179e; font-weight: 600; background: rgba(155, 93, 229, 0.05); border-radius: 0.8rem;">
        금일 조퇴 신청이 완료되었습니다.
      </div>
      <div v-else :class="cx(AttendanceStyle.ActionArea)">
        <v-btn class="leave-btn" @click="triggerLeave">
          조퇴 신청
        </v-btn>
      </div>
    </div>

    <!-- Attendance Calendar -->
    <div :class="cx('attendance-calendar', AttendanceStyle.CalendarContainer)">
      <div class="cal-header">
        <div class="cal-title">{{ currentYearMonthLabel }}</div>
        <div class="cal-nav">
          <button @click="prevMonth">
            <i class="material-icons">chevron_left</i>
          </button>
          <button @click="nextMonth">
            <i class="material-icons">chevron_right</i>
          </button>
        </div>
      </div>

      <div class="cal-weekdays">
        <div>일</div>
        <div>월</div>
        <div>화</div>
        <div>수</div>
        <div>목</div>
        <div>금</div>
        <div>토</div>
      </div>

      <div class="cal-days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'day',
            { 'other-month': !day.isCurrentMonth },
            { 'status-day': day.isCurrentMonth && day.status === 'day' },
            { 'status-night': day.isCurrentMonth && day.status === 'night' },
            { 'status-field': day.isCurrentMonth && day.status === 'field' },
            { 'status-absent': day.isCurrentMonth && day.status === 'absent' },
            { 'status-leave': day.isCurrentMonth && day.status === 'leave' }
          ]"
        >
          {{ day.dayNum }}
        </div>
      </div>

      <!-- Calendar Legend -->
      <div class="cal-legend">
        <div class="legend-item">
          <span class="dot day"></span>
          <span>주간</span>
        </div>
        <div class="legend-item">
          <span class="dot night"></span>
          <span>야간</span>
        </div>
        <div class="legend-item">
          <span class="dot field"></span>
          <span>현장</span>
        </div>
        <div class="legend-item">
          <span class="dot absent"></span>
          <span>결근</span>
        </div>
        <div class="legend-item">
          <span class="dot leave"></span>
          <span>조퇴</span>
        </div>
      </div>
    </div>

    <!-- Actions (출퇴근 체크 버튼 - 관리자 승인 전까지만 노출) -->
    <div v-if="!isAdminApproved" :class="cx('action-area', AttendanceStyle.ActionArea)">
      <v-btn v-if="!isCheckedIn" class="check-btn" @click="toggleCheckIn">
        출근 등록
      </v-btn>
      <v-btn v-else class="cancel-btn" @click="toggleCheckIn">
        출근 취소
      </v-btn>
    </div>

    <!-- Early Leave Confirmation Dialog -->
    <v-dialog v-model="isLeaveConfirmOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: #b5179e; display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">warning</i>
          <span>조퇴 신청 확인</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          오늘 근무를 조퇴 처리하시겠습니까?<br />
          조퇴 처리 시 오늘 출결 상태가 '조퇴'로 기록됩니다.
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isLeaveConfirmOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, #e05780 0%, #b5179e 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="confirmLeave">조퇴 실행</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>

<style lang="scss" scoped></style>
