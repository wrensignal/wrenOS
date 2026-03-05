import { SpeakeasyClient } from 'speakeasy-ai';

export function createInferenceClient(config = {}) {
  const baseUrl =
    config.inferenceUrl ||
    config.baseUrl ||
    process.env.SPEAKEASY_BASE_URL ||
    'https://speakeasy.ing';

  const privateKey =
    config.privateKey ||
    process.env.AGENT_WALLET_PRIVATE_KEY ||
    process.env.ROOK_EVM_PRIVATE_KEY;

  const client = privateKey
    ? new SpeakeasyClient({ privateKey, baseURL: baseUrl })
    : null;

  return {
    provider: config.provider || 'speakeasy',
    baseUrl,
    routes: {
      research: config.researchModel || config.routes?.research || 'deepseek-v3.2',
      deep_think: config.thinkModel || config.routes?.deep_think || 'qwen3-235b-a22b-thinking-2507',
      codegen: config.codeModel || config.routes?.codegen || 'qwen3-coder-480b-a35b-instruct',
      uncensored: config.uncensoredModel || config.routes?.uncensored || 'venice-uncensored'
    },
    client,
    async complete({ model, messages, stream = false }) {
      if (!client) {
        throw new Error('Missing AGENT_WALLET_PRIVATE_KEY (or config.privateKey) for Speakeasy x402 flow');
      }
      return client.chat.completions.create({ model, messages, stream });
    }
  };
}
