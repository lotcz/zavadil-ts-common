import { ObjectUtil } from "./ObjectUtil";

export class NumberUtil extends ObjectUtil {

	static parseNumber(str: string | null | undefined): number | null {
		if (!str) return null;
		const n = Number(str);
		return Number.isNaN(n) ? null : n;
	}

	static round(n: number, d?: number) {
		if (!d) d = 0;
		const c = Math.pow(10, d);
		return Math.round( n * c) / c;
	}

}
