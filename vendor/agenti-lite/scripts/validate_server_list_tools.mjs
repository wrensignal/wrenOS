#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const serverPath = process.env.SCOUT_MCP_SERVER_PATH || process.env.ROOK_MCP_SERVER_PATH || new URL('../dist/index.js', import.meta.url).pathname

const client = new Client({ name: 'validate-server-list-tools', version: '0.1.0' }, { capabilities: {} })
const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] })

function parseJsonText(res) {
  const text = res?.content?.find?.((c) => c?.type === 'text')?.text || res?.content?.[0]?.text || ''
  return JSON.parse(text)
}

let failed = 0
let total = 0

try {
  await client.connect(transport)

  const listRes = await client.callTool({ name: 'server_list_tools', arguments: {} })
  if (listRes?.isError) throw new Error(`server_list_tools errored: ${JSON.stringify(listRes.content)}`)

  const payload = parseJsonText(listRes)
  const toolNames = [...new Set(Object.values(payload.categories || {}).flat())]

  total = toolNames.length
  const failures = []

  for (const tool of toolNames) {
    try {
      const res = await client.callTool({ name: tool, arguments: {} })
      const text = (res?.content || []).map((c) => c?.text || '').join('\n')
      const notFound = text.includes(`Tool ${tool} not found`)
      if (notFound) {
        failed += 1
        failures.push({ tool, reason: 'tool-not-found' })
      }
    } catch (error) {
      const msg = String(error?.message || error)
      if (msg.includes(`Tool ${tool} not found`)) {
        failed += 1
        failures.push({ tool, reason: 'tool-not-found' })
      }
    }
  }

  const result = { total, failed, passed: total - failed, failures }
  console.log(JSON.stringify(result, null, 2))

  if (failed > 0) process.exit(1)
} finally {
  await client.close().catch(() => {})
}
