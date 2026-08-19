/**
 * Shared Type Definitions for SecureLens
 */

export type RiskLevel = "low" | "medium" | "high" | "critical"
export type TargetType = "url" | "domain" | "ip"
export type ScanStatus = "queued" | "running" | "completed" | "failed"
