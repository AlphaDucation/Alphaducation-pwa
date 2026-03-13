if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    let hasRefreshedForUpdate = false;

    try {
      const registration = await navigator.serviceWorker.register('service-worker.js');

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasRefreshedForUpdate) return;
        hasRefreshedForUpdate = true;
        window.location.reload();
      });

      console.log('Service worker registered');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
