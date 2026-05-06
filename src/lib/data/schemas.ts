/**
 * Zod schemas for the financial data shape.
 * The parser's output is validated against this on load,
 * so the dashboard can rely on these types being correct.
 */

import { z } from "zod"

export const periodSchema = z.object({
  periodEnd: z.string(), // ISO date
  periodLabel: z.string(), // e.g. "Dec 2025"
  quarter: z.string(), // e.g. "Q4 FY2026"

  // Raw metrics
  insuranceRevenue: z.number().optional(),
  incurredClaims: z.number().optional(),
  insuranceServiceExpense: z.number().optional(),
  insuranceServiceResult: z.number().optional(),
  investmentResult: z.number().optional(),
  netProfit: z.number().optional(),
  preTaxProfit: z.number().optional(),
  generalTreatmentRevenue: z.number().optional(),
  generalTreatmentClaims: z.number().optional(),
  netReinsurance: z.number().optional(),
  capitalBase: z.number().optional(),

  // Per-period computed
  lossRatio: z.number().optional(),
  netMargin: z.number().optional(),
  underwritingMargin: z.number().optional(),

  // TTM
  ttmRevenue: z.number().optional(),
  ttmClaims: z.number().optional(),
  ttmNetProfit: z.number().optional(),
  ttmLossRatio: z.number().optional(),
  ttmNetMargin: z.number().optional(),

  // YoY deltas (decimal, e.g. 0.048 = +4.8%)
  revenueYoY: z.number().optional(),
  netProfitYoY: z.number().optional(),
})

export const financialJsonSchema = z.object({
  meta: z.object({
    source: z.string(),
    sourceUrl: z.string(),
    license: z.string(),
    lastUpdated: z.string(),
    periodCount: z.number(),
  }),
  periods: z.array(periodSchema),
})

export type Period = z.infer<typeof periodSchema>
export type FinancialJson = z.infer<typeof financialJsonSchema>
