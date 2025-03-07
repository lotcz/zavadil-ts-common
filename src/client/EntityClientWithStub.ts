import {EntityClient} from "./EntityClient";
import {EntityBase} from "../type/Entity";

export class EntityClientWithStub<T extends EntityBase, TStub extends EntityBase> extends EntityClient<T> {

	loadSingle(id: number): Promise<T> {
		throw new Error("Use loadSingleStub() instead!");
	}

	loadSingleStub(id: number): Promise<TStub> {
		return this.client.getJson(`${this.name}/${id}`);
	}

	save(d: T): Promise<T> {
		throw new Error("Use saveStub() instead!");
	}

	saveStub(d: TStub): Promise<TStub> {
		if (d.id) {
			return this.client.putJson(`${this.name}/${d.id}`, d);
		} else {
			return this.client.postJson(this.name, d);
		}
	}

}
