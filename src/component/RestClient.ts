import { StringUtil } from "../util";
import {PagingRequest, SortingField, SortingRequest} from "../type";

export type RestClientHeaders = {};

export class RestClient {

	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	static sortingFieldToString(s: SortingField): string | undefined {
		return s.desc ? `${s.name} DESC` : s.name;
	}

	static sortingRequestToString(s: SortingRequest): string | undefined {
		return s.map((s: SortingField) => RestClient.sortingFieldToString(s)).join(',');
	}

	static pagingRequestToQueryParams(pr: PagingRequest): any {
		const result: any = {
			page: pr.page,
			size: pr.size
		}
		if (pr.search) {
			result.search = pr.search;
		}
		if (pr.sorting) {
			result.sorting = RestClient.sortingRequestToString(pr.sorting);
		}
		return result;
	}

	/**
	 * Override this to customize http headers.
	 */
	getHeaders(): Promise<RestClientHeaders> {
		return Promise.resolve(
			{
				'Content-Type': 'application/json'
			}
		);
	}

	getUrl(endpoint: string) {
		return [StringUtil.trimSlashes(this.baseUrl), StringUtil.trimSlashes(endpoint)].join('/');
	}

	getRequestOptions(method: string = 'GET', data: object | null = null): Promise<any> {
		return this.getHeaders()
			.then(
				(headers) => {
					return {
						method: method,
						headers: headers,
						body: data === null ? null : JSON.stringify(data)
					};
				}
			);
	}

	processRequest(endpoint: string, requestOptions?: object): Promise<Response> {
		return fetch(this.getUrl(endpoint), requestOptions)
			.then((response) => {
				if (!response.ok) {
					const options = {cause: response.status};
					if (response.headers.get('Content-Type') === 'application/json') {
						return response
							.json()
							.then((json) => {
								if (json.message) {
									// @ts-ignore
									throw new Error(json.message, options);
								}
								if (json.error) {
									// @ts-ignore
									throw new Error(json.error, options);
								}
								// @ts-ignore
								throw new Error(response.statusText, options);
							}, () => {
								// @ts-ignore
								throw new Error(response.statusText, options);
							});
					} else {
						return response.text().then(
							(t) => {
								if (StringUtil.isEmpty(t)) {
									// @ts-ignore
									throw new Error(response.statusText, options);
								} else {
									// @ts-ignore
									throw new Error(t, options);
								}
							},
							() => {
								// @ts-ignore
								throw new Error(response.statusText, options);
							}
						);
					}
				}
				return response;
			});
	}

	processRequestJson(url: string, requestOptions?: object | undefined): Promise<any> {
		return this.processRequest(url, requestOptions)
			.then((response) => {
				return response.json();
			});
	}

	getJson(url: string, params?: any): Promise<any> {
		if (params) {
			const original = new URLSearchParams(params);
			const cleaned = new URLSearchParams();
			original.forEach((value, key) => {
				if (value !== '' && value !== undefined && value !== "undefined")
					cleaned.set(key, value);
			});
			url = `${url}?${cleaned.toString()}`;
		}
		return this.getRequestOptions().then(o => this.processRequestJson(url, o));
	}

	postJson(url: string, data: object | null = null): Promise<any> {
		return this.getRequestOptions('POST', data).then(o => this.processRequestJson(url, o));
	}

	putJson(url: string, data: object | null = null): Promise<any> {
		return this.getRequestOptions('PUT', data).then(o => this.processRequestJson(url, o));
	}

	get(url: string): Promise<Response> {
		return this.getRequestOptions().then(o => this.processRequest(url, o));
	}

	del(url: string): Promise<Response> {
		return this.getRequestOptions('DELETE').then(o => this.processRequest(url, o));
	}

	post(url: string, data: object | null = null): Promise<Response> {
		return this.getRequestOptions('POST', data).then(o => this.processRequest(url, o));
	}

	put(url: string, data: object | null = null): Promise<Response> {
		return this.getRequestOptions('PUT', data).then(o => this.processRequest(url, o));
	}

}
