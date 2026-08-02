export interface SendblueConfig {
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
  mockMode: boolean;
}

export interface SendSmsResult {
  messageId: string;
  status: 'sent' | 'mock' | 'failed';
  to: string;
  body: string;
  error?: string;
}

export function getSendblueConfig(): SendblueConfig {
  const apiKey = process.env.SENDBLUE_API_KEY;
  const apiSecret = process.env.SENDBLUE_API_SECRET;
  const fromNumber = process.env.SENDBLUE_FROM_NUMBER;
  const mockMode = !apiKey || process.env.SGOS_MOCK_SMS === 'true';

  return { apiKey, apiSecret, fromNumber, mockMode };
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const config = getSendblueConfig();

  if (config.mockMode) {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[SGOS Mock SMS] → ${to}\n${body}`);
    return { messageId, status: 'mock', to, body };
  }

  try {
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret ?? ''}`).toString('base64');
    const res = await fetch('https://api.sendblue.co/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        number: to,
        content: body,
        from_number: config.fromNumber,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        messageId: '',
        status: 'failed',
        to,
        body,
        error: errText || res.statusText,
      };
    }

    const data = (await res.json()) as { message_handle?: string; status?: string };
    return {
      messageId: data.message_handle ?? `sb_${Date.now()}`,
      status: 'sent',
      to,
      body,
    };
  } catch (e) {
    return {
      messageId: '',
      status: 'failed',
      to,
      body,
      error: String(e),
    };
  }
}
