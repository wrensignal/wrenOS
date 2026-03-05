import test from 'node:test';
import assert from 'node:assert/strict';
import { SpeakeasyClient } from '../src/index.mjs';

const PK = '0x59c6995e998f97a5a0044966f094538e8b4f9f347b0ce8b57f0c7a2f4c5e4f64';

function jsonResponse(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers }
  });
}

test('non-streaming completion success', async () => {
  const fetchImpl = async () => jsonResponse({ id: 'ok', choices: [] }, 200);
  const client = new SpeakeasyClient({ privateKey: PK, fetchImpl });
  const out = await client.chat.completions.create({ model: 'deepseek-v3.2', messages: [] });
  assert.equal(out.id, 'ok');
});

test('402 flow retries with payment headers', async () => {
  let calls = 0;
  const fetchImpl = async (_url, init = {}) => {
    calls += 1;
    if (calls === 1) {
      return jsonResponse({
        typedData: {
          domain: { name: 'USDC', version: '2', chainId: 8453, verifyingContract: '0x0000000000000000000000000000000000000001' },
          primaryType: 'TransferWithAuthorization',
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' }
            ],
            TransferWithAuthorization: [
              { name: 'from', type: 'address' },
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'validAfter', type: 'uint256' },
              { name: 'validBefore', type: 'uint256' },
              { name: 'nonce', type: 'bytes32' }
            ]
          },
          message: {
            from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            value: '1',
            validAfter: '0',
            validBefore: '9999999999',
            nonce: '0x' + '11'.repeat(32)
          }
        }
      }, 402);
    }

    assert.ok(init.headers['x402-payment']);
    return jsonResponse({ id: 'paid', choices: [] }, 200);
  };

  const client = new SpeakeasyClient({ privateKey: PK, fetchImpl });
  const out = await client.chat.completions.create({ model: 'deepseek-v3.2', messages: [] });
  assert.equal(out.id, 'paid');
  assert.equal(calls, 2);
});

test('streaming returns async iterator chunks', async () => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"delta":"a"}\n\n'));
      controller.enqueue(encoder.encode('data: {"delta":"b"}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  const fetchImpl = async () => new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  const client = new SpeakeasyClient({ privateKey: PK, fetchImpl });
  const stream = await client.chat.completions.create({ model: 'deepseek-v3.2', messages: [], stream: true });

  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk.delta);
  assert.deepEqual(chunks, ['a', 'b']);
});
