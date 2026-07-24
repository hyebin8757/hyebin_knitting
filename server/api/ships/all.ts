import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const serviceKey = '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';
  const baseUrl = 'https://apis.data.go.kr/B551504/ipaShipEtryptTkoff/getShipEtryptTkoffSttemnt';

  try {
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: '1',
      numOfRows: '100',
      dataType: 'JSON'
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
      console.warn("Public API returned non-JSON response", text.slice(0, 200));
      return { success: false, isFallback: true, message: "Response format fallback", raw: text };
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
