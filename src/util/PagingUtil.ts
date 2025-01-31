import {PagingRequest, SortingField, SortingRequest} from "../type";
import {StringUtil} from "./StringUtil";

export const FIRST_PAGE: PagingRequest = {page: 0, size: 10};

export class PagingUtil {

	static sortingFieldToString(s: SortingField): string | undefined {
		return s.desc ? `${s.name} DESC` : s.name;
	}

	static sortingFieldFromString(s: string): SortingField {
		const arr = s.split(' ');
		return {
			name: arr[0],
			desc: arr.length > 1
		}
	}

	static sortingRequestToString(s: SortingRequest): string | undefined {
		return s.map((s: SortingField) => PagingUtil.sortingFieldToString(s)).join(',');
	}

	static sortingRequestFromString(s?: string | null): SortingRequest {
		if (!s) return [];
		const arr = s.split(',');
		return arr.map((s) => PagingUtil.sortingFieldFromString(s));
	}

	static pagingRequestToQueryParams(pr?: PagingRequest | null): any {
		if (!pr) return;
		const result: any = {
			page: pr.page,
			size: pr.size
		}
		if (pr.search) {
			result.search = pr.search;
		}
		if (pr.sorting) {
			result.sorting = PagingUtil.sortingRequestToString(pr.sorting);
		}
		return result;
	}

	static pagingRequestToString(pr?: PagingRequest): string {
		if (!pr) return '';
		const arr = [];
		arr.push(String(pr.page));
		arr.push(String(pr.size));
		arr.push(String(pr.search));
		arr.push(pr.sorting ? PagingUtil.sortingRequestToString(pr.sorting) : '');
		return arr.join(':');
	}

	static pagingRequestFromString(pr?: string): PagingRequest {
		if (!pr || StringUtil.isEmpty(pr)) return FIRST_PAGE;
		const arr = pr.split(':');
		if (arr.length < 4) return FIRST_PAGE;
		return {
			page: Number(arr[0]),
			size: Number(arr[1]),
			search: String(arr[2]),
			sorting: StringUtil.isEmpty(arr[3]) ? undefined : PagingUtil.sortingRequestFromString(arr[3])
		}
	}

}
