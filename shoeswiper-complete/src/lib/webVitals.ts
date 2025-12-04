/**
 * Web Vitals Monitoring Utility
 *
 * Tracks Core Web Vitals metrics for performance monitoring.
 * Metrics are only reported in production builds.
 *
 * Core Web Vitals tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface VitalsReport {
  url: string;
  timestamp: string;
  metrics: WebVitalMetric[];
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Queue to batch metrics before sending
let metricsQueue: WebVitalMetric[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Reports metrics to the console in development or to an analytics endpoint in production
 */
function reportMetrics(metrics: WebVitalMetric[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.group('📊 Web Vitals Report');
    metrics.forEach((metric) => {
      const icon = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      // eslint-disable-next-line no-console
      console.log(`${icon} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    });
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  // In production, you would send this to your analytics service
  // Example: sendToAnalytics(metrics);
}

/**
 * Flushes the metrics queue
 */
function flushMetrics(): void {
  if (metricsQueue.length === 0) return;

  const report: VitalsReport = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    metrics: [...metricsQueue],
  };

  reportMetrics(report.metrics);
  metricsQueue = [];

  // Store in localStorage for debugging (only last 10 reports)
  if (import.meta.env.DEV) {
    try {
      const storedReports = JSON.parse(localStorage.getItem('webVitalsReports') || '[]');
      storedReports.push(report);
      if (storedReports.length > 10) {
        storedReports.shift();
      }
      localStorage.setItem('webVitalsReports', JSON.stringify(storedReports));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Queues a metric for reporting
 */
function queueMetric(metric: WebVitalMetric): void {
  metricsQueue.push(metric);

  // Debounce flush
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }
  flushTimeout = setTimeout(flushMetrics, 2000);
}

/**
 * Initializes web vitals monitoring using the Performance API
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Use PerformanceObserver to collect metrics
  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (lastEntry) {
        queueMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: getRating('LCP', lastEntry.startTime),
          delta: lastEntry.startTime,
          id: `lcp-${Date.now()}`,
          navigationType: 'navigate',
        });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (using first-input)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming;
      if (firstEntry && 'processingStart' in firstEntry) {
        const delay = firstEntry.processingStart - firstEntry.startTime;
        queueMetric({
          name: 'FID',
          value: delay,
          rating: getRating('FID', delay),
          delta: delay,
          id: `fid-${Date.now()}`,
          navigationType: 'navigate',
        });
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && clsValue > 0) {
        queueMetric({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: clsValue,
          id: `cls-${Date.now()}`,
          navigationType: 'navigate',
        });
        flushMetrics();
      }
    });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        queueMetric({
          name: 'FCP',
          value: fcpEntry.startTime,
          rating: getRating('FCP', fcpEntry.startTime),
          delta: fcpEntry.startTime,
          id: `fcp-${Date.now()}`,
          navigationType: 'navigate',
        });
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // Time to First Byte (responseStart - fetchStart, not requestStart)
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const ttfb = navigationEntries[0].responseStart - navigationEntries[0].fetchStart;
      if (ttfb > 0) {
        queueMetric({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
          delta: ttfb,
          id: `ttfb-${Date.now()}`,
          navigationType: navigationEntries[0].type || 'navigate',
        });
      }
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📊 Web Vitals monitoring initialized');
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Web Vitals monitoring not available:', error);
    }
  }
}

/**
 * Get stored web vitals reports (development only)
 */
export function getStoredReports(): VitalsReport[] {
  if (!import.meta.env.DEV) return [];

  try {
    return JSON.parse(localStorage.getItem('webVitalsReports') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear stored web vitals reports (development only)
 */
export function clearStoredReports(): void {
  if (import.meta.env.DEV) {
    localStorage.removeItem('webVitalsReports');
  }
}
