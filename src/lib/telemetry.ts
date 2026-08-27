/**
 * Production Telemetry & Observability Subsystem
 * Structured JSON logging, agent latency tracking, and execution metrics.
 */

export interface AgentMetric {
  agentName: string;
  durationMs: number;
  tokensEstimated?: number;
  status: "success" | "error" | "cached";
  timestamp: string;
}

export class TelemetryLogger {
  private static timers = new Map<string, number>();

  public static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  public static endTimer(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;
    const duration = Math.round(performance.now() - start);
    this.timers.delete(label);
    return duration;
  }

  public static logAgentExecution(metric: AgentMetric): void {
    const structuredPayload = {
      severity: metric.status === "error" ? "ERROR" : "INFO",
      type: "AGENT_EXECUTION",
      agent: metric.agentName,
      latency_ms: metric.durationMs,
      status: metric.status,
      timestamp: metric.timestamp,
    };

    if (process.env.NODE_ENV !== "test") {
      console.log(`[TELEMETRY] ${JSON.stringify(structuredPayload)}`);
    }
  }

  public static logApiRequest(route: string, method: string, status: number, durationMs: number, clientIp?: string): void {
    const payload = {
      type: "HTTP_METRIC",
      route,
      method,
      status,
      durationMs,
      clientIp: clientIp || "anonymous",
      timestamp: new Date().toISOString(),
    };

    console.log(`[API_METRIC] ${JSON.stringify(payload)}`);
  }
}
