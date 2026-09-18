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
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  // SPA route changes send page_view explicitly.
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  })
}

export function trackPageView(path: string, title?: string) {
  if (!initialized || !window.gtag || !GA_MEASUREMENT_ID) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (!initialized || !window.gtag || !GA_MEASUREMENT_ID) return
  window.gtag('event', eventName, params)
}
