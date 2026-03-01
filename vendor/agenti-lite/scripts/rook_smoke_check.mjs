import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const client = new Client({ name: 'rook-smoke', version: '0.1.1' }, { capabilities: {} })
const transport = new StdioClientTransport({ command: process.execPath, args: ['/Users/clawd/Desktop/agenti-lite/dist/index.js'] })

async function call(name, args = {}) {
  try {
    const res = await client.callTool({ name, arguments: args })
    return { ok: true, preview: res?.content?.[0]?.text?.slice?.(0, 180) || null }
  } catch (e) {
    return { ok: false, err: String(e?.message || e) }
  }
}

try {
  await client.connect(transport)
  const results = {}
  results.server_health = await call('server_health', {})
  results.prompt_list = await call('prompt_list', {})
  results.x402_config = await call('x402_config', {})
  results.market_ping = await call('market_coingecko_ping', {})
  results.indicator_rsi = await call('indicator_rsi', { symbol: 'BTC/USDT', timeframe: '1h', period: 14, limit: 60 })

  // expected blocked
  results.blocked_transfer_native = await call('transfer_native_token', { to: '0x0000000000000000000000000000000000000000', amount: '0.01', chain: 'base' })

  console.log(JSON.stringify({ ok: true, results }, null, 2))
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e?.message || e) }, null, 2))
  process.exitCode = 1
} finally {
  await client.close().catch(() => {})
}
