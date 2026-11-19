export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false }) };
  }

  const url = process.env.SHEETS_URL;
  if (!url) {
    console.error('SHEETS_URL is not configured');
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: event.body
    });
    if (!response.ok) {
      console.error('Order endpoint returned status ' + response.status);
      return { statusCode: 502, body: JSON.stringify({ success: false }) };
    }
    const result = await response.json();
    if (result.success !== true) {
      console.error('Order endpoint did not confirm the save');
      return { statusCode: 502, body: JSON.stringify({ success: false }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Order endpoint request failed:', error);
    return { statusCode: 502, body: JSON.stringify({ success: false }) };
  }
}
