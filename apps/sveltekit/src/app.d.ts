// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// interface Window {
	// 	mina?: {
	// 		requestAccounts: () => Promise<string[]>;
	// 		getAccounts: () => Promise<string[]>;
	// 		on: (event: 'accountsChanged', handler: (accounts: string[]) => void) => void;
	// 		// Add any other mina methods you're using in your application
	// 	};
	// }

	declare module 'rollup-plugin-polyfill-node';
}

export {};
