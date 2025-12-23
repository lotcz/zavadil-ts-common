export class ObjectUtil {

	static isEmpty(obj: any): obj is null | undefined {
		return obj === undefined || obj === null;
	}

	static notEmpty(obj: any): obj is object {
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
		if (!obj || obj === '') return '';

		const keys = path.split('.');

		let current = obj;
		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = current[key];
			} else {
				return '';
			}
		}

		return current;
	}

}
