<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject, computed, reactive } from "vue";
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
import { WorkStyle } from "~/assets/style/pages/user/WorkStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface WorkItem {
  id: number;
  location: string;
  cargo: string;
  details: string;
  safetyInstruction: string;
}

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

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

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const selectedNotice = ref<Notice | null>(null);
const dialog = ref(false);
const isWorkExpanded = ref(true);
const isNoticeExpanded = ref(true);

// 관리자 에디터 다이얼로그용 상태
const isNoticeFormOpen = ref(false);
const isWorkFormOpen = ref(false);
const formMode = ref<"add" | "edit">("add");

const noticeForm = reactive({
  id: null as number | null,
  title: "",
  content: "",
});

const workForm = reactive({
  id: null as number | null,
  location: "",
  cargo: "",
  details: "",
  safetyInstruction: "",
});

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const openNotice = (notice: Notice) => {
  selectedNotice.value = notice;
  dialog.value = true;
};

const toggleWork = () => {
  isWorkExpanded.value = !isWorkExpanded.value;
};

const toggleNotice = () => {
  isNoticeExpanded.value = !isNoticeExpanded.value;
};

// 공지사항 등록 / 수정 핸들러
const openNoticeEditor = (mode: "add" | "edit", item?: Notice) => {
  formMode.value = mode;
  if (mode === "edit" && item) {
    noticeForm.id = item.id;
    noticeForm.title = item.title;
    noticeForm.content = item.content;
  } else {
    noticeForm.id = null;
    noticeForm.title = "";
    noticeForm.content = "";
  }
  isNoticeFormOpen.value = true;
};

const saveNotice = () => {
  if (isEmpty(noticeForm.title) || isEmpty(noticeForm.content)) return;
  const todayStr = new Date().toISOString().split("T")[0];

  if (formMode.value === "add") {
    const nextId = userStore.notices.length > 0 ? Math.max(...userStore.notices.map(n => n.id)) + 1 : 1;
    userStore.notices.unshift({
      id: nextId,
      title: noticeForm.title,
      content: noticeForm.content,
      date: todayStr,
    });
  } else {
    const idx = userStore.notices.findIndex((n) => n.id === noticeForm.id);
    if (idx !== -1) {
      userStore.notices[idx].title = noticeForm.title;
      userStore.notices[idx].content = noticeForm.content;
      userStore.notices[idx].date = todayStr;
    }
  }
  isNoticeFormOpen.value = false;
};

// 현장 작업 안내 등록 / 수정 핸들러
const openWorkEditor = (mode: "add" | "edit", item?: WorkItem) => {
  formMode.value = mode;
  if (mode === "edit" && item) {
    workForm.id = item.id;
    workForm.location = item.location;
    workForm.cargo = item.cargo;
    workForm.details = item.details;
    workForm.safetyInstruction = item.safetyInstruction;
  } else {
    workForm.id = null;
    workForm.location = "";
    workForm.cargo = "";
    workForm.details = "";
    workForm.safetyInstruction = "";
  }
  isWorkFormOpen.value = true;
};

const saveWork = () => {
  if (
    isEmpty(workForm.location) ||
    isEmpty(workForm.cargo) ||
    isEmpty(workForm.details)
  )
    return;

  if (formMode.value === "add") {
    const nextId = userStore.fieldWorks.length > 0 ? Math.max(...userStore.fieldWorks.map(w => w.id)) + 1 : 1;
    userStore.fieldWorks.unshift({
      id: nextId,
      location: workForm.location,
      cargo: workForm.cargo,
      details: workForm.details,
      safetyInstruction: workForm.safetyInstruction,
    });
  } else {
    const idx = userStore.fieldWorks.findIndex((w) => w.id === workForm.id);
    if (idx !== -1) {
      userStore.fieldWorks[idx].location = workForm.location;
      userStore.fieldWorks[idx].cargo = workForm.cargo;
      userStore.fieldWorks[idx].details = workForm.details;
      userStore.fieldWorks[idx].safetyInstruction = workForm.safetyInstruction;
    }
  }
  isWorkFormOpen.value = false;
};

/************************************************************
 * Computed
 ************************************************************/
const userRole = computed(() => userStore.userRole);
const notices = computed(() => userStore.notices);
const workList = computed(() => userStore.fieldWorks);

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta({
  layout: "user-layout",
});
</script>

<template>
  <div :class="cx('work-page', WorkStyle.Default)">
    <!-- Sea Weather (바다 날씨) -->
    <div :class="cx('weather-card', WorkStyle.WeatherCard)">
      <div class="header-weather">
        <div class="title">
          <i class="material-icons">filter_drama</i>
          <span>인천 연안 해상 날씨</span>
        </div>
        <div class="time">16:00 기준</div>
      </div>
      <div class="weather-info">
        <div class="temp-box">
          <div class="temp">28°C</div>
          <div class="desc">맑음 (파고 안정)</div>
        </div>
        <div class="detail-box">
          <div>
            <span>풍향/풍속</span>
            <span>남서풍 4.2m/s</span>
          </div>
          <div>
            <span>유의파고</span>
            <span>0.5m ~ 0.8m</span>
          </div>
          <div>
            <span>해상 경보</span>
            <span>특보 없음</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Work Details (현장 작업 내용) -->
    <div :class="cx('work-details-card', WorkStyle.WorkDetailsCard)">
      <div class="section-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div class="title" style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer;" @click="workList.length >= 3 ? toggleWork() : null">
          <i class="material-icons">build</i>
          <span>오늘의 현장 작업 안내</span>
          <i v-if="workList.length >= 3" :class="['material-icons', 'arrow-icon', { rotated: !isWorkExpanded }]">expand_more</i>
        </div>
        <v-btn
          v-if="userRole === 'admin'"
          size="x-small"
          color="primary"
          style="border-radius: 0.6rem; font-weight: 700; font-size: 1rem; padding: 0 0.8rem !important; height: 2.4rem !important;"
          @click.stop="openWorkEditor('add')"
        >
          등록
        </v-btn>
      </div>

      <div class="work-item-list">
        <div v-for="work in (isWorkExpanded ? workList : (workList.length >= 3 ? workList.slice(0, 2) : workList))" :key="work.id" class="work-item" style="position: relative;">
          <div class="work-header" :style="{ paddingRight: userRole === 'admin' ? '4rem' : '0' }">
            <span class="loc">{{ work.location }}</span>
            <span class="badge">{{ work.cargo }}</span>
          </div>
          <div class="desc">{{ work.details }}</div>
          <div class="safety-rules">
            <i class="material-icons">warning</i>
            <span>{{ work.safetyInstruction }}</span>
          </div>
          
          <v-btn
            v-if="userRole === 'admin'"
            icon
            size="x-small"
            style="position: absolute; top: 1.2rem; right: 1.2rem; background: rgba(255,255,255,0.05); color: #ffffff;"
            @click.stop="openWorkEditor('edit', work)"
          >
            <i class="material-icons" style="font-size: 1.6rem;">edit</i>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Notice Board (공지사항) -->
    <div :class="cx('notices-card', WorkStyle.NoticesCard)">
      <div class="section-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div class="title" style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer;" @click="notices.length >= 3 ? toggleNotice() : null">
          <i class="material-icons">campaign</i>
          <span>노동조합 공지사항</span>
          <i v-if="notices.length >= 3" :class="['material-icons', 'arrow-icon', { rotated: !isNoticeExpanded }]">expand_more</i>
        </div>
        <v-btn
          v-if="userRole === 'admin'"
          size="x-small"
          color="primary"
          style="border-radius: 0.6rem; font-weight: 700; font-size: 1rem; padding: 0 0.8rem !important; height: 2.4rem !important;"
          @click.stop="openNoticeEditor('add')"
        >
          등록
        </v-btn>
      </div>

      <div class="notice-list">
        <div
          v-for="notice in (isNoticeExpanded ? notices : (notices.length >= 3 ? notices.slice(0, 2) : notices))"
          :key="notice.id"
          class="notice-item"
          :style="{ position: 'relative', paddingRight: userRole === 'admin' ? '5rem' : '1.6rem' }"
          @click="openNotice(notice)"
        >
          <span class="nt-title">{{ notice.title }}</span>
          <span class="nt-date">{{ notice.date }}</span>
          
          <v-btn
            v-if="userRole === 'admin'"
            icon
            size="x-small"
            style="position: absolute; top: 50%; transform: translateY(-50%); right: 1.2rem; background: rgba(255,255,255,0.05); color: #ffffff;"
            @click.stop="openNoticeEditor('edit', notice)"
          >
            <i class="material-icons" style="font-size: 1.6rem;">edit</i>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Notice View Dialog (상세 보기) -->
    <v-dialog v-model="dialog" width="500">
      <v-card v-if="selectedNotice" class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          {{ selectedNotice.title }}
        </v-card-title>
        <v-card-text class="py-4 px-0 text-body-1" style="line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          {{ selectedNotice.content }}
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn style="background: rgba(255, 255, 255, 0.1) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="dialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notice Editor Form Dialog (공지사항 등록/수정) -->
    <v-dialog v-model="isNoticeFormOpen" max-width="400">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          {{ formMode === 'add' ? '공지사항 등록' : '공지사항 수정' }}
        </v-card-title>
        
        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">공지 제목</label>
            <v-text-field
              v-model="noticeForm.title"
              variant="solo"
              placeholder="제목을 입력하세요"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">공지 본문</label>
            <v-textarea
              v-model="noticeForm.content"
              variant="solo"
              placeholder="공지 내용을 자세히 작성해 주세요"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isNoticeFormOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="saveNotice">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Work Editor Form Dialog (현장 작업 안내 등록/수정) -->
    <v-dialog v-model="isWorkFormOpen" max-width="400">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          {{ formMode === 'add' ? '현장 작업 안내 등록' : '현장 작업 안내 수정' }}
        </v-card-title>
        
        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">작업 위치</label>
            <v-text-field
              v-model="workForm.location"
              variant="solo"
              placeholder="예: 남항 부두 A선석"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">작업 화물 / 구분</label>
            <v-text-field
              v-model="workForm.cargo"
              variant="solo"
              placeholder="예: 컨테이너 하역"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">작업 상세</label>
            <v-textarea
              v-model="workForm.details"
              variant="solo"
              placeholder="상세 작업 일정 및 유의사항 기술"
              hide-details
              rows="3"
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">안전 수칙</label>
            <v-text-field
              v-model="workForm.safetyInstruction"
              variant="solo"
              placeholder="예: 안전모 착용 필수"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isWorkFormOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="saveWork">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.v-textarea) {
  padding: 0 !important;
  .v-field__input {
    padding: 1rem !important;
    line-height: 1.6 !important;
    font-size: 1.4rem !important;
    color: #222222 !important;
  }
}
</style>
