export class LazyAsync<T> {

	private cache?: T;

	private supplier: () => Promise<T>;

	private promise?: Promise<T>;

	constructor(supplier: () => Promise<T>) {
		this.supplier = supplier;
	}

	get(): Promise<T> {
		if (this.cache !== undefined) {
			return Promise.resolve(this.cache);
		}

		if (this.promise === undefined) {
			this.promise = this.supplier()
				.then((v: T) => {
					this.cache = v;
					this.promise = undefined;
					return v;
				}).catch((err) => {
					this.promise = undefined;
					throw err;
				});
		}

		return this.promise;
	}

	reset() {
		this.cache = undefined;
	}

	hasCache() {
		return (this.cache !== undefined);
	}

	getCache(): T | undefined {
		return this.cache;
	}
}
