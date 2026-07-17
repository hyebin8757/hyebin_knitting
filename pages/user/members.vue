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
const groups = ref<GroupData[]>([
  {
    groupName: "1조",
    members: [
      { name: "김철수", role: "반장", phone: "010-1234-5678" },
      { name: "이영희", role: "좌상", phone: "010-2345-6789" },
      { name: "박민수", role: "조장", phone: "010-3456-7890" },
      { name: "최동해", role: "조합원", phone: "010-4567-8901" },
      { name: "정서율", role: "조합원", phone: "010-5678-9012" },
    ],
  },
  {
    groupName: "2조",
    members: [
      { name: "홍길동", role: "반장", phone: "010-5678-1234" },
      { name: "한지우", role: "조장", phone: "010-6789-2345" },
      { name: "강현석", role: "조합원", phone: "010-7890-3456" },
      { name: "윤서아", role: "조합원", phone: "010-8901-4567" },
    ],
  },
  {
    groupName: "3조",
    members: [
      { name: "임꺽정", role: "반장", phone: "010-1111-2222" },
      { name: "신사임당", role: "좌상", phone: "010-3333-4444" },
      { name: "성춘향", role: "조합원", phone: "010-5555-6666" },
    ],
  },
  {
    groupName: "4조",
    members: [
      { name: "이순신", role: "반장", phone: "010-7777-8888" },
      { name: "장보고", role: "조장", phone: "010-9999-0000" },
      { name: "김유신", role: "조합원", phone: "010-1212-3434" },
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
