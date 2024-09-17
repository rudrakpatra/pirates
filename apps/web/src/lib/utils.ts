// src/lib/utils.ts
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

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
