export class Lazy<T> {

	private cache?: T;

	private supplier: () => T;

	constructor(supplier: () => T) {
		this.supplier = supplier;
	}

	get(): T {
		if (this.cache === undefined) {
			this.cache = this.supplier();
		}
		return this.cache;
	}

	reset() {
		this.cache = undefined;
	}
}
