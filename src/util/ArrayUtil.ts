import { ObjectUtil } from "./ObjectUtil";

export class ArrayUtil {

	static isEmpty(arr?: Array<any> | null): arr is null | undefined {
		return ObjectUtil.isEmpty(arr) || arr.length === 0;
	}

	static notEmpty(arr?: Array<any> | null): arr is Array<any> {
		return !ArrayUtil.isEmpty(arr);
	}

	static remove(arr?: Array<any> | null, element?: any): Array<any> {
		if (ArrayUtil.isEmpty(arr)) return [];
		return arr.filter(e => e !== element);
	}

	static extract(arr?: Array<any> | null, start: number = 0, length?: number): Array<any> {
		if ((!arr) || arr.length <= start) return [];
		const end = length === undefined ? undefined : start + length;
		return arr.slice(start, end);
	}

	static extractStart(arr: Array<any> | null | undefined, length: number): Array<any> {
		return ArrayUtil.extract(arr, 0, length);
	}

}
