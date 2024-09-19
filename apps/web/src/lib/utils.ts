// src/lib/utils.ts
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { Poseidon } from 'O1js';
import { stringToField } from '@proto-kit/protocol';
import type { Transaction } from './stores/chain';

export function getMethodId(moduleName: string, methodName: string): string {
	return Poseidon.hash([stringToField(moduleName), stringToField(methodName)])
		.toBigInt()
		.toString();
}
export const filterTxn = {
	byMethodName: (txn: Transaction, moduleName: string, methodName: string) => {
		return getMethodId(moduleName, methodName) === txn.tx.methodId;
	}
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function truncateMiddle(
	str: string,
	startChars: number,
	endChars: number,
	ellipsis = '...'
): string {
	if (str.length <= startChars + endChars) {
		return str;
	}
	return str.slice(0, startChars) + ellipsis + str.slice(-endChars);
}
