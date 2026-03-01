import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

const promptTemplates = {
  token_analysis: {
    id: "token_analysis",
    category: "research",
    template: "Analyze {{token}} with focus on market structure, liquidity, catalysts, and key risks. Output falsifiable claims with confidence.",
  },
  market_regime: {
    id: "market_regime",
    category: "market_analysis",
    template: "Assess current market regime for {{asset}} using trend, vol, and positioning context. Include invalidation levels.",
  },
  defi_risk: {
    id: "defi_risk",
    category: "defi",
    template: "Evaluate protocol risk for {{protocol}} covering contract, oracle, governance, and liquidity risks.",
  },
} as const

function applyTemplate(template: string, vars: Record<string, string>): string {
  let out = template
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v)
  }
  return out
}

export function registerAIPrompts(server: McpServer): void {
  server.tool("prompt_list", "List available prompt templates", {}, async () => ({
    content: [{
      type: "text",
      text: JSON.stringify({
        count: Object.keys(promptTemplates).length,
        templates: Object.values(promptTemplates).map((t) => ({ id: t.id, category: t.category })),
      }, null, 2),
    }],
  }))

  server.tool("prompt_get", "Get a prompt template by id", { templateId: z.string() }, async ({ templateId }) => {
    const template = (promptTemplates as Record<string, { id: string; category: string; template: string }>)[templateId]
    if (!template) return { content: [{ type: "text", text: JSON.stringify({ error: "Template not found" }) }] }
    return { content: [{ type: "text", text: JSON.stringify(template, null, 2) }] }
  })

  server.tool("prompt_generate", "Generate a prompt from template and variables", {
    templateId: z.string(),
    variables: z.record(z.string(), z.string()).optional(),
  }, async ({ templateId, variables = {} }) => {
    const template = (promptTemplates as Record<string, { template: string }>)[templateId]
    if (!template) return { content: [{ type: "text", text: JSON.stringify({ error: "Template not found" }) }] }
    return { content: [{ type: "text", text: JSON.stringify({ templateId, prompt: applyTemplate(template.template, variables) }, null, 2) }] }
  })

  server.tool("prompt_quick", "Generate a quick research prompt", {
    topic: z.string(),
    objective: z.string().optional(),
  }, async ({ topic, objective }) => ({
    content: [{
      type: "text",
      text: JSON.stringify({
        prompt: `Research ${topic}. ${objective ? `Objective: ${objective}. ` : ""}Include evidence, confidence, and invalidation criteria.`,
      }, null, 2),
    }],
  }))

  server.tool("prompt_build_custom", "Build a custom prompt from blocks", {
    role: z.string().default("crypto research analyst"),
    task: z.string(),
    constraints: z.array(z.string()).optional(),
  }, async ({ role, task, constraints = [] }) => ({
    content: [{
      type: "text",
      text: JSON.stringify({
        prompt: `You are a ${role}. Task: ${task}. Constraints: ${constraints.join("; ") || "none"}. Return concise, evidence-backed output.`,
      }, null, 2),
    }],
  }))
}
