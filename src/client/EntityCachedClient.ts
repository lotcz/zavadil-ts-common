import {EntityClient} from "./EntityClient";
import {EntityBase} from "../type/Entity";
import { HashCacheAsync } from "../cache";
import { RestClient } from "./RestClient";

export class EntityCachedClient<T extends EntityBase> extends EntityClient<T> {

	private cache: HashCacheAsync<number, T>;

	constructor(client: RestClient, name: string, maxSize?: number) {
		super(client, name);
		this.cache = new HashCacheAsync<number, T>((id: number) => super.loadSingle(id), maxSize);
	}

	loadSingle(id: number): Promise<T> {
		return this.cache.get(id);
	}

	save(d: T): Promise<T> {
		return super.save(d).then(
			(s: T): T => {
				if (s.id) this.cache.set(s.id, s);
				return s;
			});
	}

	delete(id: number): Promise<any> {
		return super.delete(id).then(() => this.cache.reset(id));
	}

}
