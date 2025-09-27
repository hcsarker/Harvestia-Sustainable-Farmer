import { createRoot } from 'react-dom/client'
import './index.css'

// Early diagnostics
console.log('[main] starting bootstrap');

// In dev, aggressively unregister any service workers that might be intercepting
// module requests and causing dynamic import failures.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations()
		.then((regs) => {
			if (regs.length) {
				console.warn('[main] Unregistering stale service workers in dev:', regs.length);
			}
			regs.forEach((reg) => reg.unregister().catch(() => {}));
		})
		.catch((e) => console.warn('[main] serviceWorker.getRegistrations() failed', e));
}

// Global error visibility (in case React never mounts)
window.addEventListener('error', (e) => {
	console.error('[global error]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
	console.error('[global unhandledrejection]', e.reason);
});

const rootEl = document.getElementById('root');
if (!rootEl) {
	console.error('[main] #root element not found');
} else {
	(async () => {
		try {
			const { default: App } = await import('./App.tsx');
			createRoot(rootEl).render(<App />);
			console.log('[main] React root mounted');
		} catch (e) {
			console.error('[main] App import/render failed', e);
			const container = document.createElement('div');
			container.style.padding = '16px';
			container.style.fontFamily = 'monospace';
			container.style.color = 'red';
			container.innerText = `App failed to start.\n${(e as Error).message}\nCheck environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) and build errors in console.`;
			rootEl.appendChild(container);
		}
	})();
}
