const installationButton = document.getElementById('installationButton')

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  window.deferredPrompt = event
  installationButton.removeAttribute('hidden')
})

installationButton.addEventListener('click', async () => {
  const promptEvent = window.deferredPrompt
  if (!promptEvent) return
  promptEvent.prompt()
  await promptEvent.userChoice
  window.deferredPrompt = null
  installationButton.setAttribute('hidden', '')
})

window.addEventListener('appinstalled', (event) => {
  window.deferredPrompt = null
})

function getPWADisplayMode() {
  if (document.referrer.startsWith('android-app://')) return 'twa'
  if (window.matchMedia('(display-mode: browser)').matches) return 'browser'
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return 'standalone'
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui'
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen'
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return 'window-controls-overlay'
  return 'unknown'
}

window.matchMedia('(display-mode: standalone)').addEventListener('change', () => console.log('DISPLAY_MODE_CHANGED', getPWADisplayMode()))
