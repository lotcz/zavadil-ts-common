import {CacheAsync} from "./CacheAsync";

export class HashCacheAsync<K, V> {

	private cache = new Map<K, CacheAsync<V>>;

	private supplier: (k: K) => Promise<V>;

	constructor(supplier: (k: K) => Promise<V>) {
		this.supplier = supplier;
	}

	private obtainCache(k: K): CacheAsync<V> {
		let c = this.cache.get(k);
		if (!c) {
			c = new CacheAsync(() => this.supplier(k));
			this.cache.set(k, c);
		}
		return c;
	}

	get(k: K): Promise<V> {
		return this.obtainCache(k).get();
	}

	set(k: K, v: V){
		this.obtainCache(k).set(v);
	}

	reset(k?: K) {
		if (!k) {
			this.cache.clear();
		} else {
			this.cache.delete(k);
		}
	}
}
