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
import { DeploymentStyle } from "~/assets/style/pages/user/DeploymentStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
interface Worker {
  name: string;
  role: "반장" | "조장" | "좌상" | "조합원";
  phone: string;
  status: string;
}

interface SiteDeployment {
  siteName: string;
  workers: Worker[];
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
const siteData = ref<SiteDeployment[]>([
  {
    siteName: "경인서부",
    workers: [
      { name: "김철수", role: "반장", phone: "010-1234-5678", status: "근무중" },
      { name: "이민우", role: "조장", phone: "010-2345-6789", status: "근무중" },
      { name: "박영희", role: "조합원", phone: "010-3456-7890", status: "근무중" },
      { name: "최동해", role: "조합원", phone: "010-4567-8901", status: "대기중" },
    ],
  },
  {
    siteName: "인천",
    workers: [
      { name: "홍길동", role: "반장", phone: "010-5678-1234", status: "근무중" },
      { name: "한지민", role: "좌상", phone: "010-6789-2345", status: "근무중" },
      { name: "강현우", role: "조합원", phone: "010-7890-3456", status: "근무중" },
    ],
  },
  {
    siteName: "객선",
    workers: [
      { name: "윤서준", role: "조장", phone: "010-8901-4567", status: "근무중" },
      { name: "조현아", role: "조합원", phone: "010-9012-5678", status: "근무중" },
    ],
  },
  {
    siteName: "남항",
    workers: [
      { name: "오세훈", role: "반장", phone: "010-1111-2222", status: "근무중" },
      { name: "정다은", role: "조합원", phone: "010-3333-4444", status: "근무중" },
    ],
  },
  {
    siteName: "임항",
    workers: [
      { name: "신동엽", role: "좌상", phone: "010-5555-6666", status: "근무중" },
      { name: "유재석", role: "조합원", phone: "010-7777-8888", status: "근무중" },
    ],
  },
  {
    siteName: "현장",
    workers: [
      { name: "강호동", role: "반장", phone: "010-9999-0000", status: "근무중" },
      { name: "이수근", role: "조합원", phone: "010-1212-3434", status: "근무중" },
    ],
  },
  {
    siteName: "야간",
    workers: [
      { name: "김병만", role: "조장", phone: "010-5656-7878", status: "근무중" },
      { name: "노우진", role: "조합원", phone: "010-9898-7676", status: "근무중" },
    ],
  },
]);

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const activeTab = ref(0);

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Computed
 ************************************************************/
const activeSite = computed(() => {
  return siteData.value[activeTab.value] || { siteName: "", workers: [] };
});

const totalWorkersCount = computed(() => {
  return siteData.value.reduce((acc, curr) => acc + curr.workers.length, 0);
});

const activeWorkersCount = computed(() => {
  return siteData.value.reduce(
    (acc, curr) => acc + curr.workers.filter((w) => w.status === "근무중").length,
    0
  );
});

const totalSitesCount = computed(() => {
  return siteData.value.length;
});

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {

});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta({
  layout: "user-layout",
});
</script>

<template>
  <div :class="cx('deployment-page', DeploymentStyle.Default)">
    <!-- Dashboard Summary (대시보드 통계 카드) -->
    <div :class="cx('summary-container', DeploymentStyle.DashboardSummary)">
      <div class="summary-card">
        <span class="label">총 배치 현장</span>
        <span class="value">{{ totalSitesCount }}곳</span>
      </div>
      <div class="summary-card">
        <span class="label">전체 인원</span>
        <span class="value">{{ totalWorkersCount }}명</span>
      </div>
      <div class="summary-card">
        <span class="label">현재 투입인원</span>
        <span class="value">{{ activeWorkersCount }}명</span>
      </div>
    </div>

    <!-- Site Tabs (현장별 탭 전환) -->
    <div :class="cx('tabs-container', DeploymentStyle.Tabs)">
      <button
        v-for="(site, index) in siteData"
        :key="index"
        :class="['tab-btn', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ site.siteName }}
      </button>
    </div>

    <!-- Active Site Worker List -->
    <div :class="cx('list-container', DeploymentStyle.ListContainer)">
      <div class="list-header">
        <span>{{ activeSite.siteName }} 배치 목록</span>
        <span class="count">총 {{ activeSite.workers.length }}명</span>
      </div>

      <div
        v-for="(worker, idx) in activeSite.workers"
        :key="idx"
        class="member-item"
      >
        <div class="info">
          <div class="name-wrapper">
            <span class="name">{{ worker.name }}</span>
            <span
              :class="[
                'badge',
                { leader: worker.role === '반장' || worker.role === '조장' },
                { 'sub-leader': worker.role === '좌상' },
                { member: worker.role === '조합원' }
              ]"
            >
              {{ worker.role }}
            </span>
          </div>
          <div class="phone">{{ worker.phone }}</div>
        </div>
        <div class="status-tag">
          {{ worker.status }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
