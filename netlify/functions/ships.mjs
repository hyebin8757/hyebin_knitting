/**
 * Netlify Function: /.netlify/functions/ships
 * 인천항만공사/해양수산부 인천항 선박 입출항 신고 API 프록시
 * https://apis.data.go.kr/B551504/ipaShipEtryptTkoff/getShipEtryptTkoffSttemnt
 */
export const handler = async () => {
  const SERVICE_KEY = process.env.KMA_API_KEY || '8522336155cd0abd16545a726f3220de9735adc9ababdfc24c2972fbe66febc7';
  const baseUrl = 'https://apis.data.go.kr/B551504/ipaShipEtryptTkoff/getShipEtryptTkoffSttemnt';

  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: '1',
    numOfRows: '100',
    dataType: 'JSON'
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: { Accept: 'application/json, text/plain, */*' }
    });

    const text = await response.text();
    let data = null;
    try { data = JSON.parse(text); } catch (_) {}

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: String(err) })
    };
  }
};
