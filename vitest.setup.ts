import '@testing-library/jest-dom'

// jsdom polyfills
if (typeof window !== 'undefined' && !window.matchMedia) {
	// minimal matchMedia mock used by some UI libs
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})
}

// Provide env defaults for tests so supabase client can initialize lazily
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv = (import.meta as any).env || {}
viteEnv.VITE_SUPABASE_URL = viteEnv.VITE_SUPABASE_URL || 'http://localhost'
viteEnv.VITE_SUPABASE_ANON_KEY = viteEnv.VITE_SUPABASE_ANON_KEY || 'test_key'
