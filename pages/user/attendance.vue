<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject, computed } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";
import { useUserStore } from "~/stores/useUserStore";

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
const userStore = useUserStore();
const loggedInUser = computed(() => userStore.loggedInUser);

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
const locationsList = ["경인서부", "인천", "객선", "남항", "임항", "현장", "야간"];

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const currentDate = ref(new Date());
const isAdminApproved = ref(false); // 관리자 승인 데모 상태 스위치용
const isLeaveConfirmOpen = ref(false);
const bypassTimeLimit = ref(false); // 오전 6시 제한 해제용 데모 스위치

// 관리자 뷰용 동적 상태
const adminSubTab = ref<'today' | 'history'>('today'); // 'today' | 'history'
const activeAdminGroupTab = ref(1); // 1~4조
const isDeployDialogOpen = ref(false);
const deployTarget = ref<"individual" | "group">("individual");
const selectedWorkerName = ref("");
const selectedGroupId = ref<number | null>(null);
const selectedDeployLocation = ref('');

// 커스텀 알림용 상태
const isCustomCancelConfirmOpen = ref(false);
const cancelTargetType = ref<"self" | "admin_worker">("self");
const cancelTargetName = ref("");

// 로그인된 사용자의 출근 여부 동적 감지
const isCheckedIn = computed(() => {
  const currentName = userStore.loggedInUser?.name;
  if (!currentName) return false;
  const worker = userStore.workers.find(w => w.name === currentName);
  return worker ? worker.checkedIn : false;
});

// 로그인된 사용자의 출퇴근 기록 매핑
const attendanceHistory = computed(() => {
  const history: Record<string, "day" | "night" | "field" | "absent" | "leave"> = {};
  const currentName = userStore.loggedInUser?.name;
  if (!currentName) return history;
  
  userStore.attendanceRecords.forEach(r => {
    if (r.worker_name === currentName) {
      history[r.date] = r.status as any;
    }
  });
  return history;
});

// 일자별 출근 기록 그룹화 (관리자용)
const attendanceByDate = computed(() => {
  const grouped: Record<string, { worker_name: string; role: string; group: number; status: string; location: string }[]> = {};
  
  const sortedRecords = [...userStore.attendanceRecords].sort((a, b) => b.date.localeCompare(a.date));
  
  sortedRecords.forEach(r => {
    if (!grouped[r.date]) {
      grouped[r.date] = [];
    }
    const worker = userStore.workers.find(w => w.name === r.worker_name);
    grouped[r.date].push({
      worker_name: r.worker_name,
      role: worker ? worker.role : "조합원",
      group: worker ? worker.group : 1,
      status: r.status,
      location: r.location || "지정 대기"
    });
  });
  
  return grouped;
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

const toggleCheckIn = async () => {
  const todayStr = getFormattedDate(new Date());
  const currentName = userStore.loggedInUser?.name;
  if (!currentName) return;
  if (!isCheckedIn.value) {
    await userStore.checkInWorker(currentName, "day");
  } else {
    cancelTargetType.value = "self";
    cancelTargetName.value = currentName;
    isCustomCancelConfirmOpen.value = true;
  }
};

const executeSelfCancel = async () => {
  const currentName = userStore.loggedInUser?.name;
  if (!currentName) return;
  await userStore.cancelCheckIn(currentName);
  isCustomCancelConfirmOpen.value = false;
};

const triggerLeave = () => {
  isLeaveConfirmOpen.value = true;
};

const confirmLeave = async () => {
  const currentName = userStore.loggedInUser?.name;
  if (!currentName) return;
  await userStore.checkInWorker(currentName, "leave");
  isLeaveConfirmOpen.value = false;
};

const getFormattedDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 관리자 액션
const openDeployIndividual = (workerName: string) => {
  deployTarget.value = "individual";
  selectedWorkerName.value = workerName;
  selectedDeployLocation.value = '';
  isDeployDialogOpen.value = true;
};

const openDeployGroup = (groupId: number) => {
  deployTarget.value = "group";
  selectedGroupId.value = groupId;
  selectedDeployLocation.value = '';
  isDeployDialogOpen.value = true;
};

const confirmDeployment = () => {
  if (isEmpty(selectedDeployLocation.value)) return;
  if (deployTarget.value === "individual") {
    userStore.deployWorker(selectedWorkerName.value, selectedDeployLocation.value);
  } else if (deployTarget.value === "group" && selectedGroupId.value !== null) {
    userStore.deployGroup(selectedGroupId.value, selectedDeployLocation.value);
  }
  isDeployDialogOpen.value = false;
};

const cancelWorkerCheckIn = async (name: string) => {
  cancelTargetType.value = "admin_worker";
  cancelTargetName.value = name;
  isCustomCancelConfirmOpen.value = true;
};

const executeAdminCancel = async () => {
  await userStore.cancelCheckIn(cancelTargetName.value);
  isCustomCancelConfirmOpen.value = false;
};

/************************************************************
 * Computed
 ************************************************************/
const userRole = computed(() => userStore.userRole);

// 관리자 조별 출근 인원 필터링 목록
const checkedInGroupWorkers = computed(() => {
  return userStore.workers.filter(
    (w) => w.group === activeAdminGroupTab.value && w.checkedIn
  );
});

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

const isCheckInDisabled = computed(() => {
  return false;
});

const isDateStatusDialogOpen = ref(false);
const selectedCalendarDate = ref("");
const selectedCalendarDayStatus = ref("none");

const onCalendarDayClick = (day: any) => {
  if (!day.isCurrentMonth) return;
  const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day.dayNum).padStart(2, '0')}`;
  selectedCalendarDate.value = dateStr;
  selectedCalendarDayStatus.value = day.status;
  isDateStatusDialogOpen.value = true;
};

const updateDateStatus = async (status: "day" | "night" | "field" | "absent" | "leave" | "none") => {
  const supabase = userStore.getSupabase();
  const name = userStore.loggedInUser?.name;
  if (!name) return;
  
  try {
    if (status === "none") {
      await supabase.from("attendance").delete().eq("worker_name", name).eq("date", selectedCalendarDate.value);
    } else {
      await supabase.from("attendance").upsert({
        worker_name: name,
        date: selectedCalendarDate.value,
        status: status,
        location: status === "field" ? "외근" : ""
      }, { onConflict: "worker_name,date" });
    }
    
    const todayStr = getFormattedDate(new Date());
    if (selectedCalendarDate.value === todayStr) {
      if (status === "none") {
        await supabase.from("workers").update({
          checked_in: false,
          status: "none",
          location: ""
        }).eq("name", name);
      } else {
        await supabase.from("workers").update({
          checked_in: true,
          status: status,
          location: status === "field" ? "외근" : ""
        }).eq("name", name);
      }
    }
    
    await userStore.fetchAllData();
    isDateStatusDialogOpen.value = false;
  } catch (e) {
    console.error("Failed to update status", e);
  }
};

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  //
});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta({
  layout: "user-layout",
});
</script>

<template>
  <!-- 1. 조합원 모드 화면 -->
  <div v-if="userRole === 'member'" :class="cx('attendance-page', AttendanceStyle.Default)">


    <!-- Profile Card (출퇴근 통계, 생일, 입사일) -->
    <div :class="cx('profile-card', AttendanceStyle.ProfileCard)">
      <div class="profile-info">
        <div class="avatar">{{ loggedInUser ? loggedInUser.name.slice(0, 1) : '홍' }}</div>
        <div class="meta">
          <div class="name">{{ loggedInUser ? loggedInUser.name : '홍길동' }} 조합원</div>
          <div class="dates">
            <span>입사일: {{ loggedInUser?.joinDate || hireDate }}</span>
            <span>생일: {{ loggedInUser?.birthDate || birthDate }}</span>
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

    <!-- Real-time Shift Controls (조퇴 신청 버튼 영역) -->
    <div v-if="isCheckedIn" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1.6rem; padding: 1.6rem; margin-bottom: 2.4rem; display: flex; flex-direction: column; gap: 1.2rem;">
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
          :style="{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }"
          @click="onCalendarDayClick(day)"
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

    <!-- Actions (출퇴근 체크 버튼) -->
    <div :class="cx('action-area', AttendanceStyle.ActionArea)">
      <v-btn v-if="!isCheckedIn" class="check-btn" :disabled="isCheckInDisabled" @click="toggleCheckIn">
        출근 등록
      </v-btn>
      <v-btn v-else class="cancel-btn" @click="toggleCheckIn">
        출근 취소
      </v-btn>
      <div v-if="!isCheckedIn && isCheckInDisabled" style="text-align: center; font-size: 1.2rem; color: var(--system-red-color); margin-top: 0.6rem; font-weight: 600;">
        * 출근 등록은 오전 06시까지만 가능합니다.
      </div>
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
    <!-- Calendar Date Click Status Change Dialog -->
    <v-dialog v-model="isDateStatusDialogOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 1.6rem; color: #ffffff; box-shadow: 0 12px 30px rgba(0,0,0,0.5);">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <i class="material-icons" style="color: var(--primary-lighten-color-1);">edit_calendar</i>
          <span>출결 상태 변경</span>
        </v-card-title>
        
        <v-card-text class="py-4 px-0" style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
          선택한 날짜: <strong>{{ selectedCalendarDate }}</strong><br />
          변경할 출결 타입을 선택해 주세요.
        </v-card-text>

        <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 0.4rem; max-height: 250px; overflow-y: auto; padding-right: 0.4rem;">
          <v-btn
            v-for="opt in [
              { label: '주간 근무', val: 'day', color: '#1ad1b1', bg: 'rgba(26, 209, 177, 0.15)' },
              { label: '야간 근무', val: 'night', color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.15)' },
              { label: '현장 근무 (외근)', val: 'field', color: '#3a86ff', bg: 'rgba(58, 134, 255, 0.15)' },
              { label: '조퇴', val: 'leave', color: '#e05780', bg: 'rgba(224, 87, 128, 0.15)' },
              { label: '결근', val: 'absent', color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.15)' },
              { label: '기록 삭제', val: 'none', color: '#ffffff', bg: 'rgba(255, 255, 255, 0.1)' }
            ]"
            :key="opt.val"
            style="width: 100%; border-radius: 0.8rem; font-weight: 600; font-size: 1.3rem; height: 4rem !important; justify-content: flex-start; padding-left: 1.6rem !important;"
            :style="{ background: opt.bg + ' !important', color: opt.color + ' !important', border: '1px solid ' + opt.color + '33 !important' }"
            @click="updateDateStatus(opt.val)"
          >
            {{ opt.label }}
          </v-btn>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.3rem;" @click="isDateStatusDialogOpen = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- 2. 관리자 모드 화면 -->
  <div v-else :class="cx('attendance-page', AttendanceStyle.Default)">
    <!-- Admin Sub-tab Selector (당일 현황 vs 일자별 기록) -->
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
      <button 
        :style="{
          padding: '0.8rem 1.6rem',
          borderRadius: '0.8rem',
          fontSize: '1.4rem',
          fontWeight: '700',
          transition: 'all 0.2s',
          background: adminSubTab === 'today' ? 'rgba(35, 102, 180, 0.2) !important' : 'transparent',
          color: adminSubTab === 'today' ? '#88c5ff' : 'rgba(255,255,255,0.6)',
          border: '1px solid ' + (adminSubTab === 'today' ? 'rgba(136, 197, 255, 0.3)' : 'transparent')
        }"
        @click="adminSubTab = 'today'"
      >
        당일 현황 및 배치
      </button>
      <button 
        :style="{
          padding: '0.8rem 1.6rem',
          borderRadius: '0.8rem',
          fontSize: '1.4rem',
          fontWeight: '700',
          transition: 'all 0.2s',
          background: adminSubTab === 'history' ? 'rgba(35, 102, 180, 0.2) !important' : 'transparent',
          color: adminSubTab === 'history' ? '#88c5ff' : 'rgba(255,255,255,0.6)',
          border: '1px solid ' + (adminSubTab === 'history' ? 'rgba(136, 197, 255, 0.3)' : 'transparent')
        }"
        @click="adminSubTab = 'history'"
      >
        일자별 출근 대장
      </button>
    </div>

    <!-- 2-A. 당일 현황 및 배치 지정 화면 -->
    <div v-if="adminSubTab === 'today'" style="display: flex; flex-direction: column; gap: 1.6rem; width: 100%;">
      <!-- Admin Dashboard Info -->
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.6rem; padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.8rem; font-size: 1.6rem; font-weight: 700; color: var(--white-color); margin-bottom: 1.2rem;">
        <i class="material-icons" style="color: var(--primary-lighten-color-1);">supervised_user_circle</i>
        <span>당일 출근 현황 및 배치 배정</span>
      </div>
      <p style="font-size: 1.2rem; color: var(--text-color-3); line-height: 1.5; margin: 0;">
        금일 출근을 완료한 조합원 목록입니다. 각 조별 출근 인원을 확인하고 각 현장 배치 지정을 완료해 주세요.
      </p>
    </div>

    <!-- Group Selector Tabs -->
    <div style="display: flex; gap: 0.8rem; margin-bottom: 1.6rem; background: rgba(255, 255, 255, 0.03); padding: 0.4rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto; white-space: nowrap;">
      <button
        v-for="g in [1, 2, 3, 5, 6, 7, 8]"
        :key="g"
        style="flex: 1; min-width: 5rem; padding: 1rem 0; font-size: 1.3rem; font-weight: 700; border-radius: 0.8rem; border: none; cursor: pointer; transition: all 0.2s;"
        :style="{
          background: activeAdminGroupTab === g ? 'var(--primary-darken-color-1)' : 'transparent',
          color: activeAdminGroupTab === g ? '#ffffff' : 'var(--text-color-3)'
        }"
        @click="activeAdminGroupTab = g"
      >
        {{ g }}조
      </button>
    </div>

    <!-- Group Action Button (조 전체 배치) -->
    <div style="margin-bottom: 1.6rem;">
      <v-btn
        style="width: 100%; height: 4.8rem !important; background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; font-weight: 700; font-size: 1.4rem !important; border-radius: 1rem;"
        @click="openDeployGroup(activeAdminGroupTab)"
      >
        {{ activeAdminGroupTab }}조 전체 현장 배치 지정
      </v-btn>
    </div>

    <!-- Worker List Table/Card Form -->
    <div style="display: flex; flex-direction: column; gap: 1.2rem;">
      <div v-if="checkedInGroupWorkers.length === 0" style="text-align: center; padding: 4rem 0; font-size: 1.3rem; color: var(--text-color-3);">
        금일 출근 등록한 {{ activeAdminGroupTab }}조 조합원이 없습니다.
      </div>
      
      <div
        v-for="w in checkedInGroupWorkers"
        :key="w.name"
        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.2rem; padding: 1.6rem; display: flex; flex-direction: column; gap: 1.4rem;"
      >
        <!-- 상단 행: 조합원 정보 및 현재 배치 정보 -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 1.5rem; font-weight: 700; color: #ffffff;">{{ w.name }}</span>
              <span
                style="font-size: 1.1rem; padding: 0.2rem 0.6rem; border-radius: 0.4rem; font-weight: 600;"
                :style="[
                  w.role === '반장' || w.role === '조장' ? 'background: rgba(249, 149, 0, 0.15); color: var(--secondary-darken-color-1);' :
                  w.role === '좌상' ? 'background: rgba(255, 181, 38, 0.15); color: var(--secondary-darken-color-2);' :
                  'background: rgba(136, 197, 255, 0.1); color: var(--primary-lighten-color-1);'
                ]"
              >
                {{ w.role }}
              </span>
            </div>
            <span style="font-size: 1.1rem; color: var(--text-color-3);">{{ w.phone }}</span>
          </div>

          <div style="text-align: right;">
            <span style="font-size: 1.1rem; color: var(--text-color-3); display: block; margin-bottom: 0.2rem;">현재 배치</span>
            <span
              style="font-size: 1.3rem; font-weight: 700;"
              :style="{ color: w.location ? 'var(--system-green-color)' : 'var(--system-red-color)' }"
            >
              {{ w.location || '미배치' }}
            </span>
          </div>
        </div>

        <!-- 하단 행: 관리자 전용 액션 버튼들 (1:1 너비 반응형 배치) -->
        <div style="display: flex; gap: 0.8rem; width: 100%;">
          <v-btn
            size="small"
            style="flex: 1; background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #ffffff !important; border-radius: 0.8rem; font-weight: 600; padding: 0.6rem 0 !important; height: 3.6rem !important; min-width: auto !important; font-size: 1.2rem;"
            @click="openDeployIndividual(w.name)"
          >
            배치 지정
          </v-btn>
          <v-btn
            size="small"
            style="background: rgba(224, 87, 128, 0.15) !important; border: 1px solid rgba(224, 87, 128, 0.3) !important; color: #e05780 !important; border-radius: 0.8rem; font-weight: 600; padding: 0.6rem 0 !important; height: 3.6rem !important; min-width: auto !important; font-size: 1.2rem; flex: 1;"
            @click="cancelWorkerCheckIn(w.name)"
          >
            출근 취소
          </v-btn>
        </div>
      </div>
    </div>
    </div>

    <!-- 2-B. 일자별 출근 기록 화면 -->
    <div v-else-if="adminSubTab === 'history'" style="display: flex; flex-direction: column; gap: 1.6rem; width: 100%;">
      <div v-if="Object.keys(attendanceByDate).length === 0" style="text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.02); border-radius: 1.6rem; border: 1px dashed rgba(255,255,255,0.1); font-size: 1.4rem; color: var(--text-color-3);">
        <i class="material-icons" style="font-size: 3.6rem; color: rgba(255,255,255,0.15); margin-bottom: 1rem; display: block;">event_busy</i>
        기록된 출퇴근 대장이 없습니다.
      </div>
      <div 
        v-for="(records, date) in attendanceByDate" 
        :key="date"
        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.6rem; padding: 1.6rem; display: flex; flex-direction: column; gap: 1.2rem;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
          <span style="font-size: 1.5rem; font-weight: 700; color: #88c5ff; display: flex; align-items: center; gap: 0.6rem;">
            <i class="material-icons" style="font-size: 1.8rem; color: #88c5ff;">calendar_today</i>
            {{ date }}
          </span>
          <span style="font-size: 1.2rem; background: rgba(35, 102, 180, 0.2); color: #88c5ff; padding: 0.2rem 0.8rem; border-radius: 2rem; font-weight: 600;">
            총 {{ records.length }}명 출근
          </span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          <div 
            v-for="r in records" 
            :key="r.worker_name"
            style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 1rem 1.2rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.03);"
          >
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ r.worker_name }}</span>
              <span style="font-size: 1.1rem; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08); padding: 0.1rem 0.6rem; border-radius: 0.4rem; font-weight: 600;">
                {{ r.role }} ({{ r.group }}조)
              </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span 
                :style="{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.8rem',
                  borderRadius: '0.6rem',
                  color: r.status === 'day' ? '#1ad1b1' : r.status === 'night' ? '#ffcc00' : r.status === 'field' ? '#3a86ff' : '#e05780',
                  background: r.status === 'day' ? 'rgba(26, 209, 177, 0.15)' : r.status === 'night' ? 'rgba(255, 204, 0, 0.15)' : r.status === 'field' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(224, 87, 128, 0.15)'
                }"
              >
                {{ r.status === 'day' ? '주간' : r.status === 'night' ? '야간' : r.status === 'field' ? '외근' : '조퇴' }}
              </span>
              <span 
                v-if="r.location && r.location !== '지정 대기'"
                style="font-size: 1.1rem; color: #88c5ff; background: rgba(136, 197, 255, 0.1); border: 1px solid rgba(136, 197, 255, 0.15); padding: 0.2rem 0.8rem; border-radius: 0.6rem;"
              >
                {{ r.location }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group/Individual Location Deployment Dialog -->
    <v-dialog v-model="isDeployDialogOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 1.6rem; color: #ffffff; box-shadow: 0 12px 30px rgba(0,0,0,0.5);">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <i class="material-icons" style="color: var(--primary-lighten-color-1);">business_center</i>
          <span>{{ deployTarget === 'individual' ? `${selectedWorkerName} 배치 지정` : `${selectedGroupId}조 전체 배치 지정` }}</span>
        </v-card-title>
        
        <v-card-text class="py-4 px-0" style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
          배치할 현장을 선택해 주세요:
        </v-card-text>

        <!-- Location List Selector -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-height: 240px; overflow-y: auto; padding-right: 0.4rem;">
          <v-btn
            v-for="loc in locationsList"
            :key="loc"
            :style="{
              background: selectedDeployLocation === loc ? 'rgba(35, 102, 180, 0.45) !important' : 'rgba(35, 102, 180, 0.12) !important',
              color: selectedDeployLocation === loc ? '#ffffff !important' : '#88c5ff !important',
              borderColor: selectedDeployLocation === loc ? '#88c5ff !important' : 'rgba(136, 197, 255, 0.15) !important',
              borderWidth: '1px',
              borderStyle: 'solid',
              fontWeight: '700',
              borderRadius: '1rem',
              height: '4.4rem',
              fontSize: '1.3rem',
              transition: 'all 0.2s'
            }"
            @click="selectedDeployLocation = loc"
          >
            {{ loc }}
          </v-btn>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn style="background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.7) !important; border-radius: 0.8rem; padding: 0.8rem 2rem !important; height: auto !important; min-width: 8rem !important; font-size: 1.3rem; font-weight: 600;" @click="isDeployDialogOpen = false">닫기</v-btn>
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; height: auto !important; min-width: 8rem !important; font-size: 1.3rem;" @click="confirmDeployment">변경</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Custom Check-in Cancel Confirmation Dialog -->
    <v-dialog v-model="isCustomCancelConfirmOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--system-red-color); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">exit_to_app</i>
          <span>출근 취소 확인</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          <template v-if="cancelTargetType === 'self'">
            출근 등록을 취소하시겠습니까?
          </template>
          <template v-else>
            <strong>{{ cancelTargetName }}</strong> 조합원의 출근을 취소하시겠습니까?
          </template>
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isCustomCancelConfirmOpen = false">닫기</v-btn>
          <v-btn
            style="background: linear-gradient(135deg, rgba(225, 60, 60, 0.8) 0%, rgba(180, 30, 30, 0.8) 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;"
            @click="cancelTargetType === 'self' ? executeSelfCancel() : executeAdminCancel()"
          >
            취소 실행
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
