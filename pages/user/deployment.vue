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
  role: string;
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
const locationsList = ["경인서부", "인천", "객선", "남항", "임항", "현장", "야간"];

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const activeTab = ref(0);

// 관리자 배치 이동 다이얼로그용
const isReassignDialogOpen = ref(false);
const selectedWorkerName = ref("");

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const openReassignment = (workerName: string) => {
  if (userRole.value !== "admin") return;
  selectedWorkerName.value = workerName;
  isReassignDialogOpen.value = true;
};

const executeReassignment = (loc: string) => {
  userStore.deployWorker(selectedWorkerName.value, loc);
  isReassignDialogOpen.value = false;
};

/************************************************************
 * Computed
 ************************************************************/
const userRole = computed(() => userStore.userRole);

// Pinia 전역 스토어 조합원들로부터 동적으로 사이트 배치 구성
const siteData = computed<SiteDeployment[]>(() => {
  return locationsList.map((loc) => {
    const list = userStore.workers.filter((w) => w.location === loc);
    return {
      siteName: loc,
      workers: list.map((w) => ({
        name: w.name,
        role: w.role,
        phone: w.phone,
        status: w.checkedIn ? "근무중" : "대기중",
      })),
    };
  });
});

const activeSite = computed(() => {
  return siteData.value[activeTab.value] || { siteName: "", workers: [] };
});

const totalWorkersCount = computed(() => {
  // 현장에 배치되어 있는 총 인원 수
  return userStore.workers.filter((w) => !!w.location).length;
});

const activeWorkersCount = computed(() => {
  // 배치되어 있으면서 출근 완료인 인원 수
  return userStore.workers.filter((w) => !!w.location && w.checkedIn).length;
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
    <!-- Admin Role Info Banner -->
    <div v-if="userRole === 'admin'" style="background: rgba(255, 60, 60, 0.08); border: 1px dashed rgba(225, 60, 60, 0.2); border-radius: 1.2rem; padding: 1.2rem; margin-bottom: 1.6rem; display: flex; align-items: center; gap: 0.8rem;">
      <i class="material-icons" style="color: var(--system-red-color); font-size: 1.8rem;">info</i>
      <span style="font-size: 1.2rem; color: #ffffff; font-weight: 600;">관리자 모드: 조합원을 클릭하여 근무 현장을 이동/변경할 수 있습니다.</span>
    </div>

    <!-- Dashboard Summary (대시보드 통계 카드) -->
    <div :class="cx('summary-container', DeploymentStyle.DashboardSummary)">
      <div class="summary-card">
        <span class="label">총 배치 현장</span>
        <span class="value">{{ totalSitesCount }}곳</span>
      </div>
      <div class="summary-card">
        <span class="label">배치 인원</span>
        <span class="value">{{ totalWorkersCount }}명</span>
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
        :style="{ cursor: userRole === 'admin' ? 'pointer' : 'default' }"
        @click="openReassignment(worker.name)"
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
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <div class="status-tag">
            {{ worker.status }}
          </div>
          <i v-if="userRole === 'admin'" class="material-icons" style="font-size: 1.6rem; color: var(--text-color-3);">swap_horiz</i>
        </div>
      </div>
    </div>

    <!-- Reassignment Dialog -->
    <v-dialog v-model="isReassignDialogOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 1.6rem; color: #ffffff; box-shadow: 0 12px 30px rgba(0,0,0,0.5);">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <i class="material-icons" style="color: var(--primary-lighten-color-1);">swap_horiz</i>
          <span>위치 변경 ({{ selectedWorkerName }})</span>
        </v-card-title>
        
        <v-card-text class="py-4 px-0" style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
          이동할 현장을 선택해 주세요:
        </v-card-text>

        <!-- Location List Selector -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-height: 240px; overflow-y: auto; padding-right: 0.4rem;">
          <v-btn
            v-for="loc in locationsList"
            :key="loc"
            style="background: rgba(35, 102, 180, 0.15) !important; color: #88c5ff !important; font-weight: 700; border-radius: 1rem; border: 1px solid rgba(136, 197, 255, 0.2) !important; height: 4.4rem !important; font-size: 1.3rem !important; transition: all 0.2s;"
            onmouseover="this.style.background='rgba(35, 102, 180, 0.3)'; this.style.borderColor='#88c5ff';"
            onmouseout="this.style.background='rgba(35, 102, 180, 0.15)'; this.style.borderColor='rgba(136, 197, 255, 0.2)';"
            @click="executeReassignment(loc)"
          >
            {{ loc }}
          </v-btn>
        </div>

        <v-card-actions class="justify-end px-0 pt-6">
          <v-btn style="background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.7) !important; border-radius: 0.8rem; padding: 0.8rem 2rem !important; height: auto !important; min-width: 8rem !important; font-size: 1.3rem; font-weight: 600;" @click="isReassignDialogOpen = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
