/**
 * @author nich
 * @website x.com/nichxbt
 * @github github.com/nirholas
 * @license Apache-2.0
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerEVM } from "@/evm.js"
import { registerX402 } from "@/x402/index.js"
import { registerAIPredictions } from "@/modules/ai-predictions/index.js"
import { validateServerToolRegistry } from "@/modules/server-utils/index.js"
import Logger from "@/utils/logger.js"
import { installRookToolAllowlist } from "./rook-tool-allowlist.js"

// Create and start the MCP server

function enforceRookSafetyDefaults() {
  const rookMode = (process.env.ROOK_MODE || "research").toLowerCase()
  const liveApproved = process.env.ROOK_LIVE_APPROVED === "true"

  if (rookMode === "live" && !liveApproved) {
    throw new Error(
      "ROOK_MODE=live requires explicit ROOK_LIVE_APPROVED=true. " +
      "Refusing to start in live mode by default."
    )
  }

  Logger.info("Rook mode safety", {
    rookMode,
    liveApproved,
  })
}

export const startServer = () => {
  try {
    enforceRookSafetyDefaults()

    // Create a new MCP server instance
    const server = new McpServer({
      name: "Universal Crypto MCP",
      version: "1.1.0",
      description: "Universal MCP server for all EVM-compatible networks with x402 payment protocol"
    })

    // Install explicit Rook allowlist before tool registration
    installRookToolAllowlist(server)

    // Register all resources, tools, and prompts
    registerEVM(server)
    
    // Register x402 payment protocol tools only when enabled.
    // Research/read-only default disables x402 startup side-effects and key warnings.
    const x402Enabled = process.env.AGENTI_ENABLE_X402 === "true"
    if (x402Enabled) {
      registerX402(server)
      Logger.info("x402 tools enabled")
    } else {
      Logger.info("x402 tools disabled (read-only mode)")
    }

    // Register AI Predictions module
    // ML-powered crypto predictions monetized via x402
    registerAIPredictions(server)

    // Fail fast if advertised tool inventory diverges from registered handlers.
    validateServerToolRegistry(server)

    return server
  } catch (error) {
    Logger.error("Failed to initialize server:", error)
    process.exit(1)
  }
}
