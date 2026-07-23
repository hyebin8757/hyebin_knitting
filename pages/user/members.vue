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
  birthDate?: string;
  joinDate?: string;
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
        phone: w.phone,
        birthDate: w.birthDate,
        joinDate: w.joinDate
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
  birthDate: "",
  joinDate: "",
});

// 회원 상세 모달
const isMemberDetailOpen = ref(false);
const isEditMode = ref(false);
const isDeleteConfirmOpen = ref(false);
const isAlertOpen = ref(false);
const alertText = ref("");
const selectedMember = reactive({
  originalName: '',
  name: '',
  phone: '',
  role: '조합원' as '반장' | '좌상' | '조장' | '조합원',
  group: 1,
  birthDate: '',
  joinDate: '',
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
  memberForm.birthDate = "";
  memberForm.joinDate = "";
  isMemberFormOpen.value = true;
};

const registerMember = async () => {
  if (isEmpty(memberForm.name) || isEmpty(memberForm.phone)) {
    alertText.value = "이름과 휴대폰 번호를 입력해주세요.";
    isAlertOpen.value = true;
    return;
  }
  await userStore.addWorkerAction(
    memberForm.name,
    memberForm.phone,
    memberForm.role,
    memberForm.group,
    memberForm.birthDate,
    memberForm.joinDate
  );
  isMemberFormOpen.value = false;
};

const openMemberDetail = (member: GroupMember) => {
  if (userRole.value !== 'admin') return;
  const activeGroupNum = groupNumbers[activeTab.value] || 1;
  selectedMember.originalName = member.name;
  selectedMember.name = member.name;
  selectedMember.phone = member.phone;
  selectedMember.role = member.role;
  selectedMember.group = activeGroupNum;
  selectedMember.birthDate = member.birthDate || '';
  selectedMember.joinDate = member.joinDate || '';
  isEditMode.value = false;
  isMemberDetailOpen.value = true;
};

const formatPhoneStr = (val: string): string => {
  if (!val) return "";
  const nums = val.replace(/[^0-9]/g, "");
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
};

const formatDateStr = (val: string): string => {
  if (!val) return "";
  const nums = val.replace(/[^0-9]/g, "");
  if (nums.length <= 4) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 4)}-${nums.slice(4)}`;
  return `${nums.slice(0, 4)}-${nums.slice(4, 6)}-${nums.slice(6, 8)}`;
};

const updateMember = async () => {
  if (isEmpty(selectedMember.name) || isEmpty(selectedMember.phone)) {
    alertText.value = "이름과 휴대폰 번호를 입력해주세요.";
    isAlertOpen.value = true;
    return;
  }
  const formattedPhone = formatPhoneStr(selectedMember.phone);
  const formattedBirthDate = formatDateStr(selectedMember.birthDate);
  const formattedJoinDate = formatDateStr(selectedMember.joinDate);

  await userStore.updateWorkerAction(
    selectedMember.originalName,
    selectedMember.name,
    formattedPhone,
    selectedMember.role,
    selectedMember.group,
    formattedBirthDate,
    formattedJoinDate
  );
  isMemberDetailOpen.value = false;
};

const deleteMember = () => {
  isDeleteConfirmOpen.value = true;
};

const executeDelete = async () => {
  await userStore.deleteWorkerAction(selectedMember.originalName);
  isDeleteConfirmOpen.value = false;
  isMemberDetailOpen.value = false;
};

const resetCredentials = async () => {
  await userStore.resetWorkerCredentials(selectedMember.originalName);
  alertText.value = `${selectedMember.name} 조합원의 로그인 정보가 실명과 전화번호 뒷자리 4자리로 초기화되었습니다.`;
  isAlertOpen.value = true;
  isMemberDetailOpen.value = false;
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
        :style="{ cursor: userRole === 'admin' ? 'pointer' : 'default' }"
        @click="userRole === 'admin' ? openMemberDetail(member) : null"
      >
        <div class="details">
          <div :class="['role-badge', getRoleClass(member.role)]">
            {{ member.role }}
          </div>
          <div class="name-phone">
            <span class="name">{{ member.name }}</span>
            <span class="phone">{{ member.phone }}</span>
            <div v-if="member.birthDate || member.joinDate" class="dates-info" style="font-size: 1.1rem; color: rgba(255, 255, 255, 0.4); margin-top: 0.4rem; display: flex; gap: 0.8rem; font-weight: 400;">
              <span v-if="member.birthDate">생일: {{ member.birthDate }}</span>
              <span v-if="member.joinDate">입사: {{ member.joinDate }}</span>
            </div>
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
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 1.6rem !important;">
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
            <label style="font-size: 1.2rem; color: var(--text-color-3);">생년월일</label>
            <v-text-field
              v-model="memberForm.birthDate"
              variant="solo"
              placeholder="예: 1990-01-01"
              hide-details
              autocomplete="off"
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;"
            />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">입사일</label>
            <v-text-field
              v-model="memberForm.joinDate"
              variant="solo"
              placeholder="예: 2020-05-10"
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

    <!-- Member Detail / Edit Dialog -->
    <v-dialog v-model="isMemberDetailOpen" max-width="400">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--primary-lighten-color-1); padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 1.6rem !important; display: flex; align-items: center; justify-content: space-between;">
          <span>{{ isEditMode ? '조합원 수정' : '조합원 정보' }}</span>
          <v-btn v-if="!isEditMode" icon size="x-small" style="background: rgba(255,255,255,0.08); color: #88c5ff;" @click="isEditMode = true">
            <i class="material-icons" style="font-size: 1.6rem;">edit</i>
          </v-btn>
        </v-card-title>
        
        <!-- View Mode -->
        <div v-if="!isEditMode" style="display: flex; flex-direction: column; gap: 1.4rem; margin-top: 1.6rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">이름</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.name }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">연락처</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.phone }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">직책</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.role }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">소속 조</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.group }}조</span>
          </div>
          <div v-if="selectedMember.birthDate" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">생년월일</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.birthDate }}</span>
          </div>
          <div v-if="selectedMember.joinDate" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; background: rgba(255,255,255,0.03); border-radius: 0.8rem;">
            <span style="font-size: 1.2rem; color: var(--text-color-3);">입사일</span>
            <span style="font-size: 1.4rem; font-weight: 600; color: #ffffff;">{{ selectedMember.joinDate }}</span>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">이름</label>
            <v-text-field v-model="selectedMember.name" variant="solo" hide-details autocomplete="off" style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">연락처</label>
            <v-text-field v-model="selectedMember.phone" variant="solo" hide-details autocomplete="off" style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">생년월일</label>
            <v-text-field v-model="selectedMember.birthDate" variant="solo" placeholder="예: 1990-01-01" hide-details autocomplete="off" style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">입사일</label>
            <v-text-field v-model="selectedMember.joinDate" variant="solo" placeholder="예: 2020-05-10" hide-details autocomplete="off" style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">직책</label>
            <v-select v-model="selectedMember.role" :items="['반장', '좌상', '조장', '조합원']" variant="solo" hide-details style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: var(--text-color-3);">소속 조</label>
            <v-select v-model="selectedMember.group" :items="[1, 2, 3, 5, 6, 7, 8]" variant="solo" hide-details style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" />
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn v-if="!isEditMode" style="background: rgba(224, 87, 128, 0.15) !important; border: 1px solid rgba(224, 87, 128, 0.3) !important; color: #e05780 !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.3rem;" @click="deleteMember">삭제</v-btn>
          <v-btn v-if="!isEditMode" style="background: rgba(255, 153, 0, 0.15) !important; border: 1px solid rgba(255, 153, 0, 0.3) !important; color: #ff9900 !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.3rem;" @click="resetCredentials">정보 초기화</v-btn>
          <v-btn style="background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.7) !important; border-radius: 0.8rem; padding: 0.8rem 2rem !important; height: auto !important; min-width: 8rem !important; font-size: 1.3rem; font-weight: 600;" @click="isMemberDetailOpen = false">닫기</v-btn>
          <v-btn v-if="isEditMode" style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.3rem;" @click="updateMember">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Custom Delete Confirmation Dialog -->
    <v-dialog v-model="isDeleteConfirmOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--system-red-color); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">delete_outline</i>
          <span>삭제 확인</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          정말 {{ selectedMember.name }} 조합원을 삭제하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end gap-2 px-0 pt-4">
          <v-btn variant="text" style="color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;" @click="isDeleteConfirmOpen = false">취소</v-btn>
          <v-btn
            style="background: linear-gradient(135deg, rgba(225, 60, 60, 0.8) 0%, rgba(180, 30, 30, 0.8) 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;"
            @click="executeDelete"
          >
            삭제 실행
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Custom Alert Warning Dialog -->
    <v-dialog v-model="isAlertOpen" max-width="320">
      <v-card class="pa-6" style="background: #0d1e33; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: var(--secondary-darken-color-1); display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons">info_outline</i>
          <span>입력 오류</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
          {{ alertText }}
        </v-card-text>
        <v-card-actions class="justify-end px-0 pt-4">
          <v-btn
            style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; min-width: 8rem !important; height: auto !important; font-size: 1.4rem;"
            @click="isAlertOpen = false"
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
