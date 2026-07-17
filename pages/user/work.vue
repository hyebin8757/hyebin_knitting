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
const notices = ref<Notice[]>([
  {
    id: 1,
    title: "여름철 안전 조업 및 수분 섭취 가이드 공지",
    content:
      "최근 연안 부두 온도가 33도 이상 상승함에 따라, 모든 조합원 여러분께서는 40분 작업 후 15분 휴식 및 충분한 이온음료 섭취를 반드시 준수해 주시기 바랍니다.",
    date: "2026-07-15",
  },
  {
    id: 2,
    title: "신임 조합장 취임 및 정기 간담회 안내",
    content:
      "다음 주 수요일(7월 22일) 18:00에 조합 강당에서 신임 조합장님 취임 인사 및 현안 해결을 위한 조합원 정기 간담회가 개최될 예정입니다.",
    date: "2026-07-10",
  },
  {
    id: 3,
    title: "작업장 안전 보호구(안전화, 헬멧) 교체 사업",
    content:
      "노후화된 안전 장구 무상 교체 신청이 진행 중입니다. 각 조 반장님들을 통해 사이즈 취합 후 본관 행정실로 제출 바랍니다.",
    date: "2026-07-05",
  },
]);

const workList = ref<WorkItem[]>([
  {
    id: 1,
    location: "남항 부두 A선석",
    cargo: "컨테이너 화물 하역 작업",
    details:
      "오전 09:00 ~ 오후 18:00 컨테이너 크레인 하역 및 트랙터 이동 작업. 지반 침하 주의.",
    safetyInstruction: "크레인 작업 반경 내 보행 금지 및 유도원 배치 필수",
  },
  {
    id: 1,
    location: "남항 부두 A선석",
    cargo: "컨테이너 화물 하역 작업",
    details:
      "오전 09:00 ~ 오후 18:00 컨테이너 크레인 하역 및 트랙터 이동 작업. 지반 침하 주의.",
    safetyInstruction: "크레인 작업 반경 내 보행 금지 및 유도원 배치 필수",
  },
  {
    id: 1,
    location: "남항 부두 A선석",
    cargo: "컨테이너 화물 하역 작업",
    details:
      "오전 09:00 ~ 오후 18:00 컨테이너 크레인 하역 및 트랙터 이동 작업. 지반 침하 주의.",
    safetyInstruction: "크레인 작업 반경 내 보행 금지 및 유도원 배치 필수",
  },
  {
    id: 2,
    location: "임항 제3부두",
    cargo: "벌크선 석탄 선적 보조",
    details:
      "벨트 컨베이어 라인 모니터링 및 선내 투입 배치. 미세먼지 마스크 착용 필.",
    safetyInstruction: "낙하 위험 구역 진입 통제 및 무전 통신 철저 준수",
  },
]);

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const selectedNotice = ref<Notice | null>(null);
const dialog = ref(false);
const isWorkExpanded = ref(true);
const isNoticeExpanded = ref(true);

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
      <div class="section-header" @click="toggleWork">
        <div class="title">
          <i class="material-icons">build</i>
          <span>오늘의 현장 작업 안내</span>
        </div>
        <i :class="['material-icons', 'arrow-icon', { rotated: !isWorkExpanded }]">expand_more</i>
      </div>

      <div class="work-item-list">
        <div v-for="work in (isWorkExpanded ? workList : workList.slice(0, 2))" :key="work.id" class="work-item">
          <div class="work-header">
            <span class="loc">{{ work.location }}</span>
            <span class="badge">{{ work.cargo }}</span>
          </div>
          <div class="desc">{{ work.details }}</div>
          <div class="safety-rules">
            <i class="material-icons">warning</i>
            <span>{{ work.safetyInstruction }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notice Board (공지사항) -->
    <div :class="cx('notices-card', WorkStyle.NoticesCard)">
      <div class="section-header" @click="toggleNotice">
        <div class="title">
          <i class="material-icons">campaign</i>
          <span>노동조합 공지사항</span>
        </div>
        <i :class="['material-icons', 'arrow-icon', { rotated: !isNoticeExpanded }]">expand_more</i>
      </div>

      <div class="notice-list">
        <div
          v-for="notice in (isNoticeExpanded ? notices : notices.slice(0, 2))"
          :key="notice.id"
          class="notice-item"
          @click="openNotice(notice)"
        >
          <span class="nt-title">{{ notice.title }}</span>
          <span class="nt-date">{{ notice.date }}</span>
        </div>
      </div>
    </div>

    <!-- Notice View Dialog -->
    <v-dialog v-model="dialog" width="500">
      <v-card v-if="selectedNotice">
        <v-card-title
          class="text-h6 bg-primary-darken-color-1 text-white py-4 px-6"
        >
          {{ selectedNotice.title }}
        </v-card-title>
        <v-card-text
          class="pa-6 text-body-1"
          style="line-height: 1.6; color: var(--text-color-1)"
        >
          {{ selectedNotice.content }}
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="text" @click="dialog = false"
            >닫기</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
