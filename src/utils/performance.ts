/**
 * Performance Monitoring Utilities
 * Track and optimize app performance
 */

/**
 * Measure and log page load performance
 */
export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

      console.log('📊 Performance Metrics:', {
        'Page Load Time': `${pageLoadTime}ms`,
        'Server Response': `${connectTime}ms`,
        'DOM Render': `${renderTime}ms`,
        'DOM Ready': `${domReadyTime}ms`,
      });

      // Log Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🎨 LCP (Largest Contentful Paint):', `${(lastEntry as any).renderTime || (lastEntry as any).loadTime}ms`);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              console.log('⚡ FID (First Input Delay):', `${entry.processingStart - entry.startTime}ms`);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift (CLS)
          let clsScore = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value;
              }
            }
            console.log('📐 CLS (Cumulative Layout Shift):', clsScore.toFixed(4));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // Silently fail if observers not supported
        }
      }
    }, 0);
  });
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    link.href = resource;
    document.head.appendChild(link);
  });
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g';
  }
  return false;
};

/**
 * Optimize images based on connection speed
 */
export const getOptimizedImageUrl = (url: string, quality: 'low' | 'medium' | 'high' = 'high'): string => {
  if (isSlowConnection()) {
    quality = 'low';
  }

  // If using Google Cloud Storage or similar, append quality params
  if (url.includes('googleusercontent.com')) {
    const qualityMap = {
      low: '=w400',
      medium: '=w800',
      high: '=w1200',
    };
    return url + qualityMap[quality];
  }

  return url;
};

/**
 * Memory usage monitoring (for debugging)
 */
export const logMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('💾 Memory Usage:', {
      'Used JS Heap': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      'Total JS Heap': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      'Heap Limit': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};
