import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const serviceKey = '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';
  
  const targetUrl = 'https://apis.data.go.kr/B551504/ipaShipEtryptTkoff/getShipEtryptTkoffSttemnt';

  try {
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      _type: 'json',
      numOfRows: '50',
      pageNo: String(query.pageNo || 1),
    });

    const response = await fetch(`${targetUrl}?${params.toString()}`, {
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
      // JSON 파싱 실패 시 (XML 응답 또는 공공데이터 오류 응답 처리)
      console.warn("Public API returned non-JSON text", text.slice(0, 200));
      return { success: false, isFallback: true, message: "API Response format fallback", raw: text };
    }

    return {
      success: true,
      data: data
    };
  } catch (error: any) {
    console.error("Failed to fetch public ship API:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
});
