// Service Worker registration and management

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New version available')
            // You could show a toast here prompting user to refresh
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.unregister()
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
    return false
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string = 'sync-pending-data'): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    if ('sync' in registration) {
      await (registration as any).sync.register(tag)
      console.log('Background sync registered:', tag)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Background sync registration failed:', error)
    return false
  }
}

// Listen for messages from service worker
export function onServiceWorkerMessage(callback: (data: any) => void): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {}
  }

  const handler = (event: MessageEvent) => {
    callback(event.data)
  }

  navigator.serviceWorker.addEventListener('message', handler)
  
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler)
  }
}

// Check if app is running in standalone mode (PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

// Check if service worker is active
export async function isServiceWorkerActive(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  const registration = await navigator.serviceWorker.getRegistration()
  return !!registration?.active
}
