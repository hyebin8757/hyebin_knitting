<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { definePageMeta } from '~/.nuxt/imports';

interface HourlyForecast {
  time: string;
  temp: number;
  sky: '맑음' | '구름많음' | '흐림' | '비' | '눈';
  icon: string;
  pop: number; // 강수확률 (%)
  windSpeed: number; // m/s
  windKnots: number; // Knots
  waveHeight: string; // 파고 (m)
}

definePageMeta({
  layout: 'user-layout'
});

const isLoading = ref(false);
const lastUpdatedTime = ref<string>('');

// 시간대별 예보 목록 (Open-Meteo 로딩 후 채워짐)
const hourlyForecasts = ref<HourlyForecast[]>([]);

// 인천항 연안부두 실시간 현재 날씨 데이터 (Open-Meteo 실시간 초기화)
const currentWeather = ref({
  temp: 0,
  maxTemp: 0,
  minTemp: 0,
  sky: '구름많음' as '맑음' | '구름많음' | '흐림' | '비' | '눈',
  icon: 'cloud',
  rainPop: 0, // 강수확률 (%)
  rainfall: '0.0 mm',
  humidity: 0,
  windSpeed: 0,
  windKnots: 0,
  windDirection: '데이터 로딩중...',
  waveHeight: '- m',
  waveStatus: '데이터 로딩중...'
});

// 기상 특보 및 결항 위험 조건 감지 (풍속 27kts 이상 또는 파고 2m 이상)
const isWeatherWarning = computed(() => {
  const wavNum = parseFloat(currentWeather.value.waveHeight.replace('m', '').trim());
  return currentWeather.value.windKnots >= 27 || (!isNaN(wavNum) && wavNum >= 2.0);
});

// WMO weather code → 한글 날씨 + 아이콘 매핑
const parseWmoCode = (code: number): { sky: '맑음' | '구름많음' | '흐림' | '비' | '눈'; icon: string } => {
  if (code === 0) return { sky: '맑음', icon: 'wb_sunny' };
  if (code <= 2) return { sky: '구름많음', icon: 'cloud' };
  if (code === 3) return { sky: '흐림', icon: 'cloud_queue' };
  if (code <= 49) return { sky: '구름많음', icon: 'cloud' }; // fog/mist
  if (code <= 67) return { sky: '비', icon: 'umbrella' };
  if (code <= 77) return { sky: '눈', icon: 'ac_unit' };
  if (code <= 82) return { sky: '비', icon: 'umbrella' };
  if (code <= 86) return { sky: '눈', icon: 'ac_unit' };
  return { sky: '비', icon: 'thunderstorm' };
};

// 풍향각도 → 한글 풍향 변환
const degToWindDir = (deg: number): string => {
  const dirs = ['북풍 (N)', '북동풍 (NE)', '동풍 (E)', '남동풍 (SE)', '남풍 (S)', '남서풍 (SW)', '서풍 (W)', '북서풍 (NW)'];
  return dirs[Math.round(deg / 45) % 8];
};

// ✅ Open-Meteo 실시간 날씨 API (브라우저 직접 호출 - Netlify 완벽 호환)
// 인천항 연안여객터미널 위도/경도: 37.4736, 126.6194
const fetchWeatherData = async () => {
  isLoading.value = true;
  try {
    // 1. 현재 날씨 + 시간별 예보 (기온, 습도, 풍속, 풍향, 강수확률, 날씨코드)
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.4736&longitude=126.6194&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=2&timezone=Asia%2FSeoul&wind_speed_unit=ms';

    // 2. 해상 파고 데이터 (Open-Meteo Marine API)
    const marineUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=37.47&longitude=126.62&current=wave_height&hourly=wave_height&forecast_days=1&timezone=Asia%2FSeoul';

    const [weatherRes, marineRes] = await Promise.allSettled([
      fetch(weatherUrl).then(r => r.json()),
      fetch(marineUrl).then(r => r.json())
    ]);

    // --- 현재 날씨 파싱 ---
    if (weatherRes.status === 'fulfilled') {
      const w = weatherRes.value;
      const cur = w.current;
      const daily = w.daily;

      const temp = cur.temperature_2m ?? 0;
      const humidity = cur.relative_humidity_2m ?? 0;
      const windMs = cur.wind_speed_10m ?? 0; // m/s
      const windDeg = cur.wind_direction_10m ?? 0;
      const wmoCode = cur.weather_code ?? 0;
      const { sky, icon } = parseWmoCode(wmoCode);

      currentWeather.value.temp = Math.round(temp * 10) / 10;
      currentWeather.value.humidity = humidity;
      currentWeather.value.windSpeed = Math.round(windMs * 10) / 10;
      currentWeather.value.windKnots = Math.round(windMs * 1.94 * 10) / 10;
      currentWeather.value.windDirection = degToWindDir(windDeg);
      currentWeather.value.sky = sky;
      currentWeather.value.icon = icon;

      // 오늘 최고/최저 기온
      if (daily?.temperature_2m_max?.[0] != null) {
        currentWeather.value.maxTemp = Math.round(daily.temperature_2m_max[0]);
      }
      if (daily?.temperature_2m_min?.[0] != null) {
        currentWeather.value.minTemp = Math.round(daily.temperature_2m_min[0]);
      }
      if (daily?.precipitation_probability_max?.[0] != null) {
        currentWeather.value.rainPop = daily.precipitation_probability_max[0];
      }

      // 시간별 예보 동적 생성
      if (w.hourly) {
        const times: string[] = w.hourly.time ?? [];
        const temps: number[] = w.hourly.temperature_2m ?? [];
        const codes: number[] = w.hourly.weather_code ?? [];
        const winds: number[] = w.hourly.wind_speed_10m ?? [];
        const pops: number[] = w.hourly.precipitation_probability ?? [];
        const now = new Date();
        const nowHour = now.getFullYear() * 1000000 + (now.getMonth()+1) * 10000 + now.getDate() * 100 + now.getHours();

        const parsed: HourlyForecast[] = [];
        for (let i = 0; i < times.length && parsed.length < 8; i++) {
          const t = new Date(times[i]);
          const tKey = t.getFullYear() * 1000000 + (t.getMonth()+1) * 10000 + t.getDate() * 100 + t.getHours();
          if (tKey < nowHour) continue;
          const isTomorrow = t.getDate() !== now.getDate();
          const { sky: fSky, icon: fIcon } = parseWmoCode(codes[i] ?? 0);
          const fWindMs = winds[i] ?? 0;
          parsed.push({
            time: `${isTomorrow ? '내일 ' : '오늘 '}${String(t.getHours()).padStart(2, '0')}:00`,
            temp: Math.round(temps[i] ?? 0),
            sky: fSky,
            icon: fIcon,
            pop: pops[i] ?? 0,
            windSpeed: Math.round(fWindMs * 10) / 10,
            windKnots: Math.round(fWindMs * 1.94 * 10) / 10,
            waveHeight: '- m'
          });
        }
        if (parsed.length > 0) hourlyForecasts.value = parsed;
      }
    }

    // --- 해상 파고 파싱 ---
    if (marineRes.status === 'fulfilled') {
      const m = marineRes.value;
      const waveM = m.current?.wave_height ?? null;
      if (waveM != null) {
        const wv = Math.round(waveM * 10) / 10;
        currentWeather.value.waveHeight = `${wv.toFixed(1)} m`;
        if (wv < 0.5) currentWeather.value.waveStatus = '잔잔함 (안전)';
        else if (wv < 1.0) currentWeather.value.waveStatus = '약간 있음 (주의)';
        else if (wv < 2.0) currentWeather.value.waveStatus = '보통 (주의)';
        else currentWeather.value.waveStatus = '높음 ⚠️ (결항 위험)';

        // 시간별 예보에 파고 주입
        const hTimes: string[] = m.hourly?.time ?? [];
        const hWaves: number[] = m.hourly?.wave_height ?? [];
        hourlyForecasts.value = hourlyForecasts.value.map(fc => {
          const matchIdx = hTimes.findIndex(t => fc.time.includes(new Date(t).getHours().toString().padStart(2, '0') + ':00'));
          if (matchIdx >= 0 && hWaves[matchIdx] != null) {
            return { ...fc, waveHeight: `${(Math.round(hWaves[matchIdx] * 10) / 10).toFixed(1)} m` };
          }
          return fc;
        });
      }
    }

  } catch (e: any) {
    console.warn('Open-Meteo API 호출 실패:', e.message);
  } finally {
    isLoading.value = false;
    const now = new Date();
    lastUpdatedTime.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  }
};

// 새로고침 연속 클릭 방지 및 알림 토스트 상태
const isRefreshing = ref(false);
const showRefreshToast = ref(false);

const handleManualRefresh = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;

  await fetchWeatherData();

  showRefreshToast.value = true;

  setTimeout(() => {
    showRefreshToast.value = false;
    isRefreshing.value = false;
  }, 2500);
};

onMounted(() => {
  fetchWeatherData();
});

</script>

<template>
  <div class="weather-page" style="padding: 1.6rem; color: #ffffff;">
    <!-- 🚨 Weather Warning Alert Banner (1번 기능) -->
    <div 
      v-if="isWeatherWarning" 
      style="background: rgba(224, 87, 128, 0.15); border: 1px solid rgba(224, 87, 128, 0.4); border-radius: 1.2rem; padding: 1.2rem 1.6rem; margin-bottom: 1.6rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;"
    >
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <i class="material-icons" style="color: #e05780; font-size: 2.4rem;">warning</i>
        <div>
          <strong style="font-size: 1.35rem; color: #e05780; display: block;">⚠️ 인천항 해상 풍랑 특보 / 여객선 결항 주의</strong>
          <span style="font-size: 1.15rem; color: rgba(255,255,255,0.8);">현재 백령·연평도 여객선 항로 풍속 27kts 이상 및 높은 파고로 인한 결항 가능성이 높습니다.</span>
        </div>
      </div>
      <span style="font-size: 1.1rem; color: #e05780; background: rgba(224, 87, 128, 0.2); padding: 0.3rem 0.8rem; border-radius: 0.6rem; font-weight: 700;">특보 발효중</span>
    </div>
    <!-- Page Title Card -->
    <div style="background: rgba(13, 30, 51, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; padding: 1.8rem; margin-bottom: 1.6rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons" style="font-size: 2.4rem; color: #1ad1b1;">thunderstorm</i>
          <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.05rem;">인천항 해상 날씨 정보</span>
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
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-bottom: 0;">
          Open-Meteo 실시간 연동 · 인천항 연안부두 (위도 37.47 / 경도 126.62)
        </p>
        <span v-if="lastUpdatedTime" style="font-size: 1.1rem; color: rgba(255,255,255,0.4);">
          최종 갱신: {{ lastUpdatedTime }}
        </span>
      </div>
    </div>

    <!-- Main Current Weather Hero Card -->
    <div style="background: linear-gradient(135deg, #0c2340 0%, #0d1e33 100%); border: 1px solid rgba(26, 209, 177, 0.3); border-radius: 1.8rem; padding: 2rem; margin-bottom: 1.6rem; box-shadow: 0 10px 30px rgba(0,0,0,0.4); position: relative; overflow: hidden;">
      <div style="position: absolute; right: -20px; top: -20px; opacity: 0.1; pointer-events: none;">
        <i class="material-icons" style="font-size: 18rem; color: #1ad1b1;">{{ currentWeather.icon }}</i>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.6rem;">
        <div>
          <span style="font-size: 1.3rem; color: #88c5ff; font-weight: 700; background: rgba(136, 197, 255, 0.15); padding: 0.4rem 1rem; border-radius: 2rem; border: 1px solid rgba(136, 197, 255, 0.3);">
            인천항 연안 부두
          </span>
          <h2 style="font-size: 3.6rem; font-weight: 900; color: #ffffff; margin-top: 1.2rem; margin-bottom: 0; line-height: 1;">
            {{ currentWeather.temp }}°C
          </h2>
        </div>
        <div style="text-align: right;">
          <i class="material-icons" style="font-size: 5rem; color: #ffcc00;">{{ currentWeather.icon }}</i>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 0.4rem;">
            {{ currentWeather.sky }}
          </div>
          <div style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem;">
            최고 {{ currentWeather.maxTemp }}° / 최저 {{ currentWeather.minTemp }}°
          </div>
        </div>
      </div>

      <!-- Maritime Specific Metrics Grid (모바일 360px 깨짐 방지 레이아웃) -->
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.6rem;">
        <!-- Top Row: Wind Speed & Wave Height (2열) -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <!-- Wind Speed & Knots -->
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.2rem; padding: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; color: rgba(255,255,255,0.7); white-space: nowrap;">
              <i class="material-icons" style="color: #88c5ff; font-size: 1.8rem;">air</i>
              <span>해상 풍속</span>
            </div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #88c5ff; margin-top: 0.6rem; white-space: nowrap;">
              {{ currentWeather.windSpeed }} m/s
            </div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #1ad1b1; margin-top: 0.2rem; white-space: nowrap;">
              ⚡ {{ currentWeather.windKnots }} kts
            </div>
          </div>

          <!-- Wave Height (파고 m) -->
          <div style="background: rgba(35, 102, 180, 0.25); border: 1px solid rgba(136, 197, 255, 0.35); border-radius: 1.2rem; padding: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; color: #88c5ff; white-space: nowrap;">
              <i class="material-icons" style="color: #1ad1b1; font-size: 1.8rem;">waves</i>
              <span>해상 파고</span>
            </div>
            <div style="font-size: 2.1rem; font-weight: 900; color: #1ad1b1; margin-top: 0.4rem; white-space: nowrap;">
              {{ currentWeather.waveHeight }}
            </div>
            <div style="font-size: 1.15rem; font-weight: 700; color: rgba(255,255,255,0.8); margin-top: 0.2rem; white-space: nowrap;">
              🌊 {{ currentWeather.waveStatus }}
            </div>
          </div>
        </div>

        <!-- Bottom Row: Humidity & Rain POP -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.2rem; padding: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; color: rgba(255,255,255,0.7); white-space: nowrap;">
              <i class="material-icons" style="color: #3a86ff; font-size: 1.8rem;">water_drop</i>
              <span>습도</span>
            </div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin-top: 0.4rem; white-space: nowrap;">
              {{ currentWeather.humidity }}%
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.2rem; padding: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; color: rgba(255,255,255,0.7); white-space: nowrap;">
              <i class="material-icons" style="color: #e05780; font-size: 1.8rem;">umbrella</i>
              <span>강수확률</span>
            </div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #e05780; margin-top: 0.4rem; white-space: nowrap;">
              {{ currentWeather.rainPop }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hourly Forecast Horizontal Scroll List (시간대별 기상 예보 카드) -->
    <div style="background: #0d1e33; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.6rem; padding: 1.6rem;">
      <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem;">
        <i class="material-icons" style="color: #ffcc00; font-size: 2rem;">schedule</i>
        <span style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">시간대별 예보 (기온/풍속 Knots/파고)</span>
      </div>

      <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.8rem; scrollbar-width: thin;">
        <div
          v-for="item in hourlyForecasts"
          :key="item.time"
          style="min-width: 105px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.2rem; padding: 1.2rem 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 0.6rem;"
        >
          <span style="font-size: 1.2rem; color: rgba(255,255,255,0.6); font-weight: 600;">{{ item.time }}</span>
          <i class="material-icons" style="font-size: 2.8rem; color: #ffcc00;">{{ item.icon }}</i>
          <span style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">{{ item.temp }}°</span>
          <div style="font-size: 1.1rem; color: #1ad1b1; font-weight: 700; background: rgba(26, 209, 177, 0.1); padding: 0.2rem 0.6rem; border-radius: 0.4rem;">
            ⚡ {{ item.windKnots }} kts
          </div>
          <div style="font-size: 1.1rem; color: #88c5ff; font-weight: 700;">
            🌊 {{ item.waveHeight }}
          </div>
          <span style="font-size: 1.05rem; color: rgba(255,255,255,0.4);">☔ {{ item.pop }}%</span>
        </div>
      </div>
    </div>
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
        <span>인천항 실시간 날씨 정보가 최신 데이터로 갱신되었습니다.</span>
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
/* 가로 스크롤바 커스텀 */
div::-webkit-scrollbar {
  height: 6px;
}
div::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
div::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #1ad1b1 !important;
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
