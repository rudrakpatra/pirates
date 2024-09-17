// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type MinaProvider from '@aurowallet/mina-provider';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		mina?: MinaProvider;
	}

	declare module 'rollup-plugin-polyfill-node';
}

export {};
