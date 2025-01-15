export type SortingField = {
	name: string;
	desc?: boolean;
};

export type SortingRequest = Array<SortingField>;

export type PagingRequest = {
	page: number;
	size: number;
	search?: string | null;
	sorting: SortingRequest;
};

export type Page<Type> = {
	totalPages: number;
	totalElements: number;
	number: number;
	content: Array<Type>;
};

