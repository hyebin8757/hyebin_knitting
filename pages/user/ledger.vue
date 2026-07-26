<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { useUserStore, type ShipLedgerItem } from '~/stores/useUserStore';

definePageMeta({
  layout: 'user-layout'
});

const userStore = useUserStore();

// 오늘 날짜 YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 선택된 조회/작성 날짜
const selectedDate = ref(getTodayStr());

// 결제 종류 옵션
const paymentOptions = ['선불', '후불', '입금', '현금', '미수'];

// 자주 쓰는 선명/상회 숏컷 칩
const frequentShips = ['프라이드 (백령)', '코리아 (덕적)', '프린세스 (연평)', '웨스트호', '미래9호', '백령해운', '코리아나호'];

// 엑셀식 렌더링 모드 ('view' | 'edit_batch')
const activeViewTab = ref<'view' | 'batch_input'>('view');

// 엑셀식 연속 입력을 위한 임시 행 객체 구조
interface LedgerRowInput {
  shipName: string;
  itemDetails: string;
  amount: number | null;
  paymentType: string;
  memo: string;
}

// 엑셀식 연속 입력 행 목록 (기본 3개 행으로 시작)
const batchRows = ref<LedgerRowInput[]>([
  { shipName: '프라이드 (백령)', itemDetails: '', amount: null, paymentType: '선불', memo: '' },
  { shipName: '코리아 (덕적)', itemDetails: '', amount: null, paymentType: '입금', memo: '' },
  { shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' }
]);

// 입력행 추가
const addRow = () => {
  batchRows.value.push({ shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' });
};

// 입력행 삭제
const removeRow = (index: number) => {
  if (batchRows.value.length > 1) {
    batchRows.value.splice(index, 1);
  }
};

// 입력행 전체 초기화
const resetRows = () => {
  batchRows.value = [
    { shipName: '프라이드 (백령)', itemDetails: '', amount: null, paymentType: '선불', memo: '' },
    { shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' }
  ];
};

// 선택된 날짜의 장부 목록
const currentLedgerList = computed(() => {
  return userStore.shipLedgers.filter(l => l.date === selectedDate.value);
});

// 선택된 날짜의 총 수화물/화물 운송 금액 합계
const currentTotalAmount = computed(() => {
  return currentLedgerList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

// 연속 입력 폼 내의 입력 금액 합계
const batchTotalAmount = computed(() => {
  return batchRows.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

// 결제 종류별 수수료/금액 통계
const paymentSummary = computed(() => {
  const summary: Record<string, number> = {
    '선불': 0,
    '후불': 0,
    '입금': 0,
    '현금': 0,
    '미수': 0
  };
  currentLedgerList.value.forEach(item => {
    const type = item.paymentType || '선불';
    if (summary[type] !== undefined) {
      summary[type] += Number(item.amount) || 0;
    } else {
      summary[type] = Number(item.amount) || 0;
    }
  });
  return summary;
});

// 단건 입력 모달
const isSingleModalOpen = ref(false);
const isEditMode = ref(false);
const singleForm = ref<ShipLedgerItem>({
  id: undefined,
  date: getTodayStr(),
  shipName: '',
  itemDetails: '',
  amount: 0,
  paymentType: '선불',
  memo: ''
});

const openSingleAddModal = () => {
  isEditMode.value = false;
  singleForm.value = {
    id: undefined,
    date: selectedDate.value,
    shipName: '프라이드 (백령)',
    itemDetails: '',
    amount: 0,
    paymentType: '선불',
    memo: ''
  };
  isSingleModalOpen.value = true;
};

const openSingleEditModal = (item: ShipLedgerItem) => {
  isEditMode.value = true;
  singleForm.value = { ...item };
  isSingleModalOpen.value = true;
};

// 단건 저장
const saveSingleLedger = async () => {
  if (!singleForm.value.shipName.trim() || !singleForm.value.itemDetails.trim()) {
    alert('선명 및 품목 상세 내용을 입력해주세요.');
    return;
  }
  if (isEditMode.value && singleForm.value.id) {
    await userStore.updateShipLedger(singleForm.value);
  } else {
    await userStore.addShipLedger({
      date: singleForm.value.date,
      shipName: singleForm.value.shipName,
      itemDetails: singleForm.value.itemDetails,
      amount: Number(singleForm.value.amount) || 0,
      paymentType: singleForm.value.paymentType,
      memo: singleForm.value.memo
    });
  }
  isSingleModalOpen.value = false;
};

// 단건 삭제
const deleteLedgerItem = async (id?: number) => {
  if (!id) return;
  if (confirm('해당 장부 기록을 삭제하시겠습니까?')) {
    await userStore.deleteShipLedger(id);
  }
};

// 엑셀식 일괄 연속 저장
const isSubmittingBatch = ref(false);
const submitBatchRows = async () => {
  const validItems = batchRows.value.filter(
    r => r.shipName.trim() !== '' && r.itemDetails.trim() !== ''
  );

  if (validItems.length === 0) {
    alert('최소 1개 이상의 유효한 장부 데이터(선명 및 품목 상세)를 입력해주세요.');
    return;
  }

  isSubmittingBatch.value = true;
  try {
    const formattedList = validItems.map(r => ({
      date: selectedDate.value,
      shipName: r.shipName.trim(),
      itemDetails: r.itemDetails.trim(),
      amount: Number(r.amount) || 0,
      paymentType: r.paymentType,
      memo: r.memo.trim()
    }));

    await userStore.saveBatchShipLedgers(formattedList);
    alert(`${formattedList.length}건의 객선 장부 기록이 일괄 등록되었습니다.`);
    resetRows();
    activeViewTab.value = 'view';
  } catch (e) {
    console.error("Batch save failed", e);
    alert('저장 도중 오류가 발생했습니다.');
  } finally {
    isSubmittingBatch.value = false;
  }
};

// 📊 엑셀(XLSX) 다운로드 기능 구현
const exportToExcel = () => {
  const listToExport = currentLedgerList.value;

  if (listToExport.length === 0) {
    alert(`${selectedDate.value} 날짜에 등록된 장부 데이터가 없습니다.`);
    return;
  }

  // 엑셀 변환용 JSON 데이터 가공
  const excelData = listToExport.map((item, idx) => ({
    '연번': idx + 1,
    '날짜': item.date,
    '선명 및 상회': item.shipName,
    '품목 및 수량': item.itemDetails,
    '금액 (원)': Number(item.amount) || 0,
    '결제구분': item.paymentType,
    '비고/메모': item.memo || ''
  }));

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 설정
  worksheet['!cols'] = [
    { wch: 6 },  // 연번
    { wch: 12 }, // 날짜
    { wch: 18 }, // 선명 및 상회
    { wch: 26 }, // 품목 및 수량
    { wch: 14 }, // 금액
    { wch: 10 }, // 결제구분
    { wch: 22 }  // 비고
  ];

  // 워크북 생성 및 통합
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '객선일일장부');

  // XLSX 파일 다운로드 실행
  const fileName = `객선_수화물운송장부_${selectedDate.value}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

onMounted(() => {
  userStore.fetchAllData();
});
</script>

<template>
  <div class="ledger-container">
    <!-- Header Section -->
    <div class="ledger-header-card">
      <div class="title-area">
        <div class="icon-box">
          <i class="material-icons">assignment</i>
        </div>
        <div>
          <h1 class="main-title">객선 일일 수화물 · 화물 장부</h1>
          <p class="sub-title">인천 항운 노조 객선 전용 운송 장부 관리 및 엑셀 추출</p>
        </div>
      </div>

      <!-- 날짜 선택기 & 엑셀 다운로드 버튼 -->
      <div class="header-action-row">
        <div class="date-picker-box">
          <i class="material-icons">event</i>
          <input type="date" v-model="selectedDate" class="date-input" />
        </div>

        <button class="btn-excel" @click="exportToExcel">
          <i class="material-icons">file_download</i>
          <span>엑셀 (XLSX) 다운로드</span>
        </button>
      </div>
    </div>

    <!-- Mode Switcher Tabs -->
    <div class="tab-switcher">
      <button 
        :class="['tab-btn', { active: activeViewTab === 'view' }]"
        @click="activeViewTab = 'view'"
      >
        <i class="material-icons">table_chart</i>
        <span>장부 내역 조회 ({{ currentLedgerList.length }}건)</span>
      </button>

      <button 
        :class="['tab-btn', { active: activeViewTab === 'batch_input' }]"
        @click="activeViewTab = 'batch_input'"
      >
        <i class="material-icons">edit_note</i>
        <span>엑셀식 빠른 연속 등록</span>
      </button>
    </div>

    <!-- VIEW TAB: 장부 내역 대시보드 & 목록 -->
    <div v-if="activeViewTab === 'view'" class="view-section">
      <!-- Summary Dashboard Stats Bar -->
      <div class="dashboard-summary">
        <div class="summary-card total">
          <span class="card-label">일일 총 운송 금액 (합계)</span>
          <span class="card-value">₩ {{ currentTotalAmount.toLocaleString() }}</span>
        </div>

        <div class="summary-chips-row">
          <div 
            v-for="(amount, type) in paymentSummary" 
            :key="type" 
            class="chip-item"
            :class="type"
          >
            <span class="chip-label">{{ type }}</span>
            <span class="chip-val">₩ {{ amount.toLocaleString() }}</span>
          </div>
        </div>

        <button class="btn-add-single" @click="openSingleAddModal">
          <i class="material-icons">add_circle</i>
          <span>단건 추가</span>
        </button>
      </div>

      <!-- Ledger Table List (2열 대시보드 / 모던 테이블) -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 50px;">NO</th>
                <th style="width: 140px;">선명 및 상회</th>
                <th>품목 및 수량</th>
                <th style="width: 120px; text-align: right;">금액</th>
                <th style="width: 90px; text-align: center;">결제구분</th>
                <th style="width: 160px;">비고/메모</th>
                <th style="width: 80px; text-align: center;">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentLedgerList.length === 0">
                <td colspan="7" class="empty-cell">
                  <i class="material-icons">inbox</i>
                  <p>{{ selectedDate }} 등록된 객선 장부 내역이 없습니다.</p>
                  <button class="btn-empty-add" @click="activeViewTab = 'batch_input'">
                    + 엑셀식 빠른 연속 등록하기
                  </button>
                </td>
              </tr>

              <tr v-for="(item, idx) in currentLedgerList" :key="item.id || idx">
                <td class="num-cell">{{ idx + 1 }}</td>
                <td class="ship-name-cell">
                  <span class="ship-badge">{{ item.shipName }}</span>
                </td>
                <td class="item-detail-cell">{{ item.itemDetails }}</td>
                <td class="amount-cell">₩ {{ (Number(item.amount) || 0).toLocaleString() }}</td>
                <td class="type-cell">
                  <span :class="['type-badge', item.paymentType]">{{ item.paymentType }}</span>
                </td>
                <td class="memo-cell">{{ item.memo || '-' }}</td>
                <td class="action-cell">
                  <button class="btn-icon edit" @click="openSingleEditModal(item)" title="수정">
                    <i class="material-icons">edit</i>
                  </button>
                  <button class="btn-icon delete" @click="deleteLedgerItem(item.id)" title="삭제">
                    <i class="material-icons">delete</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BATCH INPUT TAB: 엑셀식 빠른 연속 등록 폼 -->
    <div v-if="activeViewTab === 'batch_input'" class="batch-section">
      <div class="batch-card">
        <div class="batch-header">
          <div class="batch-title-group">
            <h3>⚡ 엑셀식 연속 입력 폼 (작성 날짜: {{ selectedDate }})</h3>
            <p>표 양식에서 탭키를 누르며 엑셀처럼 빠르게 연속 작성 후 [일괄 등록]을 누르세요.</p>
          </div>

          <!-- 자주 쓰는 선명 숏컷 칩 -->
          <div class="shortcut-chips">
            <span class="sc-label">자주 쓰는 선명:</span>
            <span 
              v-for="sName in frequentShips" 
              :key="sName" 
              class="sc-chip"
              @click="batchRows[batchRows.length - 1].shipName = sName"
            >
              + {{ sName }}
            </span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="batch-input-table">
            <thead>
              <tr>
                <th style="width: 45px;">NO</th>
                <th style="width: 180px;">선명 및 상회 *</th>
                <th>품목 및 수량 *</th>
                <th style="width: 140px;">금액 (원) *</th>
                <th style="width: 110px;">결제구분</th>
                <th style="width: 180px;">비고/메모</th>
                <th style="width: 50px;">삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in batchRows" :key="rIdx">
                <td class="row-no">{{ rIdx + 1 }}</td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.shipName" 
                    placeholder="예: 프라이드 (백령)" 
                    class="grid-input"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.itemDetails" 
                    placeholder="예: 박스 외 10개 (상)" 
                    class="grid-input"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    v-model.number="row.amount" 
                    placeholder="0" 
                    class="grid-input amount"
                  />
                </td>
                <td>
                  <select v-model="row.paymentType" class="grid-select">
                    <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.memo" 
                    placeholder="비고" 
                    class="grid-input"
                  />
                </td>
                <td style="text-align: center;">
                  <button class="btn-row-del" @click="removeRow(rIdx)">
                    <i class="material-icons">close</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 엑셀 하단 바: 총합계 및 행 추가 / 일괄 저장 -->
        <div class="batch-footer-bar">
          <div class="footer-left">
            <button class="btn-add-row" @click="addRow">
              <i class="material-icons">add</i>
              <span>+ 행 추가</span>
            </button>
            <button class="btn-reset-row" @click="resetRows">초기화</button>
          </div>

          <div class="footer-right">
            <div class="batch-total-display">
              <span>입력 총액:</span>
              <strong>₩ {{ batchTotalAmount.toLocaleString() }}</strong>
            </div>

            <button 
              class="btn-save-batch" 
              :disabled="isSubmittingBatch" 
              @click="submitBatchRows"
            >
              <i class="material-icons">task_alt</i>
              <span>{{ isSubmittingBatch ? '저장 중...' : '장부 일괄 등록' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 단건 입력 / 수정 모달 Dialog -->
    <v-dialog v-model="isSingleModalOpen" max-width="420">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="dialog-title">
          <i class="material-icons">{{ isEditMode ? 'edit' : 'add_box' }}</i>
          <span>{{ isEditMode ? '객선 장부 수정' : '객선 장부 단건 등록' }}</span>
        </v-card-title>

        <div class="dialog-body">
          <div class="field-group">
            <label>날짜</label>
            <input type="date" v-model="singleForm.date" class="modal-input" />
          </div>

          <div class="field-group">
            <label>선명 및 상회 *</label>
            <input type="text" v-model="singleForm.shipName" placeholder="예: 코리아 (덕적)" class="modal-input" />
          </div>

          <div class="field-group">
            <label>품목 및 수량 *</label>
            <input type="text" v-model="singleForm.itemDetails" placeholder="예: 부식 15 (덕적고)" class="modal-input" />
          </div>

          <div class="field-group">
            <label>금액 (원) *</label>
            <input type="number" v-model.number="singleForm.amount" placeholder="0" class="modal-input" />
          </div>

          <div class="field-group">
            <label>결제 구분</label>
            <select v-model="singleForm.paymentType" class="modal-select">
              <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="field-group">
            <label>비고 / 작성자 메모</label>
            <input type="text" v-model="singleForm.memo" placeholder="상세 비고" class="modal-input" />
          </div>
        </div>

        <v-card-actions class="dialog-actions">
          <v-btn variant="text" class="btn-cancel" @click="isSingleModalOpen = false">취소</v-btn>
          <v-btn class="btn-confirm" @click="saveSingleLedger">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.ledger-container {
  padding: 1.6rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #ffffff;
}

/* Header Card */
.ledger-header-card {
  background: linear-gradient(145deg, #0d223a 0%, #091728 100%);
  border: 1px solid rgba(136, 197, 255, 0.25);
  border-radius: 1.8rem;
  padding: 1.8rem;
  margin-bottom: 1.6rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;

  .title-area {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon-box {
      width: 46px;
      height: 46px;
      border-radius: 1.2rem;
      background: rgba(26, 209, 177, 0.15);
      border: 1px solid rgba(26, 209, 177, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        color: #1ad1b1;
        font-size: 2.6rem;
      }
    }

    .main-title {
      font-size: 1.9rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.04rem;
    }

    .sub-title {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0.2rem 0 0 0;
    }
  }

  .header-action-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    .date-picker-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 0.6rem 1.2rem;
      border-radius: 1rem;

      i {
        color: #88c5ff;
        font-size: 1.8rem;
      }

      .date-input {
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 1.4rem;
        font-weight: 700;
        outline: none;
      }
    }

    .btn-excel {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, #1d6f42 0%, #10492a 100%);
      border: 1px solid rgba(46, 204, 113, 0.4);
      color: #ffffff;
      font-weight: 800;
      font-size: 1.3rem;
      padding: 0.75rem 1.4rem;
      border-radius: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(29, 111, 66, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(29, 111, 66, 0.45);
      }

      i {
        font-size: 1.8rem;
      }
    }
  }
}

/* Tab Switcher */
.tab-switcher {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.6rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.4rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 1rem 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: none;
    border-radius: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 1.8rem;
    }

    &.active {
      background: var(--primary-darken-color-1);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(21, 60, 108, 0.4);
    }
  }
}

/* Summary Dashboard Stats */
.dashboard-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  background: rgba(13, 30, 51, 0.8);
  border: 1px solid rgba(136, 197, 255, 0.2);
  border-radius: 1.6rem;
  padding: 1.4rem 1.8rem;
  margin-bottom: 1.6rem;

  .summary-card.total {
    display: flex;
    flex-direction: column;

    .card-label {
      font-size: 1.15rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .card-value {
      font-size: 2.4rem;
      font-weight: 900;
      color: #1ad1b1;
      letter-spacing: -0.04rem;
    }
  }

  .summary-chips-row {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;

    .chip-item {
      display: flex;
      flex-direction: column;
      padding: 0.4rem 0.9rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.8rem;

      .chip-label {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.5);
      }

      .chip-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: #ffffff;
      }
    }
  }

  .btn-add-single {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(58, 134, 255, 0.2);
    border: 1px solid rgba(58, 134, 255, 0.4);
    color: #88c5ff;
    font-weight: 800;
    font-size: 1.3rem;
    padding: 0.7rem 1.2rem;
    border-radius: 1rem;
    cursor: pointer;
  }
}

/* Table Card */
.table-card, .batch-card {
  background: rgba(13, 30, 51, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.6rem;
  padding: 1.6rem;
}

.table-responsive {
  overflow-x: auto;
}

.ledger-table, .batch-input-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 1.2rem 1rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  td {
    padding: 1.2rem 1rem;
    font-size: 1.35rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &.num-cell {
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
    }

    &.ship-name-cell .ship-badge {
      background: rgba(136, 197, 255, 0.15);
      border: 1px solid rgba(136, 197, 255, 0.3);
      color: #88c5ff;
      padding: 0.3rem 0.8rem;
      border-radius: 0.6rem;
      font-weight: 800;
      font-size: 1.3rem;
    }

    &.amount-cell {
      font-weight: 900;
      color: #1ad1b1;
      text-align: right;
    }

    &.type-cell {
      text-align: center;

      .type-badge {
        font-size: 1.15rem;
        font-weight: 800;
        padding: 0.2rem 0.7rem;
        border-radius: 0.6rem;

        &.선불 { background: rgba(58, 134, 255, 0.2); color: #88c5ff; }
        &.입금 { background: rgba(26, 209, 177, 0.2); color: #1ad1b1; }
        &.후불 { background: rgba(255, 183, 3, 0.2); color: #ffb703; }
        &.현금 { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        &.미수 { background: rgba(255, 0, 110, 0.2); color: #ff5c8d; }
      }
    }

    &.memo-cell {
      color: rgba(255, 255, 255, 0.6);
    }

    &.action-cell {
      text-align: center;
      display: flex;
      gap: 0.4rem;
      justify-content: center;

      .btn-icon {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.4rem;

        &.edit i { color: #88c5ff; }
        &.delete i { color: #ff5c8d; }
      }
    }
  }

  .empty-cell {
    text-align: center;
    padding: 4rem 0;
    color: rgba(255, 255, 255, 0.4);

    i { font-size: 3.6rem; display: block; margin-bottom: 0.8rem; }
    p { font-size: 1.4rem; margin: 0 0 1.2rem 0; }

    .btn-empty-add {
      background: rgba(26, 209, 177, 0.15);
      border: 1px solid rgba(26, 209, 177, 0.4);
      color: #1ad1b1;
      padding: 0.6rem 1.4rem;
      border-radius: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
  }
}

/* Batch Section Input Styles */
.batch-card {
  .batch-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.4rem;

    .batch-title-group {
      h3 { margin: 0; font-size: 1.6rem; color: #ffffff; }
      p { margin: 0.3rem 0 0 0; font-size: 1.2rem; color: rgba(255, 255, 255, 0.5); }
    }

    .shortcut-chips {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .sc-label { font-size: 1.15rem; color: rgba(255, 255, 255, 0.5); }
      .sc-chip {
        background: rgba(136, 197, 255, 0.12);
        border: 1px solid rgba(136, 197, 255, 0.25);
        color: #88c5ff;
        padding: 0.25rem 0.65rem;
        border-radius: 0.6rem;
        font-size: 1.1rem;
        cursor: pointer;

        &:hover { background: rgba(136, 197, 255, 0.25); }
      }
    }
  }

  .grid-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    color: #ffffff;
    font-size: 1.3rem;
    outline: none;

    &:focus {
      border-color: #88c5ff;
      background: rgba(255, 255, 255, 0.08);
    }

    &.amount {
      text-align: right;
      color: #1ad1b1;
      font-weight: 800;
    }
  }

  .grid-select {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.6rem;
    padding: 0.6rem 0.6rem;
    color: #ffffff;
    font-size: 1.25rem;
    outline: none;

    option { background: #0d1e33; color: #ffffff; }
  }

  .btn-row-del {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 0.4rem;

    &:hover { color: #ff5c8d; }
  }

  .batch-footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-top: 1.6rem;
    padding-top: 1.4rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .footer-left {
      display: flex;
      gap: 0.8rem;

      .btn-add-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        padding: 0.7rem 1.4rem;
        border-radius: 0.8rem;
        font-weight: 700;
        cursor: pointer;
      }

      .btn-reset-row {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        padding: 0.7rem 1.2rem;
        border-radius: 0.8rem;
        cursor: pointer;
      }
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 1.6rem;

      .batch-total-display {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 1.4rem;

        span { color: rgba(255, 255, 255, 0.6); }
        strong { font-size: 1.9rem; color: #1ad1b1; font-weight: 900; }
      }

      .btn-save-batch {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%);
        border: 1px solid rgba(136, 197, 255, 0.4);
        color: #ffffff;
        font-weight: 800;
        font-size: 1.4rem;
        padding: 0.8rem 2rem;
        border-radius: 1rem;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(21, 60, 108, 0.4);
      }
    }
  }
}

/* Modal Dialog Styles */
.dialog-card {
  background: #0d1e33 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 1.6rem !important;
  color: #ffffff !important;

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--primary-lighten-color-1);
    padding-bottom: 1rem !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.4rem;

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label { font-size: 1.2rem; color: rgba(255, 255, 255, 0.6); }

      .modal-input, .modal-select {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.8rem;
        padding: 0.8rem 1rem;
        color: #ffffff;
        font-size: 1.35rem;
        outline: none;

        option { background: #0d1e33; color: #ffffff; }
      }
    }
  }

  .dialog-actions {
    justify-content: flex-end;
    gap: 0.8rem;
    padding-top: 1.4rem;

    .btn-cancel {
      color: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.8rem;
      padding: 0.6rem 1.6rem;
    }

    .btn-confirm {
      background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important;
      color: #ffffff !important;
      font-weight: 700;
      border-radius: 0.8rem;
      padding: 0.6rem 1.6rem;
    }
  }
}
</style>
