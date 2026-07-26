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

// 공용 커스텀 알림 & 확인 모달 상태
const isCustomAlertOpen = ref(false);
const customAlertTitle = ref('알림');
const customAlertMessage = ref('');

const isCustomConfirmOpen = ref(false);
const customConfirmTitle = ref('확인');
const customConfirmMessage = ref('');
let onConfirmCallback: (() => void) | null = null;

const showAlert = (msg: string, title = '알림') => {
  customAlertTitle.value = title;
  customAlertMessage.value = msg;
  isCustomAlertOpen.value = true;
};

const showConfirm = (msg: string, onConfirm: () => void, title = '확인') => {
  customConfirmTitle.value = title;
  customConfirmMessage.value = msg;
  onConfirmCallback = onConfirm;
  isCustomConfirmOpen.value = true;
};

const executeConfirm = () => {
  if (onConfirmCallback) {
    onConfirmCallback();
    onConfirmCallback = null;
  }
  isCustomConfirmOpen.value = false;
};

// 종이 수기 장부 원본 사진 기준 기본 선명/상회 숏컷 칩 목록
const DEFAULT_FREQUENT_SHIPS = [
  '프라이드',
  '연평(오전)',
  '코리아(덕적)',
  '하누리(백아)',
  '프린세스',
  '연평(오후)',
  '미래9호(덕적)',
  '프라이드(하)',
  '미래(자.이.승)',
  '9호',
  '하누리(문갑외)',
  '우체국',
  '프라이드(백령)',
  '프린세스(백령)',
  '웨스트호'
];

// 사용자가 직접 추가/삭제할 수 있는 반응형 선명 칩 목록
const frequentShips = ref<string[]>([]);

// 선명 칩 관리 모달 & 열기/접기 토글 상태
const isShipManageModalOpen = ref(false);
const newShipInput = ref('');
const isShipsPanelOpen = ref(true);

const toggleShipsPanel = () => {
  isShipsPanelOpen.value = !isShipsPanelOpen.value;
};

// localStorage에서 자주 쓰는 선명 불러오기
const loadFrequentShips = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('frequent_ships_custom');
    if (saved) {
      try {
        frequentShips.value = JSON.parse(saved);
        return;
      } catch (e) {
        console.warn("Failed to parse frequent_ships_custom", e);
      }
    }
  }
  frequentShips.value = [...DEFAULT_FREQUENT_SHIPS];
};

// localStorage에 선명 칩 저장
const saveFrequentShips = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('frequent_ships_custom', JSON.stringify(frequentShips.value));
  }
};

// 선명 칩 신규 추가
const addFrequentShip = () => {
  const name = newShipInput.value.trim();
  if (!name) return;
  if (frequentShips.value.includes(name)) {
    showAlert('이미 존재해 있는 선명/상회 명칭입니다.');
    return;
  }
  frequentShips.value.push(name);
  saveFrequentShips();
  newShipInput.value = '';
};

// 선명 칩 삭제
const deleteFrequentShip = (targetName: string) => {
  frequentShips.value = frequentShips.value.filter(s => s !== targetName);
  saveFrequentShips();
};

// 장부 입력/조회 뷰 전환 ('list' | 'quick_input')
const currentMode = ref<'list' | 'quick_input'>('list');

// 엑셀식 연속 입력을 위한 임시 행 객체 구조
interface LedgerRowInput {
  shipName: string;
  itemDetails: string;
  amount: number | null;
  paymentType: string;
  memo: string;
}

// 엑셀식 연속 입력 행 목록 (기본 3개 빈 행으로 시작)
const batchRows = ref<LedgerRowInput[]>([
  { shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' },
  { shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' },
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
    { shipName: '', itemDetails: '', amount: null, paymentType: '선불', memo: '' },
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

// 자주 쓰는 선명 칩 클릭 시 적용
const applyFrequentShipToForm = (shipName: string) => {
  // 1) 연속 입력 중일 때 마지막 입력 행에 대입
  const lastRow = batchRows.value[batchRows.value.length - 1];
  if (lastRow) {
    lastRow.shipName = shipName;
  }
  // 2) 단건 입력 모달 열려있을 때 모달 인풋에 대입
  if (isSingleModalOpen.value) {
    singleForm.value.shipName = shipName;
  }
};

// 단건 입력/수정 모달
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
    shipName: '',
    itemDetails: '',
    amount: null as any,
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
    showAlert('선명 및 품목 상세 내용을 입력해주세요.');
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
  showConfirm('해당 장부 기록을 삭제하시겠습니까?', async () => {
    await userStore.deleteShipLedger(id);
  });
};

// 엑셀식 일괄 연속 저장
const isSubmittingBatch = ref(false);
const submitBatchRows = async () => {
  const validItems = batchRows.value.filter(
    r => r.shipName.trim() !== '' && r.itemDetails.trim() !== ''
  );

  if (validItems.length === 0) {
    showAlert('최소 1개 이상의 유효한 장부 데이터(선명 및 품목 상세)를 입력해주세요.');
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
    showAlert(`${formattedList.length}건의 객선 장부 기록이 일괄 등록되었습니다.`, '등록 완료');
    resetRows();
    currentMode.value = 'list';
  } catch (e) {
    console.error("Batch save failed", e);
    showAlert('저장 도중 오류가 발생했습니다.');
  } finally {
    isSubmittingBatch.value = false;
  }
};

// 📊 엑셀(XLSX) 다운로드 기능 구현
const exportToExcel = () => {
  const listToExport = currentLedgerList.value;

  if (listToExport.length === 0) {
    showAlert(`${selectedDate.value} 날짜에 등록된 장부 데이터가 없습니다.`);
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
    { wch: 28 }, // 품목 및 수량
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
  loadFrequentShips();
  userStore.fetchAllData();
});
</script>

<template>
  <div class="ledger-container">
    <!-- 👑 스마트 대시보드 메인 헤더 카드 (슬림 콤팩트 수술) -->
    <div class="hero-header-card">
      <div class="hero-top">
        <div class="brand-group">
          <div class="brand-icon">
            <i class="material-icons">description</i>
          </div>
          <div>
            <h1 class="brand-title">객선 일일 수화물 · 화물 장부</h1>
            <p class="brand-sub">인천 항운 노조 실시간 운송 대시보드 & 엑셀 통합 관리</p>
          </div>
        </div>

        <!-- 슬림 다이어트 엑셀 다운로드 버튼 -->
        <button class="btn-excel-export-slim" @click="exportToExcel">
          <i class="material-icons">file_download</i>
          <span>엑셀 (XLSX) 다운로드</span>
        </button>
      </div>

      <!-- 날짜 선택기 & 총 금액 슬림 바 -->
      <div class="hero-dashboard-bar">
        <div class="date-selector-pill">
          <input type="date" v-model="selectedDate" class="date-input-clean" />
        </div>

        <div class="total-amount-display">
          <span class="amount-label">일일 운송 총액:</span>
          <span class="amount-value">₩ {{ currentTotalAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- ⚡ 스마트 모드 스위처 & 슬림 단건 작성 버튼 -->
    <div class="mode-control-bar">
      <div class="mode-tabs">
        <button 
          :class="['mode-btn', { active: currentMode === 'list' }]" 
          @click="currentMode = 'list'"
        >
          <i class="material-icons">view_list</i>
          <span>장부 대시보드 ({{ currentLedgerList.length }})</span>
        </button>

        <button 
          :class="['mode-btn', { active: currentMode === 'quick_input' }]" 
          @click="currentMode = 'quick_input'"
        >
          <i class="material-icons">post_add</i>
          <span>연속 입력 시트</span>
        </button>
      </div>

      <button class="btn-primary-add-slim" @click="openSingleAddModal">
        <i class="material-icons">add</i>
        <span>단건 작성</span>
      </button>
    </div>

    <!-- 🚀 자주 쓰는 선명 접이식 슬림 패널 (열고 닫기 토글 지원) -->
    <div class="frequent-chips-card">
      <div class="chips-header" @click="toggleShipsPanel" style="cursor: pointer;">
        <div class="left-label">
          <i class="material-icons">directions_boat</i>
          <span class="lbl-txt">자주 쓰는 선명:</span>
          <span class="cnt-badge">총 {{ frequentShips.length }}개</span>
        </div>

        <div class="right-btns" style="display: flex; align-items: center; gap: 0.4rem;" @click.stop>
          <button class="btn-toggle-chips-slim" @click="toggleShipsPanel">
            <span>{{ isShipsPanelOpen ? '접기' : '펼치기' }}</span>
            <i class="material-icons">{{ isShipsPanelOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</i>
          </button>

          <button class="btn-settings-chip-slim" @click="isShipManageModalOpen = true">
            <i class="material-icons">settings</i>
            <span>선명 관리</span>
          </button>
        </div>
      </div>

      <div v-show="isShipsPanelOpen" class="chips-scroll-container">
        <button 
          v-for="sName in frequentShips" 
          :key="sName"
          class="quick-ship-chip"
          @click="applyFrequentShipToForm(sName)"
        >
          + {{ sName }}
        </button>
      </div>
    </div>

    <!-- 📌 MODE 1: 일일 장부 대시보드 리스트 (모바일 스마트 카드 + 데스크톱 표) -->
    <div v-if="currentMode === 'list'" class="list-view-section">
      <!-- 결제 상태 요약 미니 뱃지 통계 -->
      <div class="payment-stats-bar">
        <div 
          v-for="(amount, type) in paymentSummary" 
          :key="type" 
          class="stat-chip"
          :class="type"
        >
          <span class="type-name">{{ type }}</span>
          <span class="type-val">₩ {{ amount.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 모바일 가독성 최적화 카드리스트 (640px 이하 모바일 전용) -->
      <div class="mobile-ledger-list">
        <div v-if="currentLedgerList.length === 0" class="empty-mobile-card">
          <i class="material-icons">inbox</i>
          <p>{{ selectedDate }}에 등록된 장부가 없습니다.</p>
          <button class="btn-go-input" @click="currentMode = 'quick_input'">
            + 연속 입력 시트로 작성하기
          </button>
        </div>

        <div 
          v-for="(item, idx) in currentLedgerList" 
          :key="item.id || idx" 
          class="ledger-mobile-card"
        >
          <div class="card-header-row">
            <div class="ship-info">
              <span class="idx-no">#{{ idx + 1 }}</span>
              <span class="ship-title-badge">{{ item.shipName }}</span>
            </div>
            <span :class="['pay-status-badge', item.paymentType]">{{ item.paymentType }}</span>
          </div>

          <div class="card-item-body">
            {{ item.itemDetails }}
          </div>

          <div class="card-footer-row">
            <div class="amount-box">
              <span class="lbl">금액</span>
              <span class="val">₩ {{ (Number(item.amount) || 0).toLocaleString() }}</span>
            </div>

            <div class="card-btns">
              <button class="icon-btn edit" @click="openSingleEditModal(item)">
                <i class="material-icons">edit</i>
              </button>
              <button class="icon-btn del" @click="deleteLedgerItem(item.id)">
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>

          <div v-if="item.memo" class="card-memo-footer">
            <i class="material-icons">sticky_note_2</i>
            <span>{{ item.memo }}</span>
          </div>
        </div>
      </div>

      <!-- 데스크톱 전용 모던 리스트 테이블 (640px 초과) -->
      <div class="desktop-table-card">
        <div class="table-scroll-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th style="width: 60px; text-align: center;">NO</th>
                <th style="width: 170px;">선명 및 상회</th>
                <th>품목 및 수량 상세</th>
                <th style="width: 140px; text-align: right;">금액</th>
                <th style="width: 100px; text-align: center;">결제구분</th>
                <th style="width: 180px;">비고/메모</th>
                <th style="width: 90px; text-align: center;">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentLedgerList.length === 0">
                <td colspan="7" class="empty-td">
                  <i class="material-icons">receipt_long</i>
                  <p>{{ selectedDate }} 일자에 등록된 객선 장부 데이터가 없습니다.</p>
                  <button class="btn-inline-add" @click="currentMode = 'quick_input'">
                    + 엑셀식 연속 입력 시트로 작성
                  </button>
                </td>
              </tr>

              <tr v-for="(item, idx) in currentLedgerList" :key="item.id || idx">
                <td class="td-no">{{ idx + 1 }}</td>
                <td class="td-ship">
                  <span class="ship-badge">{{ item.shipName }}</span>
                </td>
                <td class="td-item">{{ item.itemDetails }}</td>
                <td class="td-amount">₩ {{ (Number(item.amount) || 0).toLocaleString() }}</td>
                <td class="td-pay">
                  <span :class="['pay-badge', item.paymentType]">{{ item.paymentType }}</span>
                </td>
                <td class="td-memo">{{ item.memo || '-' }}</td>
                <td class="td-actions">
                  <button class="act-btn edit" @click="openSingleEditModal(item)" title="수정">
                    <i class="material-icons">edit</i>
                  </button>
                  <button class="act-btn del" @click="deleteLedgerItem(item.id)" title="삭제">
                    <i class="material-icons">delete</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 📝 MODE 2: 엑셀식 빠른 연속 입력 스마트 시트 -->
    <div v-if="currentMode === 'quick_input'" class="input-sheet-section">
      <div class="sheet-card">
        <div class="sheet-title-row">
          <div>
            <h2>⚡ 엑셀식 연속 입력 스마트 시트</h2>
            <p>키보드 [Tab] 키를 누르며 엑셀처럼 빠르게 작성 후 [장부 일괄 등록]을 누르세요.</p>
          </div>

          <div class="batch-sum-display">
            <span>입력 예상 총액:</span>
            <strong>₩ {{ batchTotalAmount.toLocaleString() }}</strong>
          </div>
        </div>

        <div class="table-scroll-wrapper">
          <table class="grid-sheet-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">NO</th>
                <th style="width: 190px;">선명 및 상회 *</th>
                <th>품목 및 수량 *</th>
                <th style="width: 150px;">금액 (원) *</th>
                <th style="width: 120px;">결제구분</th>
                <th style="width: 200px;">비고/메모</th>
                <th style="width: 50px; text-align: center;">삭제</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in batchRows" :key="rIdx">
                <td class="r-no">{{ rIdx + 1 }}</td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.shipName" 
                    placeholder="예: 프라이드" 
                    class="sheet-input"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.itemDetails" 
                    placeholder="예: 박스 외 10개 (상)" 
                    class="sheet-input"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    inputmode="numeric"
                    v-model.number="row.amount" 
                    placeholder="0" 
                    class="sheet-input amount"
                  />
                </td>
                <td>
                  <select v-model="row.paymentType" class="sheet-select">
                    <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="text" 
                    v-model="row.memo" 
                    placeholder="상세 비고" 
                    class="sheet-input"
                  />
                </td>
                <td style="text-align: center;">
                  <button class="btn-del-row" @click="removeRow(rIdx)">
                    <i class="material-icons">close</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 하단 액션 컨트롤 바 -->
        <div class="sheet-footer">
          <div class="left-actions">
            <button class="btn-add-line" @click="addRow">
              <i class="material-icons">add</i>
              <span>행 추가</span>
            </button>
            <button class="btn-reset-lines" @click="resetRows">초기화</button>
          </div>

          <button 
            class="btn-submit-batch" 
            :disabled="isSubmittingBatch" 
            @click="submitBatchRows"
          >
            <i class="material-icons">task_alt</i>
            <span>{{ isSubmittingBatch ? '저장 처리 중...' : '일괄 장부 등록완료' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ✏️ 단건 등록/수정 모달 다이얼로그 -->
    <v-dialog v-model="isSingleModalOpen" max-width="440">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="dialog-title">
          <i class="material-icons" style="color: #1ad1b1;">{{ isEditMode ? 'edit_note' : 'post_add' }}</i>
          <span>{{ isEditMode ? '객선 장부 내역 수정' : '객선 장부 단건 등록' }}</span>
        </v-card-title>

        <div class="dialog-body">
          <div class="form-group">
            <label>작성 날짜</label>
            <input type="date" v-model="singleForm.date" class="dialog-input" />
          </div>

          <div class="form-group">
            <label>선명 및 상회 *</label>
            <input type="text" v-model="singleForm.shipName" placeholder="예: 코리아(덕적)" class="dialog-input" />
          </div>

          <div class="form-group">
            <label>품목 및 수량 *</label>
            <input type="text" v-model="singleForm.itemDetails" placeholder="예: 부식 15 (덕적고)" class="dialog-input" />
          </div>

          <div class="form-group">
            <label>금액 (원) *</label>
            <input type="number" inputmode="numeric" v-model.number="singleForm.amount" placeholder="0" class="dialog-input amount" />
          </div>

          <div class="form-group">
            <label>결제 구분</label>
            <select v-model="singleForm.paymentType" class="dialog-select">
              <option v-for="opt in paymentOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>비고 / 작성자 메모</label>
            <input type="text" v-model="singleForm.memo" placeholder="상세 비고" class="dialog-input" />
          </div>
        </div>

        <v-card-actions class="dialog-actions">
          <v-btn class="btn-cancel" @click="isSingleModalOpen = false">취소</v-btn>
          <v-btn class="btn-save" @click="saveSingleLedger">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ⚙️ 자주 쓰는 선명 관리 모달 -->
    <v-dialog v-model="isShipManageModalOpen" max-width="480">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="dialog-title justify-space-between">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <i class="material-icons" style="color: #1ad1b1;">directions_boat</i>
            <span>자주 쓰는 선명 / 상회 관리</span>
          </div>
          <v-btn icon size="x-small" variant="text" style="color: rgba(255,255,255,0.5);" @click="isShipManageModalOpen = false">
            <i class="material-icons">close</i>
          </v-btn>
        </v-card-title>

        <div class="dialog-body">
          <div class="chip-input-bar">
            <input 
              type="text" 
              v-model="newShipInput" 
              placeholder="새 선명 입력 (예: 연평(오전))" 
              class="chip-input"
              @keyup.enter="addFrequentShip"
            />
            <button class="btn-chip-add" @click="addFrequentShip">+ 추가</button>
          </div>

          <div class="chip-list-box">
            <div class="box-head">
              <span>현재 선명 목록</span>
              <span class="cnt">총 {{ frequentShips.length }}개</span>
            </div>
            <div class="chips-flex">
              <div v-for="sName in frequentShips" :key="sName" class="chip-item">
                <span>{{ sName }}</span>
                <i class="material-icons" @click="deleteFrequentShip(sName)">highlight_off</i>
              </div>
            </div>
          </div>
        </div>

        <v-card-actions class="dialog-actions justify-end">
          <v-btn class="btn-cancel" @click="isShipManageModalOpen = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🔔 커스텀 알림 (Alert) -->
    <v-dialog v-model="isCustomAlertOpen" max-width="360">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="dialog-title" style="color: #1ad1b1;">
          <i class="material-icons">info</i>
          <span>{{ customAlertTitle }}</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; color: rgba(255,255,255,0.9);">
          {{ customAlertMessage }}
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn class="btn-save" style="width: 100%;" @click="isCustomAlertOpen = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ❓ 커스텀 확인 (Confirm) -->
    <v-dialog v-model="isCustomConfirmOpen" max-width="360">
      <v-card class="pa-6 dialog-card">
        <v-card-title class="dialog-title" style="color: #ff5c8d;">
          <i class="material-icons">help_outline</i>
          <span>{{ customConfirmTitle }}</span>
        </v-card-title>
        <v-card-text class="py-4 px-0" style="font-size: 1.4rem; color: rgba(255,255,255,0.9);">
          {{ customConfirmMessage }}
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn class="btn-cancel" @click="isCustomConfirmOpen = false">취소</v-btn>
          <v-btn class="btn-save" style="background: linear-gradient(135deg, #ff006e 0%, #d60058 100%) !important;" @click="executeConfirm">확인</v-btn>
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

/* 👑 스마트 대시보드 메인 헤더 카드 */
.hero-header-card {
  background: linear-gradient(135deg, #0f2b48 0%, #0a1b2e 100%);
  border: 1px solid rgba(136, 197, 255, 0.25);
  border-radius: 1.8rem;
  padding: 1.8rem;
  margin-bottom: 1.6rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);

  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-bottom: 1.6rem;

    .brand-group {
      display: flex;
      align-items: center;
      gap: 1rem;

      .brand-icon {
        width: 48px;
        height: 48px;
        border-radius: 1.2rem;
        background: rgba(26, 209, 177, 0.15);
        border: 1px solid rgba(26, 209, 177, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;

        i { color: #1ad1b1; font-size: 2.6rem; }
      }

      .brand-title {
        font-size: 2rem;
        font-weight: 900;
        color: #ffffff;
        margin: 0;
        letter-spacing: -0.04rem;
      }

      .brand-sub {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.5);
        margin: 0.2rem 0 0 0;
      }
    }

    .btn-excel-export-slim {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(46, 204, 113, 0.15);
      border: 1px solid rgba(46, 204, 113, 0.35);
      color: #2ecc71;
      font-weight: 800;
      font-size: 1.15rem;
      padding: 0.35rem 0.85rem;
      border-radius: 0.7rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(46, 204, 113, 0.25);
      }
      i { font-size: 1.5rem; }
    }
  }

  .hero-dashboard-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.9rem 1.4rem;
    border-radius: 1.2rem;

    .date-selector-pill {
      display: flex;
      align-items: center;

      .date-input-clean {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(136, 197, 255, 0.25);
        border-radius: 0.7rem;
        padding: 0.35rem 0.75rem;
        color: #ffffff;
        font-size: 1.25rem;
        font-weight: 800;
        outline: none;

        &::-webkit-calendar-picker-indicator {
          filter: invert(0.85);
          cursor: pointer;
        }
      }
    }

    .total-amount-display {
      display: flex;
      align-items: baseline;
      gap: 0.6rem;

      .amount-label {
        font-size: 1.15rem;
        color: rgba(255, 255, 255, 0.6);
      }

      .amount-value {
        font-size: 2.2rem;
        font-weight: 900;
        color: #1ad1b1;
        letter-spacing: -0.04rem;
      }
    }
  }
}

/* ⚡ 모드 제어 바 */
.mode-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.4rem;

  .mode-tabs {
    display: flex;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.3rem;
    border-radius: 1rem;

    .mode-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.1rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.5);
      background: transparent;
      border: none;
      border-radius: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;

      i { font-size: 1.5rem; }

      &.active {
        background: var(--primary-darken-color-1);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(21, 60, 108, 0.4);
      }
    }
  }

  .btn-primary-add-slim {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(58, 134, 255, 0.18);
    border: 1px solid rgba(58, 134, 255, 0.35);
    color: #88c5ff;
    font-weight: 800;
    font-size: 1.15rem;
    padding: 0.4rem 0.9rem;
    border-radius: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: rgba(58, 134, 255, 0.28); }
    i { font-size: 1.5rem; }
  }
}

/* 🚀 자주 쓰는 선명 슬림 패널 */
.frequent-chips-card {
  background: rgba(13, 30, 51, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.2rem;
  padding: 0.9rem 1.2rem;
  margin-bottom: 1.6rem;

  .chips-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;

    .left-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;

      i { color: #1ad1b1; font-size: 1.5rem; }
      .lbl-txt { font-size: 1.15rem; }
      .cnt-badge {
        font-size: 1rem;
        font-weight: 700;
        color: #1ad1b1;
        background: rgba(26, 209, 177, 0.12);
        padding: 0.15rem 0.5rem;
        border-radius: 0.4rem;
        margin-left: 0.3rem;
      }
    }

    .btn-toggle-chips-slim {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #88c5ff;
      padding: 0.2rem 0.6rem;
      border-radius: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;

      i { font-size: 1.4rem; }
    }

    .btn-settings-chip-slim {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      background: rgba(26, 209, 177, 0.12);
      border: 1px solid rgba(26, 209, 177, 0.3);
      color: #1ad1b1;
      padding: 0.2rem 0.6rem;
      border-radius: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;

      i { font-size: 1.3rem; }
    }
  }

  .chips-scroll-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.2rem;

    .quick-ship-chip {
      background: rgba(136, 197, 255, 0.12);
      border: 1px solid rgba(136, 197, 255, 0.25);
      color: #88c5ff;
      padding: 0.3rem 0.75rem;
      border-radius: 0.6rem;
      font-size: 1.2rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(136, 197, 255, 0.25);
        transform: translateY(-1px);
      }
    }
  }
}

/* 📌 MODE 1: 일일 장부 대시보드 리스트 */
.payment-stats-bar {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.4rem;

  .stat-chip {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.8rem;

    .type-name { font-size: 1rem; color: rgba(255, 255, 255, 0.5); }
    .type-val { font-size: 1.3rem; font-weight: 800; color: #ffffff; }
  }
}

/* 📱 모바일 카드리스트 (640px 이하 모바일 전용) */
.mobile-ledger-list {
  display: none;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.6rem;

  @media (max-width: 640px) {
    display: flex;
  }

  .empty-mobile-card {
    text-align: center;
    padding: 3.5rem 1rem;
    background: rgba(13, 30, 51, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.4rem;
    color: rgba(255, 255, 255, 0.4);

    i { font-size: 3.6rem; display: block; margin-bottom: 0.8rem; }
    p { font-size: 1.35rem; margin: 0 0 1.2rem 0; }
    .btn-go-input {
      background: rgba(26, 209, 177, 0.15);
      border: 1px solid rgba(26, 209, 177, 0.4);
      color: #1ad1b1;
      padding: 0.6rem 1.4rem;
      border-radius: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .ledger-mobile-card {
    background: rgba(13, 30, 51, 0.95);
    border: 1px solid rgba(136, 197, 255, 0.25);
    border-radius: 1.4rem;
    padding: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ship-info {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        .idx-no { font-size: 1.2rem; font-weight: 800; color: rgba(255, 255, 255, 0.4); }
        .ship-title-badge {
          background: rgba(136, 197, 255, 0.15);
          border: 1px solid rgba(136, 197, 255, 0.3);
          color: #88c5ff;
          padding: 0.3rem 0.8rem;
          border-radius: 0.6rem;
          font-weight: 800;
          font-size: 1.35rem;
        }
      }

      .pay-status-badge {
        font-size: 1.15rem;
        font-weight: 800;
        padding: 0.25rem 0.75rem;
        border-radius: 0.6rem;

        &.선불 { background: rgba(58, 134, 255, 0.2); color: #88c5ff; border: 1px solid rgba(58, 134, 255, 0.3); }
        &.입금 { background: rgba(26, 209, 177, 0.2); color: #1ad1b1; border: 1px solid rgba(26, 209, 177, 0.3); }
        &.후불 { background: rgba(255, 183, 3, 0.2); color: #ffb703; border: 1px solid rgba(255, 183, 3, 0.3); }
        &.현금 { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
        &.미수 { background: rgba(255, 0, 110, 0.2); color: #ff5c8d; border: 1px solid rgba(255, 0, 110, 0.3); }
      }
    }

    .card-item-body {
      font-size: 1.55rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.4;
      word-break: break-all;
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.8rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.08);

      .amount-box {
        display: flex;
        flex-direction: column;

        .lbl { font-size: 1rem; color: rgba(255, 255, 255, 0.5); }
        .val { font-size: 1.85rem; font-weight: 900; color: #1ad1b1; }
      }

      .card-btns {
        display: flex;
        gap: 0.6rem;

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 0.8rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &.edit i { color: #88c5ff; font-size: 1.8rem; }
          &.del i { color: #ff5c8d; font-size: 1.8rem; }
        }
      }
    }

    .card-memo-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.03);
      padding: 0.6rem 0.8rem;
      border-radius: 0.6rem;

      i { font-size: 1.4rem; color: #ffb703; }
    }
  }
}

/* 💻 데스크톱 전용 모던 리스트 테이블 (640px 초과) */
.desktop-table-card {
  background: rgba(13, 30, 51, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.6rem;
  padding: 1.6rem;

  @media (max-width: 640px) {
    display: none;
  }

  .table-scroll-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .modern-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
    text-align: left;

    th {
      padding: 1.2rem 1rem;
      font-size: 1.25rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
    }

    td {
      padding: 1.2rem 1rem;
      font-size: 1.35rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      white-space: nowrap;

      &.td-no { color: rgba(255, 255, 255, 0.4); text-align: center; }
      &.td-ship .ship-badge {
        background: rgba(136, 197, 255, 0.15);
        border: 1px solid rgba(136, 197, 255, 0.3);
        color: #88c5ff;
        padding: 0.3rem 0.8rem;
        border-radius: 0.6rem;
        font-weight: 800;
      }
      &.td-item { font-weight: 700; color: #ffffff; }
      &.td-amount { font-weight: 900; color: #1ad1b1; text-align: right; }
      &.td-pay {
        text-align: center;
        .pay-badge {
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
      &.td-memo { color: rgba(255, 255, 255, 0.6); }
      &.td-actions {
        text-align: center;
        .act-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.4rem;
          &.edit i { color: #88c5ff; }
          &.del i { color: #ff5c8d; }
        }
      }
    }

    .empty-td {
      text-align: center;
      padding: 4rem 0;
      color: rgba(255, 255, 255, 0.4);

      i { font-size: 3.6rem; display: block; margin-bottom: 0.8rem; }
      p { font-size: 1.4rem; margin: 0 0 1.2rem 0; }
      .btn-inline-add {
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
}

/* 📝 MODE 2: 엑셀식 빠른 연속 입력 스마트 시트 */
.sheet-card {
  background: rgba(13, 30, 51, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.6rem;
  padding: 1.6rem;

  .sheet-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.4rem;

    h2 { margin: 0; font-size: 1.7rem; color: #ffffff; }
    p { margin: 0.3rem 0 0 0; font-size: 1.2rem; color: rgba(255, 255, 255, 0.5); }

    .batch-sum-display {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.3rem;
      span { color: rgba(255, 255, 255, 0.6); }
      strong { font-size: 2rem; color: #1ad1b1; font-weight: 900; }
    }
  }

  .table-scroll-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .grid-sheet-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;

    th {
      padding: 1rem;
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
    }

    td {
      padding: 0.6rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &.r-no { text-align: center; color: rgba(255, 255, 255, 0.4); font-weight: 600; }

      .sheet-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.6rem;
        padding: 0.65rem 0.8rem;
        color: #ffffff;
        font-size: 1.3rem;
        outline: none;

        &:focus {
          border-color: #88c5ff;
          background: rgba(255, 255, 255, 0.08);
        }

        &.amount {
          text-align: left;
          color: #1ad1b1;
          font-weight: 800;
        }
      }

      .sheet-select {
        width: 100%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.6rem;
        padding: 0.65rem 0.6rem;
        color: #ffffff;
        font-size: 1.25rem;
        outline: none;

        option { background: #0d1e33; color: #ffffff; }
      }

      .btn-del-row {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        &:hover { color: #ff5c8d; }
      }
    }
  }

  .sheet-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .left-actions {
      display: flex;
      gap: 0.6rem;

      .btn-add-line {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        padding: 0.45rem 0.95rem;
        border-radius: 0.7rem;
        font-weight: 700;
        font-size: 1.15rem;
        cursor: pointer;

        i { font-size: 1.5rem; }
      }

      .btn-reset-lines {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        padding: 0.45rem 0.85rem;
        border-radius: 0.7rem;
        font-size: 1.1rem;
        cursor: pointer;
      }
    }

    .btn-submit-batch {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%);
      border: 1px solid rgba(136, 197, 255, 0.4);
      color: #ffffff;
      font-weight: 800;
      font-size: 1.2rem;
      padding: 0.5rem 1.3rem;
      border-radius: 0.8rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(21, 60, 108, 0.35);

      i { font-size: 1.6rem; }
    }
  }
}

/* ✏️ 모달 공통 스타일 */
.dialog-card {
  background: #0d1e33 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 1.6rem !important;
  color: #ffffff !important;

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.65rem;
    font-weight: 800;
    color: #ffffff;
    padding-bottom: 1rem !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.4rem;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label { font-size: 1.2rem; color: rgba(255, 255, 255, 0.6); }

      .dialog-input, .dialog-select {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 0.8rem;
        padding: 0.8rem 1rem;
        color: #ffffff;
        font-size: 1.35rem;
        outline: none;

        &::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(5) hue-rotate(160deg);
          cursor: pointer;
          opacity: 0.9;
        }

        &.amount { text-align: left; color: #1ad1b1; font-weight: 800; }
        option { background: #0d1e33; color: #ffffff; }
      }
    }

    .chip-input-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.4rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.12);

      .chip-input {
        flex: 1;
        background: transparent;
        border: none;
        padding: 0.7rem 0.9rem;
        color: #ffffff;
        font-size: 1.3rem;
        outline: none;
      }

      .btn-chip-add {
        background: linear-gradient(135deg, #1ad1b1 0%, #15a088 100%);
        border: none;
        color: #0b1a2c;
        font-weight: 800;
        font-size: 1.25rem;
        padding: 0.75rem 1.4rem;
        border-radius: 0.8rem;
        cursor: pointer;
        white-space: nowrap;
      }
    }

    .chip-list-box {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;

      .box-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.6);
        .cnt { color: #1ad1b1; font-weight: 800; }
      }

      .chips-flex {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        max-height: 220px;
        overflow-y: auto;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.08);

        .chip-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(136, 197, 255, 0.1);
          border: 1px solid rgba(136, 197, 255, 0.25);
          color: #88c5ff;
          padding: 0.35rem 0.8rem;
          border-radius: 0.7rem;
          font-size: 1.25rem;
          font-weight: 700;

          i { font-size: 1.5rem; color: #ff5c8d; cursor: pointer; }
        }
      }
    }
  }

  .dialog-actions {
    gap: 0.8rem;
    padding-top: 1.4rem;

    .btn-cancel {
      color: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.8rem;
      padding: 0.6rem 1.6rem;
    }

    .btn-save {
      background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important;
      color: #ffffff !important;
      font-weight: 700;
      border-radius: 0.8rem;
      padding: 0.6rem 1.6rem;
    }
  }
}
</style>
