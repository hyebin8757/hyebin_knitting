/**
 * Netlify Function: /api/weather
 * 기상청 초단기실황(getUltraSrtNcst) + 초단기예보(getUltraSrtFcst) 실시간 프록시
 * 인천항 연안부두 격자좌표: NX=55, NY=124
 */
export const handler = async () => {
  const SERVICE_KEY = process.env.KMA_API_KEY || '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';

  // 인천항 연안부두 정확 격자좌표 (NX=55, NY=124)
  const NX = '55';
  const NY = '124';

  // base_date / base_time 계산 (기상청 초단기실황/예보 매시 45분 발표)
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  let hour = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  const calcDate = new Date(kst.getTime());

  // 정시 기준 45분 이전이면 이전 시각 데이터 사용
  if (minute < 45) {
    hour = hour - 1;
    if (hour < 0) {
      hour = 23;
      calcDate.setUTCDate(calcDate.getUTCDate() - 1);
    }
  }

  const yyyy = calcDate.getUTCFullYear();
  const mm = String(calcDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(calcDate.getUTCDate()).padStart(2, '0');
  const baseDate = `${yyyy}${mm}${dd}`;
  const baseTime = `${String(hour).padStart(2, '0')}00`;

  const baseUrlNcst = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
  const baseUrlFcst = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst';

  const commonParams = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: '1',
    numOfRows: '60',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: NX,
    ny: NY,
  });

  try {
    const [resNcst, resFcst] = await Promise.allSettled([
      fetch(`${baseUrlNcst}?${commonParams.toString()}`).then(r => r.json()),
      fetch(`${baseUrlFcst}?${commonParams.toString()}`).then(r => r.json()),
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        baseDate,
        baseTime,
        ncst: resNcst.status === 'fulfilled' ? resNcst.value : null,
        fcst: resFcst.status === 'fulfilled' ? resFcst.value : null,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
};
