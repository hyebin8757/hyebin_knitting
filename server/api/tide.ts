import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const serviceKey = '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const reqDate = (query.date as string) || `${yyyy}${mm}${dd}`;

  // 국립해양조사원 조석예보 인천항 관측소 코드 (기본값 DT_0001)
  const obsCode = (query.obsCode as string) || 'DT_0001';

  const baseUrl = 'https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService';

  try {
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: '1',
      numOfRows: '100',
      dataType: 'JSON',
      obsCode: obsCode,
      reqDate: reqDate
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
      console.warn("Tide API returned non-JSON text", text.slice(0, 200));
      return { success: false, isFallback: true, message: "Tide API Non-JSON response", raw: text };
    }

    return {
      success: true,
      data: data,
      reqDate,
      obsCode
    };
  } catch (error: any) {
    console.error("Failed to fetch public Tide API:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
});
