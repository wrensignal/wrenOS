import { privateKeyToAccount } from 'viem/accounts';

const DEFAULT_BASE_URL = 'https://speakeasy.ing';

export class SpeakeasyError extends Error {}
export class X402ChallengeParseError extends SpeakeasyError {}
export class X402SigningError extends SpeakeasyError {}
export class SpeakeasyHTTPError extends SpeakeasyError {
  constructor(status, body) {
    super(`Speakeasy request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

function parse402Challenge(res, body) {
  const fromBody = body?.x402 || body?.payment || body?.challenge || body?.paymentRequirements || body;
  const header = res.headers.get('x402-challenge') || res.headers.get('x-payment-challenge');
  const fromHeader = header ? safeJSON(header) : null;
  const challenge = fromBody?.typedData ? fromBody : fromHeader?.typedData ? fromHeader : null;
  if (!challenge?.typedData) {
    throw new X402ChallengeParseError('Missing typedData in 402 challenge payload');
  }
  return challenge;
}

function safeJSON(value) {
  try { return JSON.parse(value); } catch { return null; }
}

async function asJsonSafe(res) {
  const text = await res.text();
  return safeJSON(text) ?? { raw: text };
}

function toReplayHeaders(challenge, signed, address) {
  const proof = {
    challengeId: challenge.id || challenge.challengeId || null,
    typedData: challenge.typedData,
    signature: signed,
    address
  };
  const encoded = JSON.stringify(proof);
  return {
    'x402-payment': encoded,
    'x-payment': encoded,
    'x402-signature': signed,
    'x402-address': address
  };
}

class ChatCompletionStream {
  constructor(response) {
    this.response = response;
  }

  async *[Symbol.asyncIterator]() {
    const reader = this.response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part
          .split('\n')
          .find((l) => l.startsWith('data:'));
        if (!line) continue;
        const payload = line.replace(/^data:\s*/, '').trim();
        if (!payload || payload === '[DONE]') continue;
        yield safeJSON(payload) ?? { raw: payload };
      }
    }
  }
}

class ChatCompletionsAPI {
  constructor(client) {
    this.client = client;
  }

  async create(payload) {
    const { stream = false } = payload || {};
    const response = await this.client._requestWith402('/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (stream) return new ChatCompletionStream(response);
    return asJsonSafe(response);
  }
}

export class SpeakeasyClient {
  constructor({ privateKey, baseURL = DEFAULT_BASE_URL, fetchImpl } = {}) {
    if (!privateKey) throw new SpeakeasyError('privateKey is required');
    this.account = privateKeyToAccount(privateKey);
    this.baseURL = baseURL.replace(/\/$/, '');
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) throw new SpeakeasyError('No fetch implementation available');

    this.chat = { completions: new ChatCompletionsAPI(this) };
  }

  async _signChallenge(challenge) {
    try {
      const td = challenge.typedData;
      return await this.account.signTypedData({
        domain: td.domain,
        types: td.types,
        primaryType: td.primaryType,
        message: td.message
      });
    } catch (error) {
      throw new X402SigningError(`Failed to sign x402 challenge: ${error.message}`);
    }
  }

  async _requestWith402(path, init) {
    const url = `${this.baseURL}${path}`;
    let res = await this.fetch(url, init);

    if (res.status !== 402) {
      if (!res.ok) throw new SpeakeasyHTTPError(res.status, await asJsonSafe(res));
      return res;
    }

    const challengeBody = await asJsonSafe(res);
    const challenge = parse402Challenge(res, challengeBody);
    const signature = await this._signChallenge(challenge);
    const replayHeaders = toReplayHeaders(challenge, signature, this.account.address);

    res = await this.fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...replayHeaders
      }
    });

    if (!res.ok) throw new SpeakeasyHTTPError(res.status, await asJsonSafe(res));
    return res;
  }
}
