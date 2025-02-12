import { HashCacheStats } from "../type/Stats";
import {CacheAsync} from "./CacheAsync";

export class HashCacheAsync<K, V> {

	private cache = new Map<K, CacheAsync<V>>;

	private supplier: (k: K) => Promise<V>;

	private maxSize: number = 100;

	constructor(supplier: (k: K) => Promise<V>, maxSize?: number) {
		this.supplier = supplier;
		if (maxSize) this.maxSize = maxSize;
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

	getSize() {
		return this.cache.size;
	}

	getMaxSize() {
		return this.maxSize;
	}

	getStats(): HashCacheStats {
		return {
			cachedItems: this.getSize(),
			capacity: this.getMaxSize()
		}
	}
}
