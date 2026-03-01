import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const REQUIRED_TOOLS = ['server_health','prompt_list','x402_config','market_coingecko_ping','indicator_rsi']
const BLOCKED_TOOLS = ['transfer_native_token','transfer_erc20','execute_swap','x402_send','x402_pay_request']

function checkEnv() {
  const rookMode = (process.env.ROOK_MODE || 'research').toLowerCase()
  const liveApproved = process.env.ROOK_LIVE_APPROVED === 'true'
  const errors = []
  const warnings = []
  if (!['research', 'paper', 'live'].includes(rookMode)) errors.push(`Invalid ROOK_MODE=${rookMode}`)
  if (rookMode === 'live' && !liveApproved) errors.push('ROOK_MODE=live requires ROOK_LIVE_APPROVED=true')
  if (!process.env.X402_PRIVATE_KEY && !process.env.X402_EVM_PRIVATE_KEY) warnings.push('No X402 key set: payment/write paths expected to be unavailable')
  return { rookMode, liveApproved, errors, warnings }
}

function firstText(res){ return res?.content?.[0]?.text || '' }

async function run() {
  const env = checkEnv()
  const out = { ok: true, env, required:{ok:[],fail:[]}, blocked:{ok:[],fail:[]} }
  const client = new Client({ name: 'rook-preflight', version: '0.1.2' }, { capabilities: {} })
  const transport = new StdioClientTransport({ command: process.execPath, args: ['/Users/clawd/Desktop/agenti-lite/dist/index.js'] })

  try {
    await client.connect(transport)

    for (const t of REQUIRED_TOOLS) {
      try {
        const res = await client.callTool({ name: t, arguments: t==='indicator_rsi'?{symbol:'BTC/USDT',timeframe:'1h',period:14,limit:60}:{}})
        out.required.ok.push({ tool:t, preview:firstText(res).slice(0,120) })
      } catch (e) {
        out.required.fail.push({ tool:t, err:String(e?.message||e) })
      }
    }

    for (const t of BLOCKED_TOOLS) {
      try {
        const res = await client.callTool({ name: t, arguments: {} })
        const txt = firstText(res)
        if (/not found|unknown tool/i.test(txt)) out.blocked.ok.push(t)
        else out.blocked.fail.push({ tool:t, err:`call returned: ${txt.slice(0,120)}` })
      } catch (e) {
        const msg=String(e?.message||e)
        if (/not found|unknown tool/i.test(msg)) out.blocked.ok.push(t)
        else out.blocked.fail.push({ tool:t, err:msg })
      }
    }

    if (env.errors.length || out.required.fail.length || out.blocked.fail.length) out.ok = false
  } catch (e) {
    out.ok = false
    out.error = String(e?.message || e)
  } finally {
    await client.close().catch(() => {})
  }

  console.log(JSON.stringify(out, null, 2))
  if (!out.ok) process.exitCode = 1
}

run()
