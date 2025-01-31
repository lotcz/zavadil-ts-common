export class CacheAsync<T> {

	private cache?: T;

	private supplier: () => Promise<T>;

	private maxAgeMs?: number;

	private expires?: Date;

	constructor(supplier: () => Promise<T>, maxAgeMs?: number) {
		this.supplier = supplier;
		this.maxAgeMs = maxAgeMs;
	}

	get(): Promise<T> {
		if (this.cache === undefined || (this.expires && this.expires > new Date())) {
			return this.supplier()
				.then((v: T) => {
					this.set(v);
					return v;
				});
		} else {
			return Promise.resolve(this.cache);
		}
	}

	set(v: T) {
		this.cache = v;
		if (this.maxAgeMs) {
			this.expires = new Date(new Date().getTime() + this.maxAgeMs);
		}
	}
}
