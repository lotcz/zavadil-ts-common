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

}
