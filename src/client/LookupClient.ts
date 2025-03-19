import {EntityClient} from "./EntityClient";
import {EntityBase} from "../type/Entity";
import { LazyAsync } from "../cache";
import { RestClient } from "./RestClient";
import {HashCacheStats} from "../type";

export class LookupClient<T extends EntityBase> extends EntityClient<T> {

	protected cache: LazyAsync<Array<T>>;

	constructor(client: RestClient, name: string) {
		super(client, name);
		this.cache = new LazyAsync<Array<T>>(() => this.loadAllInternal());
	}

	private loadAllInternal(): Promise<Array<T>> {
		return this.client.getJson(`${this.name}/all`);
	}

	loadAll(): Promise<Array<T>> {
		return this.cache.get();
	}

	loadSingle(id: number): Promise<T> {
		// @ts-ignore
		return this.loadAll().then(
			(all: Array<T>) => {
				const d = all.find((l) => l.id === id);
				if (id === undefined) throw new Error(`${this.name} id ${id} not found!`);
				return d;
			}
		);
	}

	save(d: T): Promise<T> {
		return super.save(d)
			.then((s) => {
				this.cache.reset();
				return s;
			});
	}

	delete(id: number): Promise<any> {
		return super.delete(id).then(() => this.cache.reset());
	}

	reset() {
		this.cache.reset();
	}

	getStats(): HashCacheStats {
		const size = this.cache.getCache()?.length;
		return {
			cachedItems: size || 0,
			capacity: size || 0
		}
	}
}
