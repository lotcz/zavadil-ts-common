export class LazyAsync<T> {

	private cache?: T;

	private supplier: () => Promise<T>;

	constructor(supplier: () => Promise<T>) {
		this.supplier = supplier;
	}

	get(): Promise<T> {
		if (this.cache === undefined) {
			return this.supplier()
				.then((v: T) => {
					this.cache = v;
					return v;
				});
		} else {
			return Promise.resolve(this.cache);
		}
	}
}
