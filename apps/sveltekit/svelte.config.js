import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter()
		// vite: {
		// 	optimizeDeps: {
		// 		include: ['@proto-kit/sequencer']
		// 	},
		// 	ssr: {
		// 		noExternal: ['@proto-kit/sequencer']
		// 	}
		// }
	}
};

export default config;
