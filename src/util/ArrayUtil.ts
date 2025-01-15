import { ObjectUtil } from "./ObjectUtil";

export class ArrayUtil {

	static isEmpty(arr?: Array<any> | null): boolean {
		// @ts-ignore
		return ObjectUtil.isEmpty(arr) || arr.length === 0;
	}

	static notEmpty(arr?: Array<any> | null): boolean {
		return !ArrayUtil.isEmpty(arr);
	}

	static remove(arr?: Array<any> | null, element?: any): Array<any> {
		if (ArrayUtil.isEmpty(arr)) return [];
		// @ts-ignore
		return arr?.filter(e => e !== element);
	}

}
