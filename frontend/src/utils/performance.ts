export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now());
    }
  }

  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined') return 0;

    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();

    if (!startTime || !endTime) return 0;

    const duration = endTime - startTime;
    
    // Store measurement
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)?.push(duration);

    // Keep only last 100 measurements
    const measurements = this.measures.get(name);
    if (measurements && measurements.length > 100) {
      this.measures.set(name, measurements.slice(-100));
    }

    return duration;
  }

  getAverageDuration(measureName: string): number {
    const measurements = this.measures.get(measureName);
    if (!measurements || measurements.length === 0) return 0;

    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const metrics: Record<string, { average: number; count: number }> = {};

    this.measures.forEach((measurements, name) => {
      metrics[name] = {
        average: this.getAverageDuration(name),
        count: measurements.length,
      };
    });

    return metrics;
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Helper functions
export const perfMark = (name: string): void => {
  PerformanceMonitor.getInstance().mark(name);
};

export const perfMeasure = (name: string, startMark: string, endMark?: string): number => {
  return PerformanceMonitor.getInstance().measure(name, startMark, endMark);
};

export const perfMetrics = (): Record<string, { average: number; count: number }> => {
  return PerformanceMonitor.getInstance().getMetrics();
};