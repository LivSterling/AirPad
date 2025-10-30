/**
 * Performance Monitor
 * 
 * Tracks and reports performance metrics for critical paths:
 * - Hand tracking latency
 * - Audio trigger latency  
 * - Frame rate
 * - Memory usage
 */

interface PerformanceMetric {
  name: string
  timestamp: number
  duration?: number
  value?: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean = false
  private maxMetrics: number = 1000

  private constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true'
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Mark the start of a performance measurement
   */
  public mark(name: string): void {
    if (!this.isEnabled) return

    performance.mark(`${name}-start`)
  }

  /**
   * Mark the end and measure duration
   */
  public measure(name: string): number | null {
    if (!this.isEnabled) return null

    try {
      performance.mark(`${name}-end`)
      const measure = performance.measure(name, `${name}-start`, `${name}-end`)
      
      this.addMetric({
        name,
        timestamp: Date.now(),
        duration: measure.duration
      })

      // Clean up marks
      performance.clearMarks(`${name}-start`)
      performance.clearMarks(`${name}-end`)
      performance.clearMeasures(name)

      return measure.duration
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error)
      return null
    }
  }

  /**
   * Record a custom metric value
   */
  public recordValue(name: string, value: number): void {
    if (!this.isEnabled) return

    this.addMetric({
      name,
      timestamp: Date.now(),
      value
    })
  }

  /**
   * Get average duration for a metric
   */
  public getAverage(metricName: string): number | null {
    const filtered = this.metrics.filter(m => m.name === metricName && m.duration !== undefined)
    if (filtered.length === 0) return null

    const sum = filtered.reduce((acc, m) => acc + (m.duration || 0), 0)
    return sum / filtered.length
  }

  /**
   * Get recent metrics (last N entries)
   */
  public getRecent(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * Get all metrics for a specific name
   */
  public getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics = []
  }

  /**
   * Generate performance report
   */
  public generateReport(): Record<string, any> {
    const metricNames = [...new Set(this.metrics.map(m => m.name))]
    const report: Record<string, any> = {}

    for (const name of metricNames) {
      const metrics = this.getMetrics(name)
      const durations = metrics.filter(m => m.duration !== undefined).map(m => m.duration!)
      const values = metrics.filter(m => m.value !== undefined).map(m => m.value!)

      report[name] = {
        count: metrics.length,
        ...(durations.length > 0 && {
          avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations)
        }),
        ...(values.length > 0 && {
          avgValue: values.reduce((a, b) => a + b, 0) / values.length,
          minValue: Math.min(...values),
          maxValue: Math.max(...values)
        })
      }
    }

    return report
  }

  /**
   * Log report to console
   */
  public logReport(): void {
    if (!this.isEnabled) {
      console.log('Performance monitoring is disabled')
      return
    }

    console.group('📊 Performance Report')
    const report = this.generateReport()
    for (const [name, stats] of Object.entries(report)) {
      console.log(`\n${name}:`, stats)
    }
    console.groupEnd()
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep metrics array at max size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }
}

export default PerformanceMonitor

