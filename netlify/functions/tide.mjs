/**
 * Netlify Function: /.netlify/functions/tide
 * 국립해양조사원 조석예보 API 프록시 (인천항 DT_0001)
 * https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService
 */
export const handler = async () => {
  const SERVICE_KEY = process.env.KMA_API_KEY || '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';

  // 인천항 조석관측소 코드
  const OBS_CODE = 'DT_0001';

  // 오늘 날짜 (KST)
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  const reqDate = `${yyyy}${mm}${dd}`;

  const baseUrl = 'https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService';

  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: '1',
    numOfRows: '100',
    dataType: 'JSON',
    obsCode: OBS_CODE,
    reqDate,
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: { Accept: 'application/json, text/plain, */*' },
    });

    const text = await response.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) {}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data,
        reqDate,
        obsCode: OBS_CODE,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
};
