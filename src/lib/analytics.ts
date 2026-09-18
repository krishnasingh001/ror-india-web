const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-YYH1E6VBRT'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let initialized = false

export function getGaMeasurementId() {
  return GA_MEASUREMENT_ID
}

export function initAnalytics() {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === 'undefined') return
  if (import.meta.env.DEV && !import.meta.env.VITE_GA_MEASUREMENT_ID) {
    // Keep local noise down unless an ID is explicitly configured.
    return
  }

  initialized = true
  window.dataLayer = window.dataLayer || []

  // index.html already defines gtag in production builds; keep a fallback for SPA-only loads.
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }
}

export function trackPageView(path: string, title?: string) {
  initAnalytics()
  if (!initialized || typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  initAnalytics()
  if (!initialized || typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) return
  window.gtag('event', eventName, params)
}
