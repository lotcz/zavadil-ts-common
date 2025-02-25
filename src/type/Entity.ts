export type EntityBase = {
	id?: number | null;
	created_on?: Date;
	last_update_on?: Date;
}

export type EntityWithName = EntityBase & {
	name: string;
}

export type LookupTableEntity = EntityWithName & {}
