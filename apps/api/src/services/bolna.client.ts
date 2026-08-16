type MakeCallParamsType = {
  recipientPhoneNumber: string;
  bolnaAgentId?: string;
  bolnaApiKey?: string;
};

type BolnaCallResponseType = {
  executionId: string;
  status: string;
};

export class BolnaConfigError extends Error {}

export class BolnaRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const assertBolnaConfigured = (
  apiKey: string | undefined,
  agentId: string | undefined,
): void => {
  if (apiKey === undefined || apiKey === '') {
    throw new BolnaConfigError('BOLNA_API_KEY is not set');
  }

  if (agentId === undefined || agentId === '') {
    throw new BolnaConfigError('BOLNA_AGENT_ID is not set');
  }
};

export const makeCall = async (
  params: MakeCallParamsType,
): Promise<BolnaCallResponseType> => {
  const bolnaBaseUrl = process.env['BOLNA_BASE_URL'] ?? 'https://api.bolna.ai';
  const bolnaApiKey = params.bolnaApiKey || process.env['BOLNA_API_KEY'];
  const bolnaAgentId = params.bolnaAgentId || process.env['BOLNA_AGENT_ID'];

  assertBolnaConfigured(bolnaApiKey, bolnaAgentId);

  const response = await fetch(`${bolnaBaseUrl}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bolnaApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: bolnaAgentId,
      recipient_phone_number: params.recipientPhoneNumber,
    }),
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new BolnaRequestError(
      'Bolna rejected the call request',
      response.status,
      body,
    );
  }

  const typedBody = body as { execution_id?: string; status?: string };

  if (typedBody.execution_id === undefined) {
    throw new BolnaRequestError(
      'Bolna response missing execution_id',
      response.status,
      body,
    );
  }

  return {
    executionId: typedBody.execution_id,
    status: typedBody.status ?? 'triggered',
  };
};
