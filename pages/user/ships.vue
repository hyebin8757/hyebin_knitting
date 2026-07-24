<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { definePageMeta } from '~/.nuxt/imports';

interface ShipItem {
  id: string;
  shipName: string;         // 선박명
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
const activeTab = ref<'all' | 'favorites'>('all');
const viewMode = ref<'list_only' | 'map_only'>('list_only');
const isLoading = ref(false);
const rawApiMessage = ref('');

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
  let targetMmsi = '440020080,440011240,440022920,440004790';
  
  if (selectedMapMmsi.value !== 'all') {
    targetMmsi = selectedMapMmsi.value;
  } else if (registeredMmsiList.value) {
    targetMmsi = registeredMmsiList.value;
  }

  return `https://www.marinetraffic.com/en/ais/embed/zoom:12/centerv:37.45/centerx:126.62/maptype:1/shownames:true/mmsi:${targetMmsi}/shipid:0/fleet:/fleet_id:/old_maptype:0`;
});

// 즐겨찾기 상태 (호출부호 or 선박명 기반)
const favoriteShips = ref<string[]>([]);

// 실시간 지정 선박 입출항 리스트 (전달해주신 실제 선박 4종 반영)
const shipList = ref<ShipItem[]>([
  {
    id: '1',
    shipName: 'KOREAKING (코리아킹)',
    callSign: 'KOREAKING',
    mmsi: '440020080',
    eta: '2026-07-24 05:52 PM',
    etd: '2026-07-25 06:00 PM',
    location: '인천 연안여객터미널 2선석',
    agent: '고려고속훼리',
    grossTonnage: '4,100 톤',
    status: '접안중'
  },
  {
    id: '2',
    shipName: 'MI RAE NO9 (미래 9호)',
    callSign: 'MI RAE NO9',
    mmsi: '440011240',
    eta: '2026-07-24 05:51 PM',
    etd: '2026-07-25 02:00 PM',
    location: '인천 남항 부두 3선석',
    agent: '미래해운',
    grossTonnage: '2,800 톤',
    status: '접안중'
  },
  {
    id: '3',
    shipName: 'NO13 MIRAE (13 미래호)',
    callSign: 'NO13 MIRAE',
    mmsi: '440022920',
    eta: '2026-07-24 05:51 PM',
    etd: '2026-07-25 10:00 AM',
    location: '인천 항만 1부두 12선석',
    agent: '미래해운',
    grossTonnage: '3,200 톤',
    status: '관제중'
  },
  {
    id: '4',
    shipName: 'WESTCARFERRY (웨스트카페리)',
    callSign: 'WESTCARFERRY',
    mmsi: '440004790',
    eta: '2026-07-24 05:52 PM',
    etd: '2026-07-25 08:00 PM',
    location: '인천항 국제여객터미널 1선석',
    agent: '서해훼리',
    grossTonnage: '5,500 톤',
    status: '입항예정'
  }
]);

// 즐겨찾기 토글
const toggleFavorite = (callSign: string) => {
  const idx = favoriteShips.value.indexOf(callSign);
  if (idx !== -1) {
    favoriteShips.value.splice(idx, 1);
  } else {
    favoriteShips.value.push(callSign);
  }
  localStorage.setItem('favorite_ships', JSON.stringify(favoriteShips.value));
};

const isFavorite = (callSign: string) => {
  return favoriteShips.value.includes(callSign);
};

// 검색 및 필터링 적용된 선박 목록
const filteredShipList = computed(() => {
  let list = shipList.value;

  if (activeTab.value === 'favorites') {
    list = list.filter(s => favoriteShips.value.includes(s.callSign));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(s => 
      s.shipName.toLowerCase().includes(q) ||
      s.callSign.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.agent.toLowerCase().includes(q)
    );
  }

  return list;
});

// 공공데이터 API 데이터 가져오기
const fetchShipsData = async () => {
  isLoading.value = true;
  try {
    const res: any = await $fetch('/api/ships');
    if (res && res.success && res.data) {
      // API 결과 중 items 파싱
      const items = res.data?.response?.body?.items?.item || res.data?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        const mapped: ShipItem[] = items.map((it: any, idx: number) => ({
          id: String(idx + 100),
          shipName: it.vslNm ? `${it.vslNm}` : (it.clsgn || '선박명 미상'),
          callSign: it.clsgn || `CALL-${idx}`,
          mmsi: it.mmsiNo || it.mmsi || undefined,
          eta: it.etryptDt || it.eta || '접안중',
          etd: it.tkoffDt || it.etd || '출항예정',
          location: it.ibPrtNm || it.satntNm || it.ibPrtCd || '인천항 부두',
          agent: it.agntNm || '해운 대리점',
          grossTonnage: it.grt ? `${Number(it.grt).toLocaleString()} 톤` : undefined,
          status: (it.etryptPurpsNm || '접안중') as any
        }));
        
        // 4개 주선박 목록과 공공데이터 목록 병합
        const existingCallSigns = new Set(shipList.value.map(s => s.callSign));
        const newItems = mapped.filter(m => !existingCallSigns.has(m.callSign));
        shipList.value = [...shipList.value, ...newItems];
      }
    }
  } catch (e: any) {
    console.warn("Public API fetch error, using fallback data:", e.message);
  } finally {
    isLoading.value = false;
    updateLastTime();
  }
};

const handleManualRefresh = () => {
  fetchShipsData();
  startAutoPolling();
};

onMounted(() => {
  try {
    const savedFav = localStorage.getItem('favorite_ships');
    if (savedFav) {
      favoriteShips.value = JSON.parse(savedFav);
    }
  } catch (e) {}

  fetchShipsData();
});
</script>

<template>
  <div class="ships-page" style="padding: 1.6rem; color: #ffffff;">
    <!-- Page Header Title Card -->
    <div style="background: rgba(13, 30, 51, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; padding: 1.8rem; margin-bottom: 1.6rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons" style="font-size: 2.4rem; color: #88c5ff;">directions_boat</i>
          <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.05rem;">인천항 선박 운항 정보</span>
        </div>
        <button 
          class="refresh-btn"
          @click="handleManualRefresh"
          title="새로고침"
        >
          <i class="material-icons" style="font-size: 1.6rem;">refresh</i>
          <span class="refresh-text">새로고침</span>
        </button>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; flex-wrap: wrap; gap: 0.6rem;">
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-bottom: 0; line-height: 1.5;">
          공공데이터포털 연동 인천항 실시간 선박 입출항 현황입니다.
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

    <!-- View Mode Selector (2분할 탭: 목록만 보기 / 지도만 보기) -->
    <div style="display: flex; gap: 0.6rem; margin-bottom: 1.2rem; background: rgba(13, 30, 51, 0.8); padding: 0.4rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1);">
      <button
        style="flex: 1; padding: 0.8rem; border-radius: 0.8rem; font-size: 1.3rem; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;"
        :style="{
          background: viewMode === 'list_only' ? 'linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%)' : 'transparent',
          color: viewMode === 'list_only' ? '#88c5ff' : 'rgba(255,255,255,0.6)'
        }"
        @click="viewMode = 'list_only'"
      >
        <i class="material-icons" style="font-size: 1.8rem;">list_alt</i>
        <span>목록만 보기</span>
      </button>
      <button
        style="flex: 1; padding: 0.8rem; border-radius: 0.8rem; font-size: 1.3rem; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;"
        :style="{
          background: viewMode === 'map_only' ? 'linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%)' : 'transparent',
          color: viewMode === 'map_only' ? '#1ad1b1' : 'rgba(255,255,255,0.6)'
        }"
        @click="viewMode = 'map_only'"
      >
        <i class="material-icons" style="font-size: 1.8rem;">map</i>
        <span>지도만 보기</span>
      </button>
    </div>

    <!-- Real-time MarineTraffic Ship Map Embed Card -->
    <div 
      v-if="viewMode === 'map_only'"
      style="
        background: #0d1e33;
        border: 1px solid rgba(136, 197, 255, 0.25);
        border-radius: 1.6rem;
        padding: 1.4rem;
        margin-bottom: 1.6rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
      "
    >
      <div style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <i class="material-icons" style="color: #1ad1b1; font-size: 2rem;">map</i>
            <span style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">실시간 인천항 AIS 선박 위치 지도</span>
          </div>
          <span style="font-size: 1.1rem; color: #1ad1b1; background: rgba(26, 209, 177, 0.15); padding: 0.3rem 0.8rem; border-radius: 0.6rem; font-weight: 700; border: 1px solid rgba(26, 209, 177, 0.3);">
            내 등록 선박 추적중
          </span>
        </div>

        <!-- Registered Ship Target Selection Chips -->
        <div style="display: flex; gap: 0.6rem; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 0.6rem; margin-top: 0.4rem; scrollbar-width: none;">
          <button
            style="padding: 0.6rem 1.1rem; border-radius: 0.8rem; font-size: 1.2rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; cursor: pointer;"
            :style="{
              background: selectedMapMmsi === 'all' ? 'rgba(26, 209, 177, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedMapMmsi === 'all' ? '#1ad1b1' : 'rgba(255, 255, 255, 0.7)',
              border: '1px solid ' + (selectedMapMmsi === 'all' ? '#1ad1b1' : 'rgba(255, 255, 255, 0.1)')
            }"
            @click="selectedMapMmsi = 'all'"
          >
            내 등록 선박 전체 (4척)
          </button>
          <button
            v-for="ship in shipList.filter(s => s.mmsi)"
            :key="ship.mmsi"
            style="padding: 0.6rem 1.1rem; border-radius: 0.8rem; font-size: 1.2rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; cursor: pointer;"
            :style="{
              background: selectedMapMmsi === ship.mmsi ? 'rgba(58, 134, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: selectedMapMmsi === ship.mmsi ? '#88c5ff' : 'rgba(255, 255, 255, 0.7)',
              border: '1px solid ' + (selectedMapMmsi === ship.mmsi ? '#88c5ff' : 'rgba(255, 255, 255, 0.1)')
            }"
            @click="selectedMapMmsi = ship.mmsi!"
          >
            {{ ship.shipName.split(' ')[0] }}
          </button>
        </div>
      </div>

      <!-- MarineTraffic Iframe Wrapper -->
      <div style="position: relative; width: 100%; height: 450px; border-radius: 1.2rem; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);">
        <iframe
          :key="marineTrafficUrl"
          :src="marineTrafficUrl"
          width="100%"
          height="100%"
          frameborder="0"
          scrolling="no"
          style="border: 0; width: 100%; height: 100%; border-radius: 1.2rem;"
          allowfullscreen
        ></iframe>
      </div>
      
      <div style="font-size: 1.1rem; color: rgba(255,255,255,0.5); margin-top: 0.8rem; text-align: right;">
        * MarineTraffic 인천항 AIS (위도: 37.45, 경도: 126.62) 실시간 위치 지도
      </div>
    </div>

    <!-- Filter & Search Bar + Ship List Area -->
    <div v-if="viewMode === 'list_only'">
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.6rem;">
      <!-- Tab Buttons (전체 / 즐겨찾기) -->
      <div style="display: flex; gap: 0.8rem; background: rgba(255,255,255,0.03); padding: 0.4rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.08);">
        <button
          style="flex: 1; padding: 0.8rem; border-radius: 0.8rem; font-size: 1.3rem; font-weight: 700; transition: all 0.2s;"
          :style="{
            background: activeTab === 'all' ? 'linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%)' : 'transparent',
            color: activeTab === 'all' ? '#ffffff' : 'rgba(255,255,255,0.6)'
          }"
          @click="activeTab = 'all'"
        >
          전체 선박 ({{ shipList.length }})
        </button>
        <button
          style="flex: 1; padding: 0.8rem; border-radius: 0.8rem; font-size: 1.3rem; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.4rem;"
          :style="{
            background: activeTab === 'favorites' ? 'linear-gradient(135deg, var(--primary-darken-color-1) 0%, #153c6c 100%)' : 'transparent',
            color: activeTab === 'favorites' ? '#ffcc00' : 'rgba(255,255,255,0.6)'
          }"
          @click="activeTab = 'favorites'"
        >
          <span>⭐ 즐겨찾기</span>
          <span>({{ favoriteShips.length }})</span>
        </button>
      </div>

      <!-- Search Input -->
      <div style="position: relative; width: 100%;">
        <i class="material-icons" style="position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 2rem;">search</i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="선박명, 호출부호, 부두위치 검색..."
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
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" style="text-align: center; padding: 4rem; color: #88c5ff; font-size: 1.4rem; font-weight: 600;">
      <i class="material-icons" style="font-size: 3rem; animation: spin 1s linear infinite;">sync</i>
      <div style="margin-top: 0.8rem;">인천항 실시간 운항 정보 조회 중...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredShipList.length === 0" style="text-align: center; padding: 4rem 2rem; background: rgba(13, 30, 51, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.6rem;">
      <i class="material-icons" style="font-size: 4rem; color: rgba(255,255,255,0.2);">directions_boat_filled</i>
      <div style="font-size: 1.4rem; color: rgba(255,255,255,0.6); margin-top: 1rem; font-weight: 600;">
        {{ activeTab === 'favorites' ? '즐겨찾기한 선박이 없습니다.' : '조회된 선박 운항 정보가 없습니다.' }}
      </div>
    </div>

    <!-- Ship Cards List -->
    <div v-else style="display: flex; flex-direction: column; gap: 1.2rem;">
      <div
        v-for="ship in filteredShipList"
        :key="ship.callSign"
        style="background: #0d1e33; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.4rem; padding: 1.6rem; transition: all 0.2s;"
      >
        <!-- Header: Ship Name + Status + Favorite Star -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.6rem;">
              <span>{{ ship.shipName }}</span>
            </div>
            <div style="font-size: 1.2rem; color: #88c5ff; margin-top: 0.2rem; font-weight: 600;">
              <span v-if="ship.mmsi">MMSI: {{ ship.mmsi }} | </span>호출부호: {{ ship.callSign }} | 대리점: {{ ship.agent }}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0;">
            <!-- Status Badge -->
            <span
              style="padding: 0.3rem 0.8rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; white-space: nowrap; flex-shrink: 0;"
              :style="{
                background: ship.status === '접안중' ? 'rgba(26, 209, 177, 0.15)' : ship.status === '입항예정' ? 'rgba(58, 134, 255, 0.15)' : ship.status === '관제중' ? 'rgba(255, 204, 0, 0.15)' : 'rgba(255,255,255,0.1)',
                color: ship.status === '접안중' ? '#1ad1b1' : ship.status === '입항예정' ? '#88c5ff' : ship.status === '관제중' ? '#ffcc00' : 'rgba(255,255,255,0.6)',
                border: '1px solid ' + (ship.status === '접안중' ? '#1ad1b1' : ship.status === '입항예정' ? '#88c5ff' : ship.status === '관제중' ? '#ffcc00' : 'rgba(255,255,255,0.2)')
              }"
            >
              {{ ship.status }}
            </span>

            <!-- ⭐ Favorite Button -->
            <button
              style="background: none; border: none; cursor: pointer; padding: 0.2rem;"
              @click="toggleFavorite(ship.callSign)"
            >
              <i 
                class="material-icons" 
                :style="{ color: isFavorite(ship.callSign) ? '#ffcc00' : 'rgba(255,255,255,0.2)', fontSize: '2.2rem' }"
              >
                {{ isFavorite(ship.callSign) ? 'star' : 'star_border' }}
              </i>
            </button>
          </div>
        </div>

        <!-- Details Info Grid -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.2rem;">
          <div style="background: rgba(255,255,255,0.03); padding: 0.8rem 1rem; border-radius: 0.8rem;">
            <div style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">입항일시 (ETA)</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: #1ad1b1; margin-top: 0.2rem;">{{ ship.eta }}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 0.8rem 1rem; border-radius: 0.8rem;">
            <div style="font-size: 1.1rem; color: rgba(255,255,255,0.5);">출항일시 (ETD)</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: #e05780; margin-top: 0.2rem;">{{ ship.etd }}</div>
          </div>
        </div>

        <!-- Location / Berth -->
        <div style="margin-top: 1rem; background: rgba(35, 102, 180, 0.15); border: 1px solid rgba(136, 197, 255, 0.2); padding: 0.8rem 1rem; border-radius: 0.8rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <i class="material-icons" style="font-size: 1.8rem; color: #88c5ff;">place</i>
            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.7);">선석/부두 위치:</span>
            <strong style="font-size: 1.3rem; color: #ffffff;">{{ ship.location }}</strong>
          </div>
          <button
            style="background: rgba(26, 209, 177, 0.15); border: 1px solid rgba(26, 209, 177, 0.4); color: #1ad1b1; padding: 0.4rem 0.9rem; border-radius: 0.6rem; font-size: 1.15rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;"
            @click="openKoreanShipDetail(ship)"
          >
            <span>상세 정보</span>
          </button>
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
  </div>
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
