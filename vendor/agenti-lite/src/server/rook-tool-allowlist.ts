import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import Logger from "@/utils/logger.js"

const ALLOWED_PREFIXES = [
  // Social/sentiment signal
  "social_",

  // News/narrative detection
  "get_crypto_news",
  "get_bitcoin_news",
  "get_breaking_crypto_news",
  "get_defi_news",
  "get_crypto_news_sources",
  "search_crypto_news",
  "search_historical_news",
  "analyze_news_impact",
  "get_premium_news_status",

  // Wallet analytics / whale tracking
  "wallet_detect_whales",
  "wallet_whale_movements",
  "wallet_profile",
  "wallet_score",
  "wallet_find_similar",
  "wallet_lookup_label",
  "wallet_token_holder_analysis",

  // Prediction / backtesting
  "predict_",
  "prediction_",
  "backtest_strategy",

  // Alert monitoring
  "alert_",

  // Portfolio tracking
  "portfolio_",

  // Solana read-only
  "solana_get_balance",
  "solana_get_account_info",
  "solana_get_spl_token_balances",
  "solana_get_swap_quote",

  "server_",
  // x402 read-only / diagnostics (no send/pay endpoints)
  "x402_config",
  "x402_security_status",
  "x402_server_status",
  "x402_networks",
  "x402_list_supported_networks",
  "x402_balance",
  "x402_address",
  "x402_get_wallet_address",
  "x402_check_balance",
  "x402_estimate",
  "x402_estimate_cost",
  "x402_tx_status",
  "x402_verify_payment",
  "x402_get_payment_history",
  "x402_get_payment_limits",
  "x402_list_approved_services",
  "usds_",
  "yield_",
  "prompt_",
  "research_",
  "historical_",
  "market_",
  "coingecko_",
  "defi_",
  "dex_",
  "geckoterminal_",
  "indicator_",
  "strategy_",
  "screener_",
  "get_chain_",
  "get_supported_networks",
  "get_network_",
  "estimate_block_time",
  "get_finality_status",
  "get_gas_",
  "get_eip1559_fees",
  "get_standard_gas_limits",
  "get_native_balance",
  "get_erc20_",
  "get_token_",
  "check_token_allowance",
  "get_transaction",
  "get_pending_transaction_count",
  "simulate_transaction",
  "estimate_gas",
  "read_contract",
  "is_contract",
  "get_pool_",
  "get_swap_quote",
  "get_best_route",
  "calculate_arbitrage",
  "get_price_impact",
  "get_dex_liquidity",
  "get_supported_dexs",
  "analyze_token_security",
  "detect_honeypot",
  "detect_rug_pull_risk",
  "check_approval_risks",
  "check_mev_exposure",
  "verify_contract_source",
  "goplus_",
  "get_portfolio_",
  "get_wallet_portfolio",
  "get_multichain_portfolio",
  "get_wallet_activity",
  "calculate_portfolio_allocation",
]

export function installRookToolAllowlist(server: McpServer): void {
  const originalTool = server.tool.bind(server) as (...args: any[]) => any
  const skipped: string[] = []
  const seen = new Set<string>()

  ;(server as any).tool = ((name: string, ...rest: any[]) => {
    const allowed = ALLOWED_PREFIXES.some(prefix => name.startsWith(prefix))
    if (!allowed) {
      skipped.push(name)
      return
    }
    if (seen.has(name)) {
      skipped.push(`${name} (duplicate)`)
      return
    }
    seen.add(name)
    return originalTool(name, ...rest)
  }) as typeof server.tool

  Logger.info("Rook tool allowlist enabled", { prefixCount: ALLOWED_PREFIXES.length })

  process.nextTick(() => {
    if (skipped.length > 0) {
      Logger.info("Rook tool allowlist skipped tools", {
        skippedCount: skipped.length,
        sample: skipped.slice(0, 25),
      })
    }
  })
}
