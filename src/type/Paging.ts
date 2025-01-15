export type SortingField = {
	name: string;
	desc?: boolean;
};

export type SortingRequest = Array<SortingField>;

export type PagingRequest = {
	page: number;
	size: number;
	search?: string | null;
	sorting?: SortingRequest | null;
};

export type Page<Type> = {
	totalItems: number;
	pageSize: number;
	pageNumber: number;
	content: Array<Type>;
};

