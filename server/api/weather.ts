import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const serviceKey = '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';
  
  // 인천항 기상청 격자 좌표
  const nx = '54';
  const ny = '124';

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const baseDate = `${yyyy}${mm}${dd}`;
  
  // base_time 계산 (초단기실황은 매시 30분 생성)
  let hour = now.getHours();
  if (now.getMinutes() < 40) {
    hour = hour - 1;
    if (hour < 0) hour = 23;
  }
  const baseTime = `${String(hour).padStart(2, '0')}00`;

  const baseUrl = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

  try {
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: '1',
      numOfRows: '50',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: nx,
      ny: ny
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const text = await response.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("Weather API returned non-JSON text", text.slice(0, 200));
      return { success: false, isFallback: true, message: "Weather API Response format fallback", raw: text };
    }

    return {
      success: true,
      data: data,
      baseDate,
      baseTime
    };
  } catch (error: any) {
    console.error("Failed to fetch public weather API:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
});
