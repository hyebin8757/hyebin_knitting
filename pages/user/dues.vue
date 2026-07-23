<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useUserStore } from "~/stores/useUserStore";
import { useUtil } from "~/utils/useUtil";
import { definePageMeta } from "~/.nuxt/imports";

const userStore = useUserStore();
const { isEmpty } = useUtil.typeValidation;

// 권한 확인
const userRole = computed(() => userStore.userRole);

// 조(Group) 선택 탭 - 7조 고정
const activeGroupTab = ref<number | string>(7);

// 현재 선택된 월들 목록 (1월 ~ 12월)
const monthsList = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// 회비 대장 수정 다이얼로그 상태
const isDueDialogOpen = ref(false);
const selectedDueData = reactive({
  workerName: "",
  month: "",
  amount: 10000,
  paymentMethod: "이체" as "이체" | "현금"
});

// 일괄 납부 다이얼로그 상태
const isBatchDialogOpen = ref(false);
const batchDueData = reactive({
  month: "2월",
  amount: 10000,
  paymentMethod: "이체" as "이체" | "현금"
});
const batchWorkersList = ref<any[]>([]); // { name: string, checked: boolean }[]

// 비고(지출/수입) 등록 및 수정 다이얼로그 상태
const isExpenseDialogOpen = ref(false);
const selectedExpenseData = reactive({
  id: null as number | null,
  month: "2월",
  amount: 0,
  description: ""
});

// 필터링된 조합원 목록 (7조 고정)
const filteredWorkers = computed(() => {
  return userStore.workers.filter(w => w.group === 7 && w.name !== 'admin');
});

// 특정 조합원의 월별 납부 내역들 목록 찾기
const getDueRecords = (workerName: string, month: string) => {
  // 한덕희 형님은 1~12월 전부 미납으로 처리
  if (workerName === "한덕희") return [];
  // 1월은 전체 미납 처리
  if (month === "1월") return [];

  const dbRecords = userStore.dues.filter(d => d.worker_name === workerName && d.month === month);

  // 6월, 7월은 한덕희 형님 제외, 민우주 제외 만원씩 입금한 걸로 기본 표시 (DB에 데이터가 없을 경우 기본값으로 노출)
  if ((month === "6월" || month === "7월") && workerName !== "민우주") {
    if (dbRecords.length === 0) {
      return [{
        id: -1, // 임시 ID
        worker_name: workerName,
        month,
        amount: 10000,
        payment_method: "이체"
      }];
    }
  }

  return dbRecords;
};

// 회비 대장 셀 클릭 핸들러 (관리자만 작동)
const openDueEditor = (workerName: string, month: string) => {
  if (userRole.value !== "admin") return;
  selectedDueData.workerName = workerName;
  selectedDueData.month = month;
  selectedDueData.amount = 10000;
  selectedDueData.paymentMethod = "이체";
  isDueDialogOpen.value = true;
};

// 금액 조율용 헬퍼 함수
const adjustAmount = (val: number) => {
  selectedDueData.amount = Math.max(0, (selectedDueData.amount || 0) + val);
};

// 일괄 금액 조율용 헬퍼 함수
const adjustBatchAmount = (val: number) => {
  batchDueData.amount = Math.max(0, (batchDueData.amount || 0) + val);
};

// 신규 회비 납부 내역 추가
const saveDue = async () => {
  await userStore.saveDueAction(
    selectedDueData.workerName,
    selectedDueData.month,
    selectedDueData.amount,
    selectedDueData.paymentMethod
  );
  isDueDialogOpen.value = false;
};

// 특정 납부 기록 삭제
const removeDueRecord = async (id: number) => {
  if (id === -1) {
    alert("기본값으로 세팅된 6월/7월 회비 기록은 삭제할 수 없습니다. 수정을 원하시면 해당 셀에 추가 납부 내역을 기입해 주세요.");
    return;
  }
  if (!confirm("이 납부 기록을 삭제하시겠습니까?")) return;
  await userStore.deleteDueAction(id);
};

// 일괄 납부 편집 열기
const openBatchEditor = () => {
  if (userRole.value !== "admin") return;
  batchDueData.month = "2월";
  batchDueData.amount = 10000;
  batchDueData.paymentMethod = "이체";
  batchWorkersList.value = userStore.workers
    .filter(w => w.name !== 'admin' && w.group === 7 && w.name !== '한덕희') // 한덕희 형님은 일괄 등록에서도 제외
    .map(w => ({
      name: w.name,
      checked: true
    }));
  isBatchDialogOpen.value = true;
};

// 일괄 납부 등록 실행
const executeBatchSave = async () => {
  const targets = batchWorkersList.value.filter(w => w.checked).map(w => w.name);
  if (targets.length === 0) {
    alert("일괄 등록할 조합원을 한 명 이상 선택해 주세요.");
    return;
  }
  for (const name of targets) {
    await userStore.saveDueAction(name, batchDueData.month, batchDueData.amount, batchDueData.paymentMethod);
  }
  isBatchDialogOpen.value = false;
};

// 일괄 납부 삭제 실행
const executeBatchDelete = async () => {
  const targets = batchWorkersList.value.filter(w => w.checked).map(w => w.name);
  if (targets.length === 0) {
    alert("일괄 삭제할 조합원을 한 명 이상 선택해 주세요.");
    return;
  }
  if (!confirm(`${batchDueData.month}의 선택된 조합원 회비 기록을 일괄 삭제하시겠습니까?\n(수동 기입된 내역들만 삭제됩니다)`)) return;
  
  const recordsToDelete = userStore.dues.filter(
    d => d.month === batchDueData.month && targets.includes(d.worker_name)
  );
  for (const rec of recordsToDelete) {
    await userStore.deleteDueAction(rec.id);
  }
  isBatchDialogOpen.value = false;
};

// 비고(지출/수입) 등록 및 수정 핸들러
const openExpenseEditor = (item: any = null) => {
  if (userRole.value !== "admin") return;
  if (item) {
    selectedExpenseData.id = item.id;
    selectedExpenseData.month = item.month;
    selectedExpenseData.amount = item.amount;
    selectedExpenseData.description = item.description;
  } else {
    selectedExpenseData.id = null;
    selectedExpenseData.month = "2월";
    selectedExpenseData.amount = 0;
    selectedExpenseData.description = "";
  }
  isExpenseDialogOpen.value = true;
};

// 비고(지출/수입) 저장 실행
const saveExpense = async () => {
  if (isEmpty(selectedExpenseData.description)) return;
  await userStore.saveExpenseAction(
    selectedExpenseData.id,
    selectedExpenseData.month,
    selectedExpenseData.amount,
    selectedExpenseData.description
  );
  isExpenseDialogOpen.value = false;
};

// 비고(지출/수입) 삭제 실행
const deleteExpense = async (id: number) => {
  if (!confirm("이 내역을 삭제하시겠습니까?")) return;
  await userStore.deleteExpenseAction(id);
};

// 월별 수입 및 지출 통계 연산
const monthlyStats = computed(() => {
  const stats: Record<string, { income: number; expense: number; balance: number }> = {};
  
  monthsList.forEach(m => {
    // 1. 해당 월 조합원들의 납입 회비 총합 (수입)
    const duesSum = userStore.dues
      .filter(d => d.month === m && d.payment_method !== "미납")
      .reduce((sum, curr) => sum + (curr.amount || 0), 0);

    // 2. 해당 월의 찬조금 수입 (양수 금액)
    const sponsorSum = userStore.duesExpenses
      .filter(e => e.month === m && e.amount > 0)
      .reduce((sum, curr) => sum + curr.amount, 0);

    // 3. 해당 월의 지출 총합 (음수 금액)
    const expenseSum = userStore.duesExpenses
      .filter(e => e.month === m && e.amount < 0)
      .reduce((sum, curr) => sum + Math.abs(curr.amount), 0);

    const totalIncome = duesSum + sponsorSum;
    
    stats[m] = {
      income: totalIncome,
      expense: expenseSum,
      balance: totalIncome - expenseSum
    };
  });

  return stats;
});

// 전체 총 누계 요약
const overallSummary = computed(() => {
  let totalIncome = 0;
  let totalExpense = 0;

  // 전체 회비 총합
  const totalDues = userStore.dues
    .filter(d => d.payment_method !== "미납")
    .reduce((sum, curr) => sum + (curr.amount || 0), 0);
  
  // 전체 비고 찬조/지출 총합
  userStore.duesExpenses.forEach(e => {
    if (e.amount > 0) {
      totalIncome += e.amount;
    } else {
      totalExpense += Math.abs(e.amount);
    }
  });

  const finalIncome = totalDues + totalIncome;

  return {
    income: finalIncome,
    expense: totalExpense,
    balance: finalIncome - totalExpense
  };
});

onMounted(async () => {
  await userStore.fetchAllData();
});

definePageMeta({
  layout: "user-layout",
});
</script>

<template>
  <div class="dues-page">
    <!-- Header Page Info Card -->
    <div class="page-info-card">
      <div style="display: flex; align-items: center; gap: 0.8rem; font-size: 1.6rem; font-weight: 700; color: #ffffff;">
        <i class="material-icons" style="color: #3a86ff;">payments</i>
        <span>회비 장부 대장</span>
      </div>
      <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.6); margin-top: 0.8rem; line-height: 1.6; margin-bottom: 0;">
        조합원별 월회비 납부 현황 및 찬조금/지출 대장입니다.
        <span v-if="userRole === 'admin'" style="color: #ffcc00; font-weight: 600;">* 대장 내 칸을 클릭하여 납부 상태를 편집할 수 있습니다.</span>
      </p>
    </div>

    <!-- Overall Summary Widget -->
    <div class="summary-widget">
      <div class="summary-item">
        <span class="label">총 회비+찬조 수입</span>
        <span class="value income">{{ overallSummary.income.toLocaleString() }}원</span>
      </div>
      <div class="summary-item">
        <span class="label">총 경조사 지출</span>
        <span class="value expense">{{ overallSummary.expense.toLocaleString() }}원</span>
      </div>
      <div class="summary-item">
        <span class="label">현재 대장 잔액</span>
        <span class="value balance">{{ overallSummary.balance.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- Dues Spreadsheet Card -->
    <div class="spreadsheet-card">
      <div class="card-title" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons" style="color: #1ad1b1;">grid_on</i>
          <span>월회비 납부 현황 (7조 전용)</span>
        </div>
        <v-btn
          v-if="userRole === 'admin'"
          size="small"
          style="background: rgba(26, 209, 177, 0.15) !important; border: 1px solid rgba(26, 209, 177, 0.3) !important; color: #1ad1b1 !important; font-weight: 600; border-radius: 0.8rem;"
          @click="openBatchEditor"
        >
          <i class="material-icons" style="font-size: 1.4rem; margin-right: 0.4rem;">assignment_turned_in</i> 일괄 납부 관리
        </v-btn>
      </div>

      <div class="table-scroll-wrapper">
        <table class="dues-table">
          <thead>
            <tr>
              <th style="min-width: 8rem; position: sticky; left: 0; background: #0b1a2c; z-index: 10;">이름</th>
              <th v-for="m in monthsList" :key="m" style="min-width: 10rem; text-align: center;">{{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in filteredWorkers" :key="w.name">
              <td class="worker-name-cell" style="position: sticky; left: 0; background: #0b1a2c; font-weight: 700; z-index: 9;">
                {{ w.name }}
                <span class="role-sub">{{ w.role }}</span>
              </td>
              <td 
                v-for="m in monthsList" 
                :key="m" 
                class="status-cell"
                :class="{ 'admin-clickable': userRole === 'admin' }"
                @click="openDueEditor(w.name, m)"
              >
                <div v-if="getDueRecords(w.name, m).length > 0" style="display: flex; flex-direction: column; gap: 0.4rem; align-items: center;">
                  <div 
                    v-for="(rec, idx) in getDueRecords(w.name, m)"
                    :key="rec.id"
                    class="due-tag"
                    :class="rec.payment_method"
                    :style="idx > 0 ? { borderStyle: 'dashed', background: 'rgba(255, 204, 0, 0.08) !important', color: '#ffcc00 !important', borderColor: 'rgba(255, 204, 0, 0.3) !important' } : {}"
                  >
                    <span v-if="idx > 0" style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.1rem; display: block;">추가 +</span>
                    {{ rec.amount.toLocaleString() }}
                    <span class="method-label">{{ rec.payment_method }}</span>
                  </div>
                </div>
                <span v-else class="unpaid-label">미납</span>
              </td>
            </tr>

            <!-- Monthly Sum statistics footer rows -->
            <tr class="stats-row sum-row">
              <td style="position: sticky; left: 0; background: #0f243d; font-weight: 700; color: #1ad1b1; z-index: 9;">월 수입액</td>
              <td v-for="m in monthsList" :key="m" style="text-align: center; font-weight: 700; color: #1ad1b1;">
                +{{ (monthlyStats[m]?.income || 0).toLocaleString() }}
              </td>
            </tr>
            <tr class="stats-row expense-row">
              <td style="position: sticky; left: 0; background: #0f243d; font-weight: 700; color: #ff4d4d; z-index: 9;">월 지출액</td>
              <td v-for="m in monthsList" :key="m" style="text-align: center; font-weight: 700; color: #ff4d4d;">
                -{{ (monthlyStats[m]?.expense || 0).toLocaleString() }}
              </td>
            </tr>
            <tr class="stats-row balance-row">
              <td style="position: sticky; left: 0; background: #0f243d; font-weight: 700; color: #ffffff; z-index: 9;">월말 잔액</td>
              <td v-for="m in monthsList" :key="m" style="text-align: center; font-weight: 700; color: #88c5ff;">
                {{ (monthlyStats[m]?.balance || 0).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Remarks / Expenses Card -->
    <div class="expenses-card">
      <div class="card-header">
        <div style="display: flex; align-items: center; gap: 0.8rem; font-size: 1.5rem; font-weight: 700; color: #ffffff;">
          <i class="material-icons" style="color: #ffcc00;">list_alt</i>
          <span>비고 (지출 및 찬조금 세부 내역)</span>
        </div>
        <v-btn
          v-if="userRole === 'admin'"
          size="small"
          class="add-expense-btn"
          @click="openExpenseEditor()"
        >
          <i class="material-icons" style="font-size: 1.4rem;">add</i> 내역 추가
        </v-btn>
      </div>

      <!-- Expenditures List -->
      <div class="expenses-list">
        <div v-if="userStore.duesExpenses.length === 0" class="no-records">
          등록된 지출 및 찬조 세부 기록이 없습니다.
        </div>
        <div 
          v-for="item in userStore.duesExpenses" 
          :key="item.id" 
          class="expense-item-row"
        >
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <span class="month-badge">{{ item.month }}</span>
            <span class="description-text">{{ item.description }}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 1.6rem;">
            <span 
              class="amount-text"
              :class="{ 'plus': item.amount > 0, 'minus': item.amount < 0 }"
            >
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}원
            </span>

            <div v-if="userRole === 'admin'" style="display: flex; gap: 0.4rem;">
              <v-btn icon size="x-small" class="edit-btn" @click="openExpenseEditor(item)">
                <i class="material-icons" style="font-size: 1.4rem;">edit</i>
              </v-btn>
              <v-btn icon size="x-small" class="delete-btn" @click="deleteExpense(item.id)">
                <i class="material-icons" style="font-size: 1.4rem;">delete</i>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dues Edit Modal (Admin Only) -->
    <v-dialog v-model="isDueDialogOpen" max-width="320">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="text-h6 font-weight-bold px-0 dialog-title">
          <i class="material-icons">edit</i>
          <span>회비 현황 편집</span>
        </v-card-title>

        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div class="dialog-field">
            <span class="label">조합원</span>
            <span class="val">{{ selectedDueData.workerName }}</span>
          </div>
          <div class="dialog-field">
            <span class="label">대상 월</span>
            <span class="val">{{ selectedDueData.month }}</span>
          </div>

          <!-- 기존 납부 목록 -->
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">기존 납부 내역</label>
            <div v-if="getDueRecords(selectedDueData.workerName, selectedDueData.month).length === 0" style="font-size: 1.2rem; color: rgba(255,255,255,0.3); text-align: center; padding: 0.8rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 0.8rem;">
              납부 기록이 없습니다 (미납).
            </div>
            <div 
              v-for="rec in getDueRecords(selectedDueData.workerName, selectedDueData.month)" 
              :key="rec.id"
              style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.6rem 1rem; border-radius: 0.8rem; border: 1px solid rgba(255,255,255,0.05);"
            >
              <span style="font-size: 1.3rem; font-weight: 700; color: #88c5ff;">
                {{ rec.amount.toLocaleString() }}원 ({{ rec.payment_method }})
              </span>
              <v-btn icon size="x-small" style="background: rgba(224, 87, 128, 0.15) !important; color: #e05780 !important;" @click="removeDueRecord(rec.id)">
                <i class="material-icons" style="font-size: 1.4rem;">delete</i>
              </v-btn>
            </div>
          </div>

          <!-- 새 납부 내역 추가 -->
          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.2rem; display: flex; flex-direction: column; gap: 1rem;">
            <label style="font-size: 1.2rem; font-weight: 700; color: #1ad1b1;">+ 내역 추가 기입</label>
            
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <label style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">납부 수단</label>
              <v-select 
                v-model="selectedDueData.paymentMethod" 
                :items="['이체', '현금']" 
                variant="solo" 
                hide-details 
                style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
              />
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <label style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">금액 (원)</label>
              <v-text-field 
                v-model.number="selectedDueData.amount" 
                type="number" 
                variant="solo" 
                hide-details 
                style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
              />
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">
                <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustAmount(1000)">+1천</v-btn>
                <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustAmount(5000)">+5천</v-btn>
                <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustAmount(10000)">+1만</v-btn>
                <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustAmount(100000)">+10만</v-btn>
                <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustAmount(-1000)">-1천</v-btn>
                <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustAmount(-5000)">-5천</v-btn>
                <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustAmount(-10000)">-1만</v-btn>
                <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustAmount(-100000)">-10만</v-btn>
              </div>
            </div>
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" class="cancel" @click="isDueDialogOpen = false">닫기</v-btn>
          <v-btn class="confirm" @click="saveDue">추가하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dues Batch Edit Modal (Admin Only) -->
    <v-dialog v-model="isBatchDialogOpen" max-width="380">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="text-h6 font-weight-bold px-0 dialog-title">
          <i class="material-icons">assignment_turned_in</i>
          <span>일괄 납부 관리 (7조 전용)</span>
        </v-card-title>

        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">대상 월 선택</label>
            <v-select 
              v-model="batchDueData.month" 
              :items="monthsList" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">납부 수단</label>
            <v-select 
              v-model="batchDueData.paymentMethod" 
              :items="['이체', '현금']" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">금액 (원)</label>
            <v-text-field 
              v-model.number="batchDueData.amount" 
              type="number" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">
              <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustBatchAmount(1000)">+1천</v-btn>
              <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustBatchAmount(5000)">+5천</v-btn>
              <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustBatchAmount(10000)">+1만</v-btn>
              <v-btn size="x-small" style="background: rgba(255,255,255,0.08) !important; color: #ffffff !important;" @click="adjustBatchAmount(100000)">+10만</v-btn>
              <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustBatchAmount(-1000)">-1천</v-btn>
              <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustBatchAmount(-5000)">-5천</v-btn>
              <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustBatchAmount(-10000)">-1만</v-btn>
              <v-btn size="x-small" style="background: rgba(224, 87, 128, 0.1) !important; color: #e05780 !important;" @click="adjustBatchAmount(-100000)">-10만</v-btn>
            </div>
          </div>

          <!-- 제외/포함 조합원 목록 체크박스 -->
          <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 200px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 0.8rem; background: rgba(0,0,0,0.2);">
            <label style="font-size: 1.2rem; font-weight: 700; color: #88c5ff; margin-bottom: 0.4rem;">대상 조합원 선택 (체크 해제시 제외)</label>
            <div 
              v-for="w in batchWorkersList" 
              :key="w.name" 
              style="display: flex; align-items: center; gap: 0.8rem; font-size: 1.3rem;"
            >
              <input type="checkbox" v-model="w.checked" :id="'chk_' + w.name" style="width: 1.6rem; height: 1.6rem; accent-color: #1ad1b1;" />
              <label :for="'chk_' + w.name" style="cursor: pointer;">{{ w.name }}</label>
            </div>
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" class="cancel" @click="isBatchDialogOpen = false">취소</v-btn>
          <v-btn style="background: rgba(224, 87, 128, 0.15) !important; border: 1px solid rgba(224, 87, 128, 0.3) !important; color: #e05780 !important; border-radius: 0.8rem; font-weight: 600;" @click="executeBatchDelete">일괄 삭제</v-btn>
          <v-btn class="confirm" @click="executeBatchSave">일괄 등록</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Remarks / Expenses Edit Modal (Admin Only) -->
    <v-dialog v-model="isExpenseDialogOpen" max-width="320">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="text-h6 font-weight-bold px-0 dialog-title">
          <i class="material-icons">{{ selectedExpenseData.id ? 'edit' : 'add' }}</i>
          <span>비고 및 지출 내역 {{ selectedExpenseData.id ? '수정' : '등록' }}</span>
        </v-card-title>

        <div style="display: flex; flex-direction: column; gap: 1.6rem; margin-top: 1.6rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">월 선택</label>
            <v-select 
              v-model="selectedExpenseData.month" 
              :items="monthsList" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">내용</label>
            <v-text-field 
              v-model="selectedExpenseData.description" 
              placeholder="예: 박동세좌상님 장례식" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <label style="font-size: 1.2rem; color: rgba(255,255,255,0.5);">금액 (원, 지출은 마이너스 기입)</label>
            <v-text-field 
              v-model.number="selectedExpenseData.amount" 
              type="number" 
              placeholder="예: -50000 또는 100000" 
              variant="solo" 
              hide-details 
              style="--v-input-control-background: rgba(255,255,255,0.04); color: white;" 
            />
          </div>
        </div>

        <v-card-actions class="justify-end gap-2 px-0 pt-6">
          <v-btn variant="text" class="cancel" @click="isExpenseDialogOpen = false">취소</v-btn>
          <v-btn class="confirm" @click="saveExpense">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dues-page {
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: #060f1e;
  min-height: 100%;
  color: #ffffff;
}

.page-info-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.6rem;
  padding: 1.6rem;
}

.summary-widget {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  .summary-item {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 1.2rem;
    padding: 1.2rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .label {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .value {
      font-size: 1.6rem;
      font-weight: 800;

      &.income { color: #1ad1b1; }
      &.expense { color: #ff4d4d; }
      &.balance { color: #3a86ff; }
    }
  }
}

.group-tab-container {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding: 0.2rem 0;
  white-space: nowrap;

  .tab-btn {
    padding: 0.8rem 1.4rem;
    border-radius: 0.8rem;
    font-size: 1.2rem;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: #3a86ff;
      color: #ffffff;
      border-color: #3a86ff;
    }
  }
}

.spreadsheet-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.6rem;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.4rem;
    font-weight: 700;
  }
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.06);
}

.dues-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;

  th, td {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    vertical-align: middle;
  }

  th {
    background: #0b1a2c;
    color: rgba(255,255,255,0.7);
    font-weight: 700;
  }

  .worker-name-cell {
    font-weight: 700;
    color: #ffffff;
    display: flex;
    flex-direction: column;

    .role-sub {
      font-size: 1rem;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      margin-top: 0.2rem;
    }
  }

  .status-cell {
    text-align: center;
    background: rgba(255,255,255,0.01);

    &.admin-clickable {
      cursor: pointer;
      transition: background 0.15s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .unpaid-label {
      color: rgba(255,255,255,0.25);
      font-size: 1.2rem;
    }
  }

  .due-tag {
    display: inline-flex;
    flex-direction: column;
    padding: 0.4rem 0.8rem;
    border-radius: 0.6rem;
    font-weight: 700;
    font-size: 1.2rem;
    min-width: 6.8rem;
    text-align: center;

    &.현금 {
      background: rgba(26, 209, 177, 0.12);
      color: #1ad1b1;
      border: 1px solid rgba(26, 209, 177, 0.2);
    }
    &.이체 {
      background: rgba(58, 134, 255, 0.12);
      color: #3a86ff;
      border: 1px solid rgba(58, 134, 255, 0.2);
    }

    .method-label {
      font-size: 0.9rem;
      opacity: 0.75;
      font-weight: 500;
      margin-top: 0.1rem;
    }
  }

  .stats-row {
    td {
      background: #0f243d;
    }
  }
}

.expenses-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.6rem;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding-bottom: 1rem;
  }

  .add-expense-btn {
    background: rgba(58, 134, 255, 0.15) !important;
    border: 1px solid rgba(58, 134, 255, 0.3) !important;
    color: #88c5ff !important;
    font-weight: 600;
    border-radius: 0.8rem;
  }
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  .no-records {
    text-align: center;
    padding: 3rem 0;
    font-size: 1.3rem;
    color: rgba(255,255,255,0.3);
  }

  .expense-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 1rem;
    padding: 1rem 1.2rem;

    .month-badge {
      font-size: 1.1rem;
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      padding: 0.2rem 0.6rem;
      border-radius: 0.4rem;
      font-weight: 700;
    }

    .description-text {
      font-size: 1.3rem;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
    }

    .amount-text {
      font-size: 1.4rem;
      font-weight: 700;

      &.plus { color: #1ad1b1; }
      &.minus { color: #ff4d4d; }
    }

    .edit-btn {
      background: rgba(255,255,255,0.05) !important;
      color: #ffffff !important;
    }

    .delete-btn {
      background: rgba(224, 87, 128, 0.15) !important;
      color: #e05780 !important;
    }
  }
}

.dialog-card {
  background: #0d1e33 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 1.6rem !important;
  color: #ffffff !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.5) !important;

  .dialog-title {
    color: #88c5ff;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 1.2rem !important;
  }

  .dialog-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.03);
    padding: 1rem 1.2rem;
    border-radius: 0.8rem;
    
    .label {
      font-size: 1.2rem;
      color: rgba(255,255,255,0.5);
    }
    .val {
      font-size: 1.4rem;
      font-weight: 700;
    }
  }

  .cancel {
    color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.8rem;
    min-width: 7.2rem !important;
    height: auto !important;
    font-size: 1.3rem;
  }

  .confirm {
    background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important;
    color: white !important;
    border-radius: 0.8rem;
    font-weight: 600;
    min-width: 7.2rem !important;
    height: auto !important;
    font-size: 1.3rem;
  }
}
</style>
