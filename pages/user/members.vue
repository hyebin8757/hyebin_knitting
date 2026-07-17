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
      <div class="group-header">
        <span>{{ activeGroup.groupName }} 연락처</span>
        <span class="info-text">총 {{ activeGroup.members.length }}명</span>
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
  </div>
</template>

<style lang="scss" scoped></style>
