import {EntityBase} from "../type/Entity";
import {RestClient} from "./RestClient";
import {Page, PagingRequest} from "../type";

export class EntityClient<T extends EntityBase> {

	client: RestClient;

	name: string;

	constructor(client: RestClient, name: string) {
		this.client = client;
		this.name = name;
	}

	loadSingle(id: number): Promise<T> {
		return this.client.getJson(`${this.name}/${id}`);
	}

	loadPage(pr: PagingRequest): Promise<Page<T>> {
		return this.client.getJson(this.name, RestClient.pagingRequestToQueryParams(pr));
	}

	save(d: T): Promise<T> {
		if (d.id) {
			return this.client.putJson(`${this.name}/${d.id}`, d);
		} else {
			return this.client.postJson(this.name, d);
		}
	}

	delete(id: number): Promise<any> {
		return this.client.del(`${this.name}/${id}`);
	}

}
