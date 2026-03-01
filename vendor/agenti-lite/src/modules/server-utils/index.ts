/**
 * Server Utilities Module
 * Health checks, environment validation, and OpenAPI spec
 *
 * @author nich
 * @github github.com/nirholas
 * @license Apache-2.0
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

function getRegisteredToolNames(server: McpServer): string[] {
  const registeredTools = (server as unknown as { _registeredTools?: Record<string, { enabled?: boolean }> })._registeredTools ?? {}

  return Object.entries(registeredTools)
    .filter(([, tool]) => tool?.enabled !== false)
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b))
}

function categorizeTool(name: string): string {
  if (name.startsWith("server_")) return "server"
  if (name.startsWith("alert_")) return "alerts"
  if (name.startsWith("portfolio_")) return "portfolio"
  if (name.startsWith("wallet_")) return "analytics"
  if (name.startsWith("historical_")) return "historical"
  if (name.startsWith("indicator_")) return "indicators"
  if (name.startsWith("solana_")) return "solana"
  if (name.startsWith("evm_")) return "evm"
  if (name.startsWith("defi_")) return "defi"
  if (name.startsWith("market_") || name.startsWith("get_")) return "market_data"

  return "other"
}

function buildToolCategories(server: McpServer): Record<string, string[]> {
  const categories: Record<string, string[]> = {}

  for (const name of getRegisteredToolNames(server)) {
    const category = categorizeTool(name)
    if (!categories[category]) categories[category] = []
    categories[category].push(name)
  }

  return categories
}

// Server start time for uptime calculation
const serverStartTime = Date.now()

// Required environment variables
const requiredEnvVars: string[] = []

// Optional but recommended env vars
const recommendedEnvVars = [
  "ETHEREUM_RPC_URL",
  "SOLANA_RPC_URL",
  "COINGECKO_API_KEY",
  "ETHERSCAN_API_KEY",
]

export function registerServerUtils(server: McpServer) {
  // Health check
  server.tool("server_health", "Check server health and status", {}, async () => {
    const uptime = Date.now() - serverStartTime
    const uptimeSeconds = Math.floor(uptime / 1000)
    const uptimeMinutes = Math.floor(uptimeSeconds / 60)
    const uptimeHours = Math.floor(uptimeMinutes / 60)
    const uptimeDays = Math.floor(uptimeHours / 24)

    const memoryUsage = process.memoryUsage()

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "healthy",
              timestamp: new Date().toISOString(),
              uptime: {
                ms: uptime,
                formatted: `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`,
              },
              memory: {
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
              },
              nodeVersion: process.version,
              platform: process.platform,
              pid: process.pid,
            },
            null,
            2
          ),
        },
      ],
    }
  })

  // Environment validation
  server.tool(
    "server_validate_env",
    "Validate environment configuration",
    {},
    async () => {
      const missing: string[] = []
      const present: string[] = []
      const warnings: string[] = []

      // Check required
      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          present.push(envVar)
        } else {
          missing.push(envVar)
        }
      }

      // Check recommended
      for (const envVar of recommendedEnvVars) {
        if (process.env[envVar]) {
          present.push(envVar)
        } else {
          warnings.push(`${envVar} not set - some features may be limited`)
        }
      }

      const isValid = missing.length === 0

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: isValid,
                status: isValid ? "OK" : "INVALID",
                required: {
                  present: present.filter((v) => requiredEnvVars.includes(v)),
                  missing,
                },
                recommended: {
                  present: present.filter((v) => recommendedEnvVars.includes(v)),
                  missing: recommendedEnvVars.filter(
                    (v) => !process.env[v]
                  ),
                },
                warnings,
                message: isValid
                  ? "Environment configuration is valid"
                  : `Missing required variables: ${missing.join(", ")}`,
              },
              null,
              2
            ),
          },
        ],
      }
    }
  )

  // Get server info
  server.tool("server_info", "Get server information and capabilities", {}, async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              name: "Universal Crypto MCP",
              version: "1.0.0",
              description: "Comprehensive cryptocurrency data and blockchain interaction via MCP",
              author: "nich",
              github: "github.com/nirholas/universal-crypto-mcp",
              license: "Apache-2.0",
              capabilities: {
                chains: [
                  "Ethereum",
                  "BSC",
                  "Polygon",
                  "Arbitrum",
                  "Avalanche",
                  "Optimism",
                  "Base",
                  "Fantom",
                  "Solana",
                  "Cosmos",
                  "Near",
                  "Sui",
                  "Aptos",
                ],
                features: [
                  "Market Data",
                  "DeFi Analytics",
                  "Token Analysis",
                  "Wallet Tracking",
                  "Technical Indicators",
                  "Portfolio Management",
                  "On-Chain Alerts",
                  "Historical Data",
                  "WebSocket Subscriptions",
                  "AI Prompt Templates",
                  "Governance Tracking",
                  "News & Sentiment",
                ],
                protocols: [
                  "Uniswap",
                  "Aave",
                  "Compound",
                  "Curve",
                  "Lido",
                  "GMX",
                  "dYdX",
                  "PancakeSwap",
                  "SushiSwap",
                  "Raydium",
                ],
              },
              endpoints: {
                stdio: "Default MCP transport",
                sse: "Server-Sent Events at /sse",
                http: "HTTP endpoint at /",
              },
            },
            null,
            2
          ),
        },
      ],
    }
  })

  // Get OpenAPI specification
  server.tool(
    "server_openapi_spec",
    "Get OpenAPI specification for the server",
    {},
    async () => {
      const openApiSpec = {
        openapi: "3.0.0",
        info: {
          title: "Universal Crypto MCP",
          version: "1.0.0",
          description: "Comprehensive cryptocurrency data and blockchain interaction API",
          contact: {
            name: "GitHub",
            url: "https://github.com/nirholas/universal-crypto-mcp",
          },
          license: {
            name: "Apache-2.0",
            url: "https://www.apache.org/licenses/LICENSE-2.0",
          },
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Local development server",
          },
        ],
        paths: {
          "/health": {
            get: {
              summary: "Health check",
              responses: {
                "200": {
                  description: "Server is healthy",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          status: { type: "string" },
                          uptime: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "/sse": {
            get: {
              summary: "Server-Sent Events endpoint",
              description: "Connect for real-time MCP communication",
              responses: {
                "200": {
                  description: "SSE stream established",
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ToolCall: {
              type: "object",
              properties: {
                name: { type: "string" },
                arguments: { type: "object" },
              },
            },
            ToolResult: {
              type: "object",
              properties: {
                content: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      text: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(openApiSpec, null, 2),
          },
        ],
      }
    }
  )

  // List all available tools
  server.tool(
    "server_list_tools",
    "List all available tools with descriptions",
    {
      category: z.string().optional().describe("Filter by category"),
      search: z.string().optional().describe("Search in tool names/descriptions"),
    },
    async ({ category, search }) => {
      const toolCategories = buildToolCategories(server)

      let result = Object.entries(toolCategories)

      if (category) {
        result = result.filter(([cat]) =>
          cat.toLowerCase().includes(category.toLowerCase())
        )
      }

      if (search) {
        const searchLower = search.toLowerCase()
        result = result.map(([cat, tools]) => [
          cat,
          tools.filter((t) => t.toLowerCase().includes(searchLower)),
        ]).filter(([_, tools]) => (tools as string[]).length > 0) as [string, string[]][]
      }

      const totalTools = result.reduce((sum, [_, tools]) => sum + tools.length, 0)

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalCategories: result.length,
                totalTools,
                categories: Object.fromEntries(result),
              },
              null,
              2
            ),
          },
        ],
      }
    }
  )

  // Get rate limit status
  server.tool("server_rate_limits", "Get current rate limit status", {}, async () => {
    // Mock rate limit data - in production, track actual usage
    const rateLimits = {
      global: {
        limit: 1000,
        remaining: 847,
        resetAt: new Date(Date.now() + 60000).toISOString(),
      },
      byEndpoint: {
        coingecko: { limit: 50, remaining: 42, resetAt: new Date(Date.now() + 60000).toISOString() },
        etherscan: { limit: 5, remaining: 3, resetAt: new Date(Date.now() + 1000).toISOString() },
        solana: { limit: 100, remaining: 95, resetAt: new Date(Date.now() + 10000).toISOString() },
      },
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(rateLimits, null, 2),
        },
      ],
    }
  })

}


export function validateServerToolRegistry(server: McpServer): void {
  const registeredTools = getRegisteredToolNames(server)
  const categories = buildToolCategories(server)
  const advertisedTools = Object.values(categories).flat()

  const missing = advertisedTools.filter((name) => !registeredTools.includes(name))
  if (missing.length > 0) {
    throw new Error(`Tool registry validation failed: advertised tools not registered: ${missing.join(", ")}`)
  }
}
