/**
 * Success Metrics
 * Calculates and tracks success metrics.
 */

export class SuccessMetrics {
  private metrics: Map<string, Array<{ timestamp: Date; value: number }>> = new Map();

  public recordMetric(id: string, metricName: string, value: number): void {
    const key = `${id}:${metricName}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push({ timestamp: new Date(), value });
  }

  public getMetric(id: string, metricName: string): Array<{ timestamp: Date; value: number }> {
    return this.metrics.get(`${id}:${metricName}`) || [];
  }

  public getAverage(id: string, metricName: string, days?: number): number {
    const data = this.getMetric(id, metricName);
    if (data.length === 0) return 0;
    
    let filtered = data;
    if (days) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = data.filter(d => d.timestamp >= cutoff);
    }
    
    return filtered.reduce((sum, d) => sum + d.value, 0) / filtered.length;
  }

  public clear(): void {
    this.metrics.clear();
  }
}
