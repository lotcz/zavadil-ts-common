import {LazyAsync} from "./LazyAsync";

export class CacheAsync<T> extends LazyAsync<T> {

	private maxAgeMs?: number;

	private expires?: Date;

	constructor(supplier: () => Promise<T>, maxAgeMs?: number) {
		super(supplier);
		this.maxAgeMs = maxAgeMs;
	}

	get(): Promise<T> {
		if (this.expires && this.expires > new Date()) {
			this.reset();
		}
		return super.get();
	}

	set(v: T, expires?: Date) {
		this.cache = v;
		this.expires = expires;
		if (this.maxAgeMs && this.expires === undefined) {
			this.expires = new Date(new Date().getTime() + this.maxAgeMs);
		}
	}

}
