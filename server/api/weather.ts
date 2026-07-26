import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const serviceKey = '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';
  
  // 인천항 연안부두 기상청 격자 좌표 (NX=54, NY=124)
  const nx = '54';
  const ny = '124';

  const now = new Date();
  let calcDate = new Date(now);

  // base_time & base_date 계산 (기상청 초단기실황/예보 매시 30~45분 발표)
  let hour = now.getHours();
  if (now.getMinutes() < 45) {
    hour = hour - 1;
    if (hour < 0) {
      hour = 23;
      calcDate.setDate(calcDate.getDate() - 1);
    }
  }

  const yyyy = calcDate.getFullYear();
  const mm = String(calcDate.getMonth() + 1).padStart(2, '0');
  const dd = String(calcDate.getDate()).padStart(2, '0');
  const baseDate = `${yyyy}${mm}${dd}`;
  const baseTime = `${String(hour).padStart(2, '0')}00`;

  const baseUrlNcst = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
  const baseUrlFcst = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst';

  try {
    const paramsNcst = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: '1',
      numOfRows: '50',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: nx,
      ny: ny
    });

    const paramsFcst = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: '1',
      numOfRows: '60',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: nx,
      ny: ny
    });

    const [resNcst, resFcst] = await Promise.allSettled([
      fetch(`${baseUrlNcst}?${paramsNcst.toString()}`),
      fetch(`${baseUrlFcst}?${paramsFcst.toString()}`)
    ]);

    let ncstData: any = null;
    let fcstData: any = null;

    if (resNcst.status === 'fulfilled' && resNcst.value.ok) {
      const text = await resNcst.value.text();
      try { ncstData = JSON.parse(text); } catch (e) {}
    }

    if (resFcst.status === 'fulfilled' && resFcst.value.ok) {
      const text = await resFcst.value.text();
      try { fcstData = JSON.parse(text); } catch (e) {}
    }

    return {
      success: true,
      data: ncstData,
      fcstData: fcstData,
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
