export type EntityBase = {
	id?: number | null;
	createdOn?: Date;
	lastUpdatedOn?: Date;
}

export type EntityWithName = EntityBase & {
	name: string;
}

export type LookupTableEntity = EntityWithName & {}
