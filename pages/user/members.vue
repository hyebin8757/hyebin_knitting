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
import { MembersStyle } from "~/assets/style/pages/user/MembersStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
interface GroupMember {
  name: string;
  role: "반장" | "좌상" | "조장" | "조합원";
  phone: string;
}

interface GroupData {
  groupName: string;
  members: GroupMember[];
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
const groupNumbers = [1, 2, 3, 5, 6, 7, 8];

const groups = computed<GroupData[]>(() => {
  return groupNumbers.map(g => {
    const list = userStore.workers.filter(w => w.group === g);
    return {
      groupName: `${g}조`,
      members: list.map(w => ({
        name: w.name,
        role: w.role as any,
        phone: w.phone
      }))
    };
  });
});

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const activeTab = ref(0);
const isMemberFormOpen = ref(false);
const memberForm = reactive({
  name: "",
  phone: "",
  role: "조합원" as "반장" | "좌상" | "조장" | "조합원",
  group: 1,
});

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject("windowWidth") as any;

/************************************************************
 * Function
 ************************************************************/
const openMemberRegister = () => {
  const activeGroupNum = groupNumbers[activeTab.value] || 1;
  memberForm.name = "";
  memberForm.phone = "";
  memberForm.role = "조합원";
  memberForm.group = activeGroupNum;
  isMemberFormOpen.value = true;
};

const registerMember = async () => {
  if (isEmpty(memberForm.name) || isEmpty(memberForm.phone)) return;
  await userStore.addWorkerAction(memberForm.name, memberForm.phone, memberForm.role, memberForm.group);
  isMemberFormOpen.value = false;
};

/************************************************************
 * Computed
 ************************************************************/
const userRole = computed(() => userStore.userRole);

const activeGroup = computed(() => {
  return groups.value[activeTab.value] || { groupName: "", members: [] };
});

const getRoleClass = (role: string) => {
  if (role === "반장") return "role-banjang";
  if (role === "좌상") return "role-jwasang";
  if (role === "조장") return "role-jojang";
  return "role-member";
};

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
  <div :class="cx('members-page', MembersStyle.Default)">
    <!-- Group Tabs (조별 선택) -->
    <div :class="cx('tabs-container', MembersStyle.Tabs)">
      <button
        v-for="(group, index) in groups"
        :key="index"
        :class="['tab-btn', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ group.groupName }}
      </button>
    </div>

    <!-- Active Group Member List -->
    <div :class="cx('list-container', MembersStyle.ListContainer)">
      <div class="group-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span>{{ activeGroup.groupName }} 연락처</span>
          <span class="info-text">총 {{ activeGroup.members.length }}명</span>
        </div>
        <v-btn
          v-if="userRole === 'admin'"
          size="x-small"
          color="primary"
          style="border-radius: 0.6rem; font-weight: 700; font-size: 1rem; padding: 0 0.8rem !important; height: 2.4rem !important;"
          @click="openMemberRegister"
        >
          등록
        </v-btn>
      </div>

      <div
        v-for="(member, idx) in activeGroup.members"
        :key="idx"
        class="member-card"
      >
        <div class="details">
          <div :class="['role-badge', getRoleClass(member.role)]">
            {{ member.role }}
          </div>
          <div class="name-phone">
            <span class="name">{{ member.name }}</span>
            <span class="phone">{{ member.phone }}</span>
          </div>
        </div>
        
        <!-- Click to Call -->
        <a :href="`tel:${member.phone}`" class="action-call">
          <i class="material-icons">phone</i>
        </a>
      </div>
    </div>

    <!-- Member Registration Dialog -->
    <v-dialog v-model="isMemberFormOpen" max-width="400">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1);">
          조합원 등록
        </v-card-title>
        
        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">이름</label>
            <v-text-field
              v-model="memberForm.name"
              variant="solo"
              placeholder="이름을 입력하세요"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">휴대폰 번호</label>
            <v-text-field
              v-model="memberForm.phone"
              variant="solo"
              placeholder="예: 010-1234-5678"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">직책</label>
            <v-select
              v-model="memberForm.role"
              :items="['반장', '좌상', '조장', '조합원']"
              variant="solo"
              hide-details
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">소속 조</label>
            <v-select
              v-model="memberForm.group"
              :items="[1, 2, 3, 5, 6, 7, 8]"
              variant="solo"
              hide-details
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isMemberFormOpen = false">취소</v-btn>
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="registerMember">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
