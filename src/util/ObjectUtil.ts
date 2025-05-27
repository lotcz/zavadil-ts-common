import {StringUtil} from "./StringUtil";

export class ObjectUtil {

	static isEmpty(obj: any) {
		return obj === undefined || obj === null;
	}

	static notEmpty(obj: any) {
		return !ObjectUtil.isEmpty(obj);
	}

	static clone<T>(obj: T): T {
		if (obj === null) {
			throw new Error("Null cannot be cloned!");
		}
		if (typeof obj !== 'object') {
			throw new Error("Not an object, cannot be cloned!");
		}
		return {...obj};
	}

	static getNestedValue(obj: any, path: string): string {
		if (!obj || StringUtil.isBlank(path)) return '';

		const keys = path.split('.');

		let current = obj;
		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = current[key];
			} else {
				return '';
			}
		}

		return StringUtil.toString(current);
	}

}
