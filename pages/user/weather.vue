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

// 인천항 현재 날씨 데이터
const currentWeather = ref({
  temp: 26.4,
  maxTemp: 29.0,
  minTemp: 22.5,
  sky: '맑음' as '맑음' | '구름많음' | '흐림' | '비' | '눈',
  icon: 'wb_sunny',
  rainPop: 10, // 강수확률 (%)
  rainfall: '0.0 mm',
  humidity: 68, // 습도 (%)
  windSpeed: 4.2, // m/s
  windKnots: 8.1, // Knots (4.2 * 1.94)
  windDirection: '남서풍 (SW)',
  waveHeight: '0.6 m', // 해상 파고 (m)
  waveStatus: '잔잔함 (안전)'
});

// 시간대별 예보 목록 (파고 m 추가)
const hourlyForecasts = ref<HourlyForecast[]>([
  { time: '18:00', temp: 26, sky: '맑음', icon: 'wb_sunny', pop: 10, windSpeed: 4.2, windKnots: 8.1, waveHeight: '0.5 m' },
  { time: '21:00', temp: 24, sky: '맑음', icon: 'nights_stay', pop: 10, windSpeed: 3.8, windKnots: 7.4, waveHeight: '0.5 m' },
  { time: '00:00', temp: 23, sky: '구름많음', icon: 'cloud', pop: 20, windSpeed: 3.5, windKnots: 6.8, waveHeight: '0.6 m' },
  { time: '03:00', temp: 22, sky: '구름많음', icon: 'cloud', pop: 20, windSpeed: 3.1, windKnots: 6.0, waveHeight: '0.6 m' },
  { time: '06:00', temp: 23, sky: '맑음', icon: 'wb_sunny', pop: 10, windSpeed: 3.6, windKnots: 7.0, waveHeight: '0.7 m' },
  { time: '09:00', temp: 26, sky: '맑음', icon: 'wb_sunny', pop: 10, windSpeed: 4.5, windKnots: 8.7, waveHeight: '0.8 m' },
  { time: '12:00', temp: 28, sky: '구름많음', icon: 'wb_cloudy', pop: 30, windSpeed: 5.2, windKnots: 10.1, waveHeight: '1.0 m' },
  { time: '15:00', temp: 29, sky: '흐림', icon: 'cloud_queue', pop: 40, windSpeed: 5.8, windKnots: 11.3, waveHeight: '1.2 m' }
]);

// 기상청 API 데이터 호출
const fetchWeatherData = async () => {
  isLoading.value = true;
  try {
    const res: any = await $fetch('/api/weather');
    if (res && res.success && res.data) {
      const items = res.data?.response?.body?.items?.item || [];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((it: any) => {
          // T1H: 기온, REH: 습도, WSD: 풍속, PTY: 강수형태, WAV: 파고
          if (it.category === 'T1H') {
            currentWeather.value.temp = parseFloat(it.obsrValue);
          } else if (it.category === 'REH') {
            currentWeather.value.humidity = parseInt(it.obsrValue, 10);
          } else if (it.category === 'WSD') {
            const ms = parseFloat(it.obsrValue);
            currentWeather.value.windSpeed = ms;
            currentWeather.value.windKnots = parseFloat((ms * 1.94).toFixed(1));
          } else if (it.category === 'WAV') {
            const wav = parseFloat(it.obsrValue);
            if (!isNaN(wav) && wav > 0) {
              currentWeather.value.waveHeight = `${wav.toFixed(1)} m`;
            }
          } else if (it.category === 'PTY') {
            const pty = parseInt(it.obsrValue, 10);
            if (pty === 0) {
              currentWeather.value.sky = '맑음';
              currentWeather.value.icon = 'wb_sunny';
            } else if (pty === 1 || pty === 4) {
              currentWeather.value.sky = '비';
              currentWeather.value.icon = 'umbrella';
            } else if (pty === 2 || pty === 3) {
              currentWeather.value.sky = '눈';
              currentWeather.value.icon = 'ac_unit';
            }
          }
        });
      }
    }
  } catch (e: any) {
    console.warn("Public Weather API fetch error, using fallback weather:", e.message);
  } finally {
    isLoading.value = false;
    const now = new Date();
    lastUpdatedTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
};

onMounted(() => {
  fetchWeatherData();
});
</script>

<template>
  <div class="weather-page" style="padding: 1.6rem; color: #ffffff;">
    <!-- Page Title Card -->
    <div style="background: rgba(13, 30, 51, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.6rem; padding: 1.8rem; margin-bottom: 1.6rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <i class="material-icons" style="font-size: 2.4rem; color: #1ad1b1;">thunderstorm</i>
          <span style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.05rem;">인천항 해상 날씨 정보</span>
        </div>
        <button 
          style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #1ad1b1; border-radius: 0.8rem; padding: 0.6rem 1.2rem; font-size: 1.2rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; cursor: pointer;"
          @click="fetchWeatherData"
        >
          <i class="material-icons" style="font-size: 1.4rem;">refresh</i>
          <span>새로고침</span>
        </button>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; flex-wrap: wrap; gap: 0.6rem;">
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.6); margin-bottom: 0;">
          기상청 단기예보 연동 인천 항운/해상 맞춤 기상 예보 (NX:54, NY:124)
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
</style>
