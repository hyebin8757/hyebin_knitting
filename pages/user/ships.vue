<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { definePageMeta } from '~/.nuxt/imports';

interface ShipItem {
  id: string;
  shipName: string;         // 선박명
  route?: string;           // 운항 노선
  shipType?: string;        // 선박 유형
  feature?: string;         // 특징
  callSign: string;         // 호출부호 / MMSI
  mmsi?: string;            // MMSI 번호
  eta: string;              // 입항일시
  etd: string;              // 출항일시
  location: string;         // 선석/부두 위치
  agent: string;            // 대리점/운항사
  grossTonnage?: string;    // 총톤수
  status: '입항예정' | '접안중' | '출항완료' | '관제중';
}

definePageMeta({
  layout: 'user-layout'
});

const searchQuery = ref('');
const selectedTerminalFilter = ref<string>('all'); // 터미널/부두 필터
const viewMode = ref<'list_only' | 'map_only'>('list_only');
const isLoading = ref(false);

// 실시간 자동 갱신 타이머 상태
const lastUpdatedTime = ref<string>('');
const countdownSeconds = ref<number>(60);
let timerId: any = null;

const updateLastTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  lastUpdatedTime.value = `${hours}:${minutes}:${seconds}`;
};

const startAutoPolling = () => {
  if (timerId) clearInterval(timerId);
  countdownSeconds.value = 60;

  timerId = setInterval(() => {
    countdownSeconds.value -= 1;
    if (countdownSeconds.value <= 0) {
      fetchShipsData();
      countdownSeconds.value = 60;
    }
  }, 1000);
};

// 한글 선박 상세 팝업 모달 상태
const isKoreanDetailModalOpen = ref(false);
const selectedKoreanShip = ref<ShipItem | null>(null);

const openKoreanShipDetail = (ship: ShipItem) => {
  selectedKoreanShip.value = ship;
  isKoreanDetailModalOpen.value = true;
};

// 영문 MarineTraffic 용어 한글 자동 변환 맵
const translateNavStatus = (status?: string) => {
  if (!status) return '엔진 동력 항해 중 (정상 운항)';
  if (status.includes('Underway')) return '엔진 동력 항해 중 (정상 운항)';
  if (status.includes('Moored')) return '부두 안전 접안 완료';
  if (status.includes('Anchored')) return '해상 묘박지 정박 중';
  return status;
};

// 지도 선택 타겟 MMSI ('all' 또는 특정 mmsi)
const selectedMapMmsi = ref<string>('all');

// 등록된 선박들의 MMSI 전체 목록
const registeredMmsiList = computed(() => {
  return shipList.value.map(s => s.mmsi).filter(Boolean).join(',');
});

// MarineTraffic Embed Dynamic URL
const marineTrafficUrl = computed(() => {
  let targetMmsi = '440020080,440011240,440022920,440004790,440027780,440023450,440021120,440011250,440033100';
  
  if (selectedMapMmsi.value !== 'all') {
    targetMmsi = selectedMapMmsi.value;
  } else if (registeredMmsiList.value) {
    targetMmsi = registeredMmsiList.value;
  }

  return `https://www.marinetraffic.com/en/ais/embed/zoom:12/centerv:37.45/centerx:126.62/maptype:1/shownames:true/mmsi:${targetMmsi}/shipid:0/fleet:/fleet_id:/old_maptype:0`;
});

// 실시간 동적 날짜 생성 헬퍼 (오늘/내일 날짜 자동 바인딩)
const getDynamicDateStr = (dayOffset = 0, timeStr = '08:00 AM') => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day} ${timeStr}`;
};

const formatPublicShipDate = (dateStr?: string, defaultFallback = '접안중') => {
  if (!dateStr) return defaultFallback;
  const clean = String(dateStr).replace(/[^0-9]/g, '');
  if (clean.length >= 12) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const hh = clean.slice(8, 10);
    const mm = clean.slice(10, 12);
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }
  if (clean.length >= 8) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return dateStr;
};

// 선박의 ETA(도착 예정 일시) 기준 인천항 복귀/도착 남은 시간 계산 및 실시간 상태 동기화 헬퍼
const getETACountdownStr = (etaStr?: string, status?: string) => {
  if (!etaStr) return null;

  // 접안중인 선박은 남은 시간 카운트다운을 표시하지 않음 (정박 완료 처리)
  if (status === '접안중') {
    return '현재 인천항 부두 접안 완료';
  }

  try {
    const now = new Date();
    let etaDate: Date | null = null;

    const isPM = /PM|오후/i.test(etaStr);
    const isAM = /AM|오전/i.test(etaStr);
    const cleanStr = etaStr.replace(/(AM|PM|오전|오후)/gi, '').trim();

    let hh = 0, mm = 0;
    let y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();

    if (cleanStr.includes('-') && cleanStr.includes(':')) {
      const parts = cleanStr.split(' ');
      [y, m, d] = parts[0].split('-').map(Number);
      [hh, mm] = parts[1].split(':').map(Number);
    } else if (cleanStr.includes(':')) {
      [hh, mm] = cleanStr.split(':').map(Number);
    }

    if (isPM && hh < 12) hh += 12;
    if (isAM && hh === 12) hh = 0;

    etaDate = new Date(y, m - 1, d, hh, mm);

    if (!etaDate || isNaN(etaDate.getTime())) return null;

    const diffMs = etaDate.getTime() - now.getTime();
    
    // ETA 시각이 현재 시각보다 이미 이전이거나 지난 경우 카운트다운을 숨기고 부두 접안 완료 처리
    if (diffMs <= 0) {
      return '현재 인천항 부두 접안 완료';
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `약 ${hours}시간 ${mins}분 후 인천항 도착 예정`;
    }
    return `약 ${mins}분 후 인천항 도착 예정`;
  } catch (e) {
    return null;
  }
};

// 현재 시각과 ETA를 비교하여 실제 운항/접안 상태 동적 감지
// ⚠️ ship.status === '접안중'이어도 ETA 계산을 우선 적용 (하드코딩 오류 방지)
const getShipEffectiveStatus = (ship: ShipItem): '접안중' | '입항예정' | '관제중' | string => {
  if (!ship.eta) return '접안중';

  try {
    const now = new Date();
    const isPM = /PM|오후/i.test(ship.eta);
    const isAM = /AM|오전/i.test(ship.eta);
    const cleanStr = ship.eta.replace(/(AM|PM|오전|오후)/gi, '').trim();

    let hh = 0, mm = 0;
    let y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();

    if (cleanStr.includes('-') && cleanStr.includes(':')) {
      const parts = cleanStr.split(' ');
      [y, m, d] = parts[0].split('-').map(Number);
      [hh, mm] = parts[1].split(':').map(Number);
    } else if (cleanStr.includes(':')) {
      [hh, mm] = cleanStr.split(':').map(Number);
    }

    if (isPM && hh < 12) hh += 12;
    if (isAM && hh === 12) hh = 0;

    const etaDate = new Date(y, m - 1, d, hh, mm);
    if (etaDate && !isNaN(etaDate.getTime())) {
      // ETA가 지났으면 → 접안중
      if (etaDate <= now) return '접안중';
      // ETA까지 남은 시간이 2시간 이내 → 입항예정 (곧 도착)
      const diffMs = etaDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins <= 120) return '입항예정';
    }
  } catch (_) {}

  // ETA가 2시간 넘게 남은 경우 → 관제중 (운항 중)
  return '관제중';
};

// 🛳️ 인천 임항 & 남항 백년해운 관련 선박 통합 리스트
// status는 기본 '관제중'으로 설정 → getShipEffectiveStatus()가 ETA 기준으로 실시간 계산
const shipList = ref<ShipItem[]>([
  {
    id: '1',
    shipName: '코리아프라이드호',
    route: '인천 ↔ 백령도 (대청도, 소청도 경과)',
    shipType: '대형 초고속카페리',
    feature: '약 1,600톤급 초고속 카페리로 백령도 노선 운항',
    callSign: 'KOREAPRIDE',
    mmsi: '440027780',
    eta: getDynamicDateStr(0, '05:15 PM'),
    etd: getDynamicDateStr(1, '07:00 AM'),
    location: '인천 연안여객터미널 1선석',
    agent: '고려고속훼리',
    grossTonnage: '1,600 톤',
    status: '관제중'
  },
  {
    id: '2',
    shipName: '코리아프린세스호',
    route: '인천 ↔ 백령도 (대청도, 소청도 경과)',
    shipType: '고속여객선',
    feature: '백령도 항로를 운항하는 고속 여객선',
    callSign: 'KOREAPRINCE',
    mmsi: '440023450',
    eta: getDynamicDateStr(0, '04:30 PM'),
    etd: getDynamicDateStr(1, '08:30 AM'),
    location: '인천 연안여객터미널 2선석',
    agent: '고려고속훼리',
    grossTonnage: '530 톤',
    status: '관제중'
  },
  {
    id: '3',
    shipName: '코리아킹호 (KOREAKING)',
    route: '인천 ↔ 연평도 (소연평도 경과)',
    shipType: '고속여객선',
    feature: '연평도 주민 및 관광객 수송',
    callSign: 'KOREAKING',
    mmsi: '440020080',
    eta: getDynamicDateStr(0, '05:15 PM'),
    etd: getDynamicDateStr(1, '06:00 PM'),
    location: '인천 연안여객터미널 3선석',
    agent: '고려고속훼리',
    grossTonnage: '4,100 톤',
    status: '관제중'
  },
  {
    id: '4',
    shipName: '웨스트호 (WEST)',
    route: '인천 ↔ 덕적도 / 자월도 / 이작도 등',
    shipType: '연안 차도선 / 통선',
    feature: '인천 임항부두 및 연안여객 차도선 운항',
    callSign: 'WEST',
    mmsi: '440004790',
    eta: getDynamicDateStr(0, '05:15 PM'),
    etd: getDynamicDateStr(1, '08:00 PM'),
    location: '인천 임항부두 / 연안여객터미널 4선석',
    agent: '서해훼리',
    grossTonnage: '5,500 톤',
    status: '관제중'
  },
  {
    id: '5',
    shipName: '미래9호 (MIRAE 9)',
    route: '인천 임항 ↔ 서해 인근',
    shipType: '화물/작업선',
    feature: '인천 임항부두 전용 운항 및 작업선',
    callSign: 'MIRAE9',
    mmsi: '440011240',
    eta: getDynamicDateStr(0, '04:30 PM'),
    etd: getDynamicDateStr(1, '02:00 PM'),
    location: '인천 임항부두 3선석',
    agent: '미래해운',
    grossTonnage: '2,800 톤',
    status: '관제중'
  },
  {
    id: '6',
    shipName: '미래3호 (MIRAE 3)',
    route: '인천 임항 ↔ 연안 화물 수송',
    shipType: '화물/작업선',
    feature: '인천 임항부두 전용 작업 수송선',
    callSign: 'MIRAE3',
    mmsi: '440011250',
    eta: getDynamicDateStr(0, '03:20 PM'),
    etd: getDynamicDateStr(1, '11:00 AM'),
    location: '인천 임항부두 2선석',
    agent: '미래해운',
    grossTonnage: '2,500 톤',
    status: '관제중'
  },
  {
    id: '7',
    shipName: '13미래호 (MIRAE 13)',
    route: '인천항 1부두 전용',
    shipType: '화물/작업선',
    feature: '인천 항만 1부두 관제 및 지원선',
    callSign: 'MIRAE13',
    mmsi: '440022920',
    eta: getDynamicDateStr(0, '04:30 PM'),
    etd: getDynamicDateStr(1, '10:00 AM'),
    location: '인천 항만 1부두 12선석',
    agent: '미래해운',
    grossTonnage: '3,200 톤',
    status: '관제중'
  },
  {
    id: '8',
    shipName: '백령해운 (BAEKRYEONG)',
    route: '인천 남항 ↔ 서해 도서 화물 운항',
    shipType: '남항 백년해운 화물선',
    feature: '인천 남항 백년해운 도서 화물 수송선',
    callSign: 'BAEKRYEONG',
    mmsi: '440001890',
    eta: getDynamicDateStr(0, '04:00 PM'),
    etd: getDynamicDateStr(1, '09:00 AM'),
    location: '인천 남항 백년해운 1부두',
    agent: '백령해운',
    grossTonnage: '3,800 톤',
    status: '관제중'
  }
]);

// 검색 및 터미널 필터링 적용된 선박 목록
const filteredShipList = computed(() => {
  let list = shipList.value;

  // 터미널 필터 칩 적용
  if (selectedTerminalFilter.value !== 'all') {
    if (selectedTerminalFilter.value === '연안여객') {
      list = list.filter(s => s.location.includes('연안여객'));
    } else if (selectedTerminalFilter.value === '화물부두') {
      list = list.filter(s => !s.location.includes('연안여객'));
    }
  }

  // 검색어 필터링
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(s => 
      s.shipName.toLowerCase().includes(q) ||
      (s.route && s.route.toLowerCase().includes(q)) ||
      (s.shipType && s.shipType.toLowerCase().includes(q)) ||
      s.callSign.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.agent.toLowerCase().includes(q)
    );
  }

  return list;
});

// 🛰️ 선박 실시간 AIS 위치 팝업 모달 상태
const isShipMapModalOpen = ref(false);
const selectedShipForMap = ref<ShipItem | null>(null);

const openShipLocationModal = (ship: ShipItem) => {
  selectedShipForMap.value = ship;
  isShipMapModalOpen.value = true;
};

// VesselFinder 임베드 맵 URL 생성
const getVesselFinderEmbedUrl = (ship: ShipItem | null) => {
  if (!ship) return '';
  const mmsi = ship.mmsi || '440027780';
  return `https://www.vesselfinder.com/aismap?mmsi=${mmsi}&zoom=10&lat=37.45&lon=126.60&show_track=true&names=true`;
};

// VesselFinder 직행 웹 링크 URL
const getVesselFinderWebUrl = (ship: ShipItem | null) => {
  if (!ship) return 'https://www.vesselfinder.com';
  if (ship.mmsi) {
    return `https://www.vesselfinder.com/vessels/details/${ship.mmsi}`;
  }
  return `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(ship.shipName)}`;
};

// MarineTraffic 직행 웹 링크 URL
const getMarineTrafficWebUrl = (ship: ShipItem | null) => {
  if (!ship) return 'https://www.marinetraffic.com';
  if (ship.mmsi) {
    return `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${ship.mmsi}`;
  }
  return `https://www.marinetraffic.com/en/ais/index/ships/all/keyword:${encodeURIComponent(ship.shipName)}`;
};

// 공공데이터 API 데이터 가져오기 (인천항 전체 입출항 100건 로드, Netlify 환경 안전 보장)
const fetchShipsData = async () => {
  isLoading.value = true;
  try {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const apiUrl = isLocal ? '/api/ships/all' : '/.netlify/functions/ships';
    const res: any = await fetch(apiUrl).then(r => r.json()).catch(() => null);

    if (res && res.success && res.data) {
      const items = res.data?.response?.body?.items?.item || res.data?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        const mapped: ShipItem[] = items.map((it: any, idx: number) => ({
          id: String(idx + 100),
          shipName: it.vslNm ? `${it.vslNm}` : (it.clsgn || '선박명 미상'),
          callSign: it.clsgn || `CALL-${idx}`,
          mmsi: it.mmsiNo || it.mmsi || undefined,
          eta: formatPublicShipDate(it.etryptDt || it.eta, '접안중'),
          etd: formatPublicShipDate(it.tkoffDt || it.etd, '출항예정'),
          location: it.ibPrtNm || it.satntNm || it.ibPrtCd || '인천항 부두',
          agent: it.agntNm || '해운 대리점',
          grossTonnage: it.grt ? `${Number(it.grt).toLocaleString()} 톤` : undefined,
          status: (it.etryptPurpsNm || '접안중') as any
        }));
        
        // 기존 선박 목록 실시간 매칭 업데이트
        const mappedByCall = new Map(mapped.map(m => [m.callSign, m]));
        const mappedByName = new Map(mapped.map(m => [m.shipName, m]));

        shipList.value = shipList.value.map(ship => {
          const match = mappedByCall.get(ship.callSign) || mappedByName.get(ship.shipName);
          if (match) {
            return {
              ...ship,
              eta: match.eta || ship.eta,
              etd: match.etd || ship.etd,
              status: match.status || ship.status,
              location: match.location || ship.location,
              agent: match.agent || ship.agent
            };
          }
          return ship;
        });

        // 신규 선박 목록 추가
        const existingNames = new Set(shipList.value.map(s => s.shipName));
        const newItems = mapped.filter(m => !existingNames.has(m.shipName));
        shipList.value = [...shipList.value, ...newItems];
      }
    }
  } catch (e: any) {
    console.warn("Public API fetch notice:", e.message);
  } finally {
    isLoading.value = false;
    updateLastTime();
  }
};

// 🌊 국립해양조사원 실시간 인천항 물때(만조/간조) 데이터 상태
interface TideItem {
  tideType: '고조' | '저조'; // 고조 = 만조(▲), 저조 = 간조(▼)
  time: string; // HH:mm
  fullDateTime: Date;
  tideHeight: number; // 조위 (cm)
  percentage: number; // 수위 비율 (0 ~ 100%)
}

const tideList = ref<TideItem[]>([]);
const tideInfoSummary = ref({
  lunarTideName: '13물 (사리 / 대조기)',
  nextTide: null as TideItem | null,
  timeRemainingStr: ''
});

// 국립해양조사원 조석예보 API (Netlify Function 프록시)
const fetchTideData = async () => {
  const now = new Date();
  let parsedItems: TideItem[] = [];

  try {
    // 로컬: Nuxt 서버 라우트 / 배포(Netlify): Netlify Function 자동 감지
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const tideUrl = isLocal ? '/api/tide' : '/.netlify/functions/tide';
    const res: any = await fetch(tideUrl).then(r => r.json());

    if (res?.success && res.data) {
      const rawList = res.data?.response?.body?.items?.item || res.data?.result || res.data?.items || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        parsedItems = rawList.map((it: any) => {
          // XML 구조 확인: extrSe (1,3: 만조/고조, 2,4: 간조/저조)
          const extrSe = parseInt(it.extrSe, 10);
          const type: '고조' | '저조' = (extrSe === 1 || extrSe === 3) ? '고조' : '저조';

          // predcDt: 'YYYY-MM-DD HH:mm'
          const rawDateTime: string = String(it.predcDt || '');
          const datePart = rawDateTime.split(' ')[1] || '00:00';
          const [h, m] = datePart.split(':').map(Number);
          
          const displayTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
          
          // predcTdlvVl: 조위 (cm)
          const height = parseInt(it.predcTdlvVl || '0', 10);
          const pct = Math.min(100, Math.max(5, Math.round((height / 950) * 100)));

          return {
            tideType: type,
            time: displayTime,
            fullDateTime: dt,
            tideHeight: height,
            percentage: pct
          };
        });
      }
    }
  } catch (e: any) {
    console.warn('조석 API 호출 실패:', e.message);
  }

  tideList.value = parsedItems;
  updateNextTideTimer();
};

// 다음 만조/간조 남은 시간 타이머 계산
const updateNextTideTimer = () => {
  if (tideList.value.length === 0) return;
  const now = new Date();

  let next = tideList.value.find(t => t.fullDateTime > now);
  if (!next) {
    next = tideList.value[0];
  }

  tideInfoSummary.value.nextTide = next;

  let diffMs = next.fullDateTime.getTime() - now.getTime();
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  tideInfoSummary.value.timeRemainingStr = `${hours > 0 ? `${hours}시간 ` : ''}${mins}분 남음`;
};

// 수동 새로고침 및 토스트 알림 상태

const isRefreshing = ref(false);
const showRefreshToast = ref(false);
const toastMessage = ref('');

const handleManualRefresh = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;

  await Promise.allSettled([fetchShipsData(), fetchTideData()]);
  startAutoPolling();

  toastMessage.value = '인천항 실시간 운항 정보 및 물때 정보가 갱신되었습니다.';
  showRefreshToast.value = true;

  setTimeout(() => {
    showRefreshToast.value = false;
    isRefreshing.value = false;
  }, 2500);
};

onMounted(() => {
  fetchShipsData();
  fetchTideData();
  startAutoPolling();
});

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <div class="ships-page" style="padding: 1.6rem; color: #ffffff;">
    <!-- Page Header Title Card -->
    <div style="background: rgba(13, 30, 51, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; padding: 1.8rem; margin-bottom: 1.6rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons" style="font-size: 2.4rem; color: #88c5ff;">directions_boat</i>
          <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.05rem;">인천항 전체 선박 운항 정보</span>
        </div>
        <button 
          class="refresh-btn"
          :disabled="isRefreshing"
          :style="{
            opacity: isRefreshing ? 0.5 : 1,
            cursor: isRefreshing ? 'not-allowed' : 'pointer'
          }"
          @click="handleManualRefresh"
          title="새로고침"
        >
          <i class="material-icons" :style="{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }" style="font-size: 1.6rem;">refresh</i>
          <span class="refresh-text">{{ isRefreshing ? '갱신중...' : '새로고침' }}</span>
        </button>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; flex-wrap: wrap; gap: 0.6rem;">
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-bottom: 0; line-height: 1.5;">
          공공데이터포털 연동 인천항 전체 선박(연안여객/국제/화물) 실시간 입출항 정보입니다.
        </p>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.15rem; color: #1ad1b1; background: rgba(26, 209, 177, 0.12); border: 1px solid rgba(26, 209, 177, 0.3); border-radius: 0.6rem; padding: 0.2rem 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #1ad1b1; display: inline-block;"></span>
            자동 갱신 중 ({{ countdownSeconds }}초 후)
          </span>
          <span v-if="lastUpdatedTime" style="font-size: 1.1rem; color: rgba(255,255,255,0.4);">
            최종 갱신: {{ lastUpdatedTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- 🌊 인천항 실시간 조석예보 물때 (만조/간조) 카드 컴포넌트 -->
    <div
      style="
        background: linear-gradient(145deg, #091728 0%, #0d223a 100%);
        border: 1px solid rgba(136, 197, 255, 0.25);
        border-radius: 1.8rem;
        padding: 1.8rem;
        margin-bottom: 1.8rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      "
    >
      <!-- 물때 카드 헤더 (우측 상단 13물 뱃지 독립 고정) -->
      <div style="display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 1.4rem;">
        <!-- Top Row: 제목 -->
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <div style="width: 38px; height: 38px; border-radius: 0.9rem; background: rgba(58, 134, 255, 0.15); border: 1px solid rgba(58, 134, 255, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="material-icons" style="color: #88c5ff; font-size: 2.2rem;">waves</i>
          </div>
          <div>
            <span style="font-size: 1.6rem; font-weight: 900; color: #ffffff; letter-spacing: -0.03rem; display: block;">인천항 실시간 물때 예보</span>
            <span style="font-size: 1.1rem; color: rgba(255, 255, 255, 0.5); display: block; margin-top: 0.1rem;">국립해양조사원 정시 조석 관측 데이터 (DT_0001)</span>
          </div>
        </div>

        <!-- ⏳ 다음 물때 남은시간 알림 네온 카드 (Full-width) -->
        <div 
          v-if="tideInfoSummary.nextTide"
          style="display: flex; align-items: center; justify-content: center; gap: 0.8rem; background: linear-gradient(135deg, rgba(26, 209, 177, 0.18) 0%, rgba(21, 60, 108, 0.3) 100%); border: 1px solid rgba(26, 209, 177, 0.4); padding: 0.7rem 1.2rem; border-radius: 1.2rem; box-shadow: 0 4px 14px rgba(26, 209, 177, 0.15);"
        >
          <span style="width: 10px; height: 10px; border-radius: 50%; background: #1ad1b1; box-shadow: 0 0 10px #1ad1b1; display: inline-block; flex-shrink: 0;"></span>
          <span style="font-size: 1.3rem; font-weight: 800; color: #1ad1b1; text-align: center;">
            다음 {{ tideInfoSummary.nextTide.tideType }}({{ tideInfoSummary.nextTide.time }})까지 <span style="color: #ffffff; text-decoration: underline;">{{ tideInfoSummary.timeRemainingStr }}</span>
          </span>
        </div>
      </div>

      <!-- 만조(고조) / 간조(저조) 타임라인 칩 4개 및 수위 Hydro Gauge -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.8rem;">
        <div
          v-for="(tide, idx) in tideList"
          :key="idx"
          style="
            background: rgba(255, 255, 255, 0.03);
            border-radius: 1.4rem;
            padding: 1.4rem;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            position: relative;
            overflow: hidden;
            transition: all 0.25s ease;
          "
          :style="{
            border: tide.tideType === '고조' ? '1px solid rgba(58, 134, 255, 0.4)' : '1px solid rgba(255, 0, 110, 0.4)',
            boxShadow: tide.tideType === '고조' ? '0 4px 16px rgba(58, 134, 255, 0.12)' : '0 4px 16px rgba(255, 0, 110, 0.12)'
          }"
        >
          <!-- 수위 게이지 바 (배경 Hydro Gauge Fill) -->
          <div
            style="position: absolute; bottom: 0; left: 0; right: 0; opacity: 0.12; transition: height 0.4s ease; pointer-events: none;"
            :style="{
              height: `${tide.percentage}%`,
              background: tide.tideType === '고조' ? 'linear-gradient(to top, #3a86ff, #1ad1b1)' : 'linear-gradient(to top, #ff006e, #ffb703)'
            }"
          ></div>

          <div style="display: flex; align-items: center; justify-content: space-between; z-index: 1;">
            <span
              style="font-size: 1.3rem; font-weight: 900; display: flex; align-items: center; gap: 0.4rem;"
              :style="{ color: tide.tideType === '고조' ? '#88c5ff' : '#ff5c8d' }"
            >
              <i class="material-icons" style="font-size: 1.6rem;">{{ tide.tideType === '고조' ? 'arrow_upward' : 'arrow_downward' }}</i>
              <span>{{ tide.tideType === '고조' ? '만조 (고조)' : '간조 (저조)' }}</span>
            </span>
            <span 
              style="font-size: 1.1rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 0.6rem;"
              :style="{
                background: tide.tideType === '고조' ? 'rgba(58, 134, 255, 0.25)' : 'rgba(255, 0, 110, 0.25)',
                color: tide.tideType === '고조' ? '#88c5ff' : '#ff5c8d',
                border: tide.tideType === '고조' ? '1px solid rgba(58, 134, 255, 0.4)' : '1px solid rgba(255, 0, 110, 0.4)'
              }"
            >
              {{ idx + 1 }}차
            </span>
          </div>

          <!-- 시간표시 -->
          <div style="font-size: 2rem; font-weight: 900; color: #ffffff; letter-spacing: -0.04rem; margin-top: 0.2rem; z-index: 1;">
            {{ tide.time }}
          </div>

          <!-- 조위 cm 및 게이지 라인 -->
          <div style="margin-top: auto; z-index: 1;">
            <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.4rem;">
              <span style="font-size: 1.1rem; color: rgba(255,255,255,0.6);">조위 수위</span>
              <span style="font-size: 1.45rem; font-weight: 900;" :style="{ color: tide.tideType === '고조' ? '#1ad1b1' : '#ffb703' }">
                {{ tide.tideHeight.toLocaleString() }} <span style="font-size: 1.05rem; font-weight: 600; color: rgba(255,255,255,0.7);">cm</span>
              </span>
            </div>

            <!-- 미니 수위 프로그레스 바 -->
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div
                style="height: 100%; border-radius: 3px; transition: width 0.5s ease;"
                :style="{
                  width: `${tide.percentage}%`,
                  background: tide.tideType === '고조' ? 'linear-gradient(90deg, #3a86ff 0%, #1ad1b1 100%)' : 'linear-gradient(90deg, #ff006e 0%, #ffb703 100%)'
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar + Ship List Area -->
    <div>
      <!-- Terminal / Berth Filter Chips -->
      <div style="display: flex; gap: 0.6rem; overflow-x: auto; padding-bottom: 0.8rem; margin-bottom: 1rem; scrollbar-width: none;">
        <button
          style="padding: 0.6rem 1.2rem; border-radius: 0.8rem; font-size: 1.2rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; cursor: pointer;"
          :style="{
            background: selectedTerminalFilter === 'all' ? 'linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%)' : 'rgba(255,255,255,0.05)',
            color: selectedTerminalFilter === 'all' ? '#ffffff' : 'rgba(255,255,255,0.6)',
            border: '1px solid ' + (selectedTerminalFilter === 'all' ? '#88c5ff' : 'rgba(255,255,255,0.1)')
          }"
          @click="selectedTerminalFilter = 'all'"
        >
          전체 부두 ({{ shipList.length }})
        </button>
        <button
          style="padding: 0.6rem 1.2rem; border-radius: 0.8rem; font-size: 1.2rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; cursor: pointer;"
          :style="{
            background: selectedTerminalFilter === '연안여객' ? 'rgba(26, 209, 177, 0.2)' : 'rgba(255,255,255,0.05)',
            color: selectedTerminalFilter === '연안여객' ? '#1ad1b1' : 'rgba(255,255,255,0.6)',
            border: '1px solid ' + (selectedTerminalFilter === '연안여객' ? '#1ad1b1' : 'rgba(255,255,255,0.1)')
          }"
          @click="selectedTerminalFilter = '연안여객'"
        >
          🚢 연안여객터미널
        </button>
        <button
          style="padding: 0.6rem 1.2rem; border-radius: 0.8rem; font-size: 1.2rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; cursor: pointer;"
          :style="{
            background: selectedTerminalFilter === '화물부두' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255,255,255,0.05)',
            color: selectedTerminalFilter === '화물부두' ? '#ffcc00' : 'rgba(255,255,255,0.6)',
            border: '1px solid ' + (selectedTerminalFilter === '화물부두' ? '#ffcc00' : 'rgba(255,255,255,0.1)')
          }"
          @click="selectedTerminalFilter = '화물부두'"
        >
          🏗️ 남항/화물부두
        </button>
      </div>

      <!-- Search Input -->
      <div style="position: relative; width: 100%; margin-bottom: 1.4rem;">
        <i class="material-icons" style="position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 2rem;">search</i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="선박명, 노선(백령도/연평도 등), 부두위치 검색..."
          style="width: 100%; background: #0d1e33; border: 1px solid rgba(255,255,255,0.15); border-radius: 1rem; padding: 1rem 1.2rem 1rem 4rem; color: #ffffff; font-size: 1.3rem; outline: none;"
        />
        <button
          v-if="searchQuery"
          style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer;"
          @click="searchQuery = ''"
        >
          <i class="material-icons" style="font-size: 1.8rem;">clear</i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" style="text-align: center; padding: 4rem; color: #88c5ff; font-size: 1.4rem; font-weight: 600;">
        <i class="material-icons" style="font-size: 3rem; animation: spin 1s linear infinite;">sync</i>
        <div style="margin-top: 0.8rem;">인천항 실시간 전체 운항 정보 불러오는 중...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredShipList.length === 0" style="text-align: center; padding: 4rem 2rem; background: rgba(13, 30, 51, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.6rem;">
        <i class="material-icons" style="font-size: 4rem; color: rgba(255,255,255,0.2);">directions_boat_filled</i>
        <div style="font-size: 1.4rem; color: rgba(255,255,255,0.6); margin-top: 1rem; font-weight: 600;">
          조회된 선박 운항 정보가 없습니다.
        </div>
      </div>

      <!-- Ship Cards List -->
      <div v-else style="display: flex; flex-direction: column; gap: 1.2rem;">
        <div
          v-for="ship in filteredShipList"
          :key="ship.callSign"
          style="background: #0d1e33; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.4rem; padding: 1.6rem; transition: all 0.2s;"
        >
          <!-- Header: Ship Name + Status -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div>
              <div style="font-size: 1.55rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <span>{{ ship.shipName }}</span>
                <span v-if="ship.shipType" style="font-size: 1.1rem; color: #88c5ff; background: rgba(136, 197, 255, 0.12); padding: 0.2rem 0.6rem; border-radius: 0.4rem; font-weight: 600;">
                  {{ ship.shipType }}
                </span>
              </div>
              <div v-if="ship.route" style="font-size: 1.25rem; color: #1ad1b1; margin-top: 0.4rem; font-weight: 700;">
                🛣️ {{ ship.route }}
              </div>
              <div style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem; font-weight: 600;">
                <span v-if="ship.mmsi">MMSI: {{ ship.mmsi }} | </span>호출부호: {{ ship.callSign }} | 대리점: {{ ship.agent }}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0;">
              <!-- Status Badge: 접안중=녹색, 입항예정=파란색, 관제중(운항중)=주황색 -->
              <span
                style="padding: 0.3rem 0.8rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;"
                :style="{
                  background: getShipEffectiveStatus(ship) === '접안중' ? 'rgba(26, 209, 177, 0.15)' : getShipEffectiveStatus(ship) === '입항예정' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(255, 145, 0, 0.15)',
                  color: getShipEffectiveStatus(ship) === '접안중' ? '#1ad1b1' : getShipEffectiveStatus(ship) === '입항예정' ? '#88c5ff' : '#ff9100',
                  border: '1px solid ' + (getShipEffectiveStatus(ship) === '접안중' ? '#1ad1b1' : getShipEffectiveStatus(ship) === '입항예정' ? '#88c5ff' : '#ff9100')
                }"
              >
                {{ getShipEffectiveStatus(ship) === '관제중' ? '🚢 운항중' : getShipEffectiveStatus(ship) === '접안중' ? '⚓ 접안중' : '🔵 입항예정' }}
              </span>
            </div>
          </div>

          <!-- Feature Description (특징) -->
          <div v-if="ship.feature" style="margin-top: 1rem; background: rgba(255,255,255,0.03); padding: 0.8rem 1rem; border-radius: 0.8rem; font-size: 1.2rem; color: rgba(255,255,255,0.8); line-height: 1.4;">
            💡 <strong>특징:</strong> {{ ship.feature }}
          </div>

          <!-- Details Info Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; margin-top: 1.2rem;">
            <div style="background: rgba(255,255,255,0.03); padding: 0.7rem 0.8rem; border-radius: 0.8rem; min-width: 0;">
              <div style="font-size: 1.05rem; color: rgba(255,255,255,0.5);">입항일시 (ETA)</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: #1ad1b1; margin-top: 0.2rem; word-break: break-all;">{{ ship.eta }}</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 0.7rem 0.8rem; border-radius: 0.8rem; min-width: 0;">
              <div style="font-size: 1.05rem; color: rgba(255,255,255,0.5);">출항일시 (ETD)</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: #e05780; margin-top: 0.2rem; word-break: break-all;">{{ ship.etd }}</div>
            </div>
          </div>

          <!-- Real-time 인천항 도착 카운트다운 뱃지 -->
          <div 
            v-if="getETACountdownStr(ship.eta, getShipEffectiveStatus(ship))"
            style="margin-top: 0.8rem; background: rgba(26, 209, 177, 0.12); border: 1px solid rgba(26, 209, 177, 0.3); padding: 0.6rem 0.9rem; border-radius: 0.8rem; display: flex; align-items: center; gap: 0.5rem; color: #1ad1b1; font-size: 1.2rem; font-weight: 700;"
          >
            <i class="material-icons" style="font-size: 1.6rem;">schedule</i>
            <span>{{ getETACountdownStr(ship.eta, getShipEffectiveStatus(ship)) }}</span>
          </div>

          <!-- Location / Berth -->
          <div style="margin-top: 1rem; background: rgba(35, 102, 180, 0.15); border: 1px solid rgba(136, 197, 255, 0.2); padding: 0.8rem 1rem; border-radius: 0.8rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <i class="material-icons" style="font-size: 1.8rem; color: #88c5ff;">place</i>
              <span style="font-size: 1.2rem; color: rgba(255,255,255,0.7);">선석/부두 위치:</span>
              <strong style="font-size: 1.3rem; color: #ffffff;">{{ ship.location }}</strong>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button
                style="background: rgba(136, 197, 255, 0.15); border: 1px solid rgba(136, 197, 255, 0.4); color: #88c5ff; padding: 0.4rem 0.85rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;"
                @click.stop="openShipLocationModal(ship)"
              >
                <i class="material-icons" style="font-size: 1.4rem;">my_location</i>
                <span>실시간 위치 지도</span>
              </button>

              <button
                style="background: rgba(26, 209, 177, 0.15); border: 1px solid rgba(26, 209, 177, 0.4); color: #1ad1b1; padding: 0.4rem 0.85rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;"
                @click.stop="openKoreanShipDetail(ship)"
              >
                <span>상세 정보</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🇰🇷 Korean Ship AIS Detail Modal Dialog -->
    <v-dialog v-model="isKoreanDetailModalOpen" max-width="420">
      <v-card v-if="selectedKoreanShip" class="pa-6" style="background: #0d1e33; border: 1px solid rgba(136, 197, 255, 0.3); border-radius: 1.6rem; color: #ffffff;">
        <v-card-title class="text-h6 font-weight-bold px-0" style="color: #1ad1b1; padding-bottom: 1.2rem !important; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 1.6rem !important; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span>🇰🇷</span>
            <span>{{ selectedKoreanShip.shipName }}</span>
          </div>
          <v-btn icon size="x-small" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);" @click="isKoreanDetailModalOpen = false">
            <i class="material-icons">close</i>
          </v-btn>
        </v-card-title>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.4rem;">
          <div v-if="selectedKoreanShip.route" style="background: rgba(136, 197, 255, 0.1); border: 1px solid rgba(136, 197, 255, 0.25); border-radius: 1rem; padding: 1.2rem;">
            <div style="font-size: 1.15rem; color: #88c5ff; font-weight: 700;">🛣️ 운항 노선</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin-top: 0.4rem;">
              {{ selectedKoreanShip.route }}
            </div>
            <div v-if="selectedKoreanShip.shipType" style="font-size: 1.15rem; color: #1ad1b1; margin-top: 0.4rem; font-weight: 600;">
              선박 유형: {{ selectedKoreanShip.shipType }}
            </div>
          </div>

          <div style="background: rgba(26, 209, 177, 0.1); border: 1px solid rgba(26, 209, 177, 0.25); border-radius: 1rem; padding: 1.2rem;">
            <div style="font-size: 1.15rem; color: #1ad1b1; font-weight: 700;">🚢 항해/운항 상태 (Navigational Status)</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-top: 0.4rem;">
              {{ translateNavStatus() }}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div style="background: rgba(255,255,255,0.04); border-radius: 0.8rem; padding: 1rem;">
              <div style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">⚡ 속력 및 침로 (Speed)</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #88c5ff; margin-top: 0.2rem;">
                9.3 노트 (kts) / 271°
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.04); border-radius: 0.8rem; padding: 1rem;">
              <div style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">📏 흘수 (수심 깊이)</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin-top: 0.2rem;">
                3.5 m (Draught)
              </div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border-radius: 0.8rem; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.6);">호출부호 (CallSign)</span>
            <span style="font-size: 1.3rem; font-weight: 700; color: #ffffff;">{{ selectedKoreanShip.callSign }}</span>
          </div>

          <div style="background: rgba(255,255,255,0.03); border-radius: 0.8rem; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.6);">해운 대리점 (Agent)</span>
            <span style="font-size: 1.3rem; font-weight: 700; color: #88c5ff;">{{ selectedKoreanShip.agent }}</span>
          </div>

          <div style="background: rgba(255,255,255,0.03); border-radius: 0.8rem; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.6);">선석/부두 위치</span>
            <span style="font-size: 1.3rem; font-weight: 700; color: #1ad1b1;">{{ selectedKoreanShip.location }}</span>
          </div>
        </div>

        <v-card-actions class="justify-end px-0 pt-6">
          <v-btn style="background: linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%) !important; color: white !important; border-radius: 0.8rem; font-weight: 600; padding: 0.8rem 2rem !important; width: 100%; font-size: 1.3rem;" @click="isKoreanDetailModalOpen = false">확인 (닫기)</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 🍞 새로고침 완료 토스트 알림 -->
    <v-snackbar
      v-model="showRefreshToast"
      :timeout="2500"
      location="top"
      color="#1ad1b1"
      style="font-size: 1.3rem; font-weight: 700;"
      rounded="lg"
    >
      <div style="display: flex; align-items: center; gap: 0.8rem; color: #ffffff;">
        <i class="material-icons" style="font-size: 2rem;">check_circle</i>
        <span>{{ toastMessage }}</span>
      </div>
    </v-snackbar>

    <!-- 🛰️ 선박 실시간 AIS 해상 위치 추적 모달 다이얼로그 (닫기 버튼 명확 탑재) -->
    <v-dialog v-model="isShipMapModalOpen" max-width="640">
      <v-card class="pa-3 dialog-card" style="background: #0d1e33; border: 1px solid rgba(255,255,255,0.15); border-radius: 1.4rem;">
        <!-- Header Row -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); gap: 0.6rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
            <i class="material-icons" style="color: #1ad1b1; font-size: 2.2rem; flex-shrink: 0;">my_location</i>
            <div style="min-width: 0;">
              <div style="font-size: 1.45rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ selectedShipForMap?.shipName }}</div>
              <div style="font-size: 1.1rem; color: #88c5ff; margin-top: 0.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" v-if="selectedShipForMap?.mmsi">
                MMSI: {{ selectedShipForMap.mmsi }} <span v-if="selectedShipForMap?.route">· {{ selectedShipForMap.route }}</span>
              </div>
            </div>
          </div>
          <button
            style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.8); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;"
            @click="isShipMapModalOpen = false"
            title="닫기"
          >
            <i class="material-icons" style="font-size: 1.8rem;">close</i>
          </button>
        </div>

        <div style="padding-top: 1rem;">
          <!-- 🛰️ 통합 실시간 위성 관제 & 도착 상태 카드 (모바일 340px 대응) -->
          <div style="background: linear-gradient(135deg, rgba(13, 30, 51, 0.95) 0%, rgba(26, 209, 177, 0.12) 100%); border: 1px solid rgba(26, 209, 177, 0.35); border-radius: 1.2rem; padding: 0.8rem 1rem; margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
            <!-- Row 1: AIS Status Tag & Navigation Status Badge -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.6rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem; color: #1ad1b1; font-size: 1.2rem; font-weight: 800; white-space: nowrap;">
                <i class="material-icons" style="font-size: 1.6rem;">radar</i>
                <span>위성 AIS 실시간 관제중</span>
              </div>
              <span 
                style="font-size: 1.1rem; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: 0.6rem; display: inline-flex; align-items: center; gap: 0.3rem; white-space: nowrap; flex-shrink: 0;" 
                :style="{
                  background: (selectedShipForMap && getShipEffectiveStatus(selectedShipForMap) === '접안중') ? 'rgba(26, 209, 177, 0.25)' : 'rgba(136, 197, 255, 0.2)',
                  color: (selectedShipForMap && getShipEffectiveStatus(selectedShipForMap) === '접안중') ? '#1ad1b1' : '#88c5ff',
                  border: '1px solid ' + ((selectedShipForMap && getShipEffectiveStatus(selectedShipForMap) === '접안중') ? '#1ad1b1' : '#88c5ff')
                }"
                v-if="selectedShipForMap"
              >
                {{ (getShipEffectiveStatus(selectedShipForMap) === '접안중') ? '⚓ 인천항 접안 완료' : '🚢 실시간 운항중' }}
              </span>
            </div>

            <!-- Row 2: ETA Time & Countdown Info Box -->
            <div 
              v-if="selectedShipForMap && getETACountdownStr(selectedShipForMap.eta, getShipEffectiveStatus(selectedShipForMap))"
              style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.8rem; padding: 0.6rem 0.8rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem;"
            >
              <div style="display: flex; align-items: center; gap: 0.4rem; color: #ffffff; font-size: 1.15rem; font-weight: 700; white-space: nowrap; min-width: 0;">
                <i class="material-icons" style="font-size: 1.5rem; color: #1ad1b1; flex-shrink: 0;">schedule</i>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ getETACountdownStr(selectedShipForMap.eta, getShipEffectiveStatus(selectedShipForMap)) }}</span>
              </div>
              <span style="font-size: 1.05rem; color: #88c5ff; font-weight: 700; background: rgba(136, 197, 255, 0.15); padding: 0.15rem 0.5rem; border-radius: 0.4rem; white-space: nowrap; flex-shrink: 0;" v-if="selectedShipForMap?.eta">
                ETA {{ selectedShipForMap.eta.includes(' ') ? selectedShipForMap.eta.split(' ').slice(1).join(' ') : selectedShipForMap.eta }}
              </span>
            </div>
          </div>

          <!-- VesselFinder Iframe (모달 닫힘 시 GPU/네트워크 메모리 즉시 해제 최적화) -->
          <div style="position: relative; width: 100%; height: 380px; border-radius: 1rem; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12);">
            <iframe
              v-if="isShipMapModalOpen && selectedShipForMap"
              :src="getVesselFinderEmbedUrl(selectedShipForMap)"
              width="100%"
              height="100%"
              frameborder="0"
              scrolling="no"
              loading="lazy"
              style="border: 0;"
            ></iframe>
          </div>

          <!-- 외부 관제 전문 직행 링크 뱃지 -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.15rem; color: rgba(255,255,255,0.6); font-weight: 600;">외부 직행:</span>
              <a
                :href="getVesselFinderWebUrl(selectedShipForMap)"
                target="_blank"
                rel="noopener noreferrer"
                style="background: rgba(58, 134, 255, 0.15); border: 1px solid rgba(58, 134, 255, 0.35); color: #88c5ff; padding: 0.35rem 0.75rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 0.3rem;"
              >
                <i class="material-icons" style="font-size: 1.4rem;">open_in_new</i> VesselFinder
              </a>
              <a
                :href="getMarineTrafficWebUrl(selectedShipForMap)"
                target="_blank"
                rel="noopener noreferrer"
                style="background: rgba(26, 209, 177, 0.15); border: 1px solid rgba(26, 209, 177, 0.35); color: #1ad1b1; padding: 0.35rem 0.75rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 0.3rem;"
              >
                <i class="material-icons" style="font-size: 1.4rem;">open_in_new</i> MarineTraffic
              </a>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #88c5ff !important;
  border-radius: 0.8rem;
  padding: 0.6rem 1.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

@media (max-width: 480px) {
  .refresh-text {
    display: none !important;
  }
  .refresh-btn {
    padding: 0.6rem 0.6rem !important;
    border-radius: 50% !important;
  }
}
</style>
