import { StringUtil, PagingUtil, JsonUtil } from "../util";
import { PagingRequest } from "../type";

export type RequestOptions = RequestInit & {
	headers: Headers;
};

export class RestClient {

	private baseUrl: URL;

	constructor(baseUrl: string) {
		if (StringUtil.isBlank(baseUrl)) {
			this.baseUrl = RestClient.baseHostUrl();
			return;
		}
		if (!baseUrl.endsWith('/')) baseUrl = baseUrl + '/';
		this.baseUrl = baseUrl.startsWith("http") ? new URL(baseUrl) : new URL(baseUrl, RestClient.baseHostUrl());
	}

	static baseHostUrl(): URL {
		return new URL(`${window.location.protocol}//${window.location.host}/`);
	}

	static pagingRequestToQueryParams(pr?: PagingRequest | null): any {
		return PagingUtil.pagingRequestToQueryParams(pr);
	}

	static paramsToQueryString(params?: any): string {
		if (!params) return '';
		const original = new URLSearchParams(params);
		const cleaned = new URLSearchParams();
		original.forEach((value, key) => {
			if (value !== '' && value !== undefined && value !== "undefined")
				cleaned.set(key, value);
		});
		const str = cleaned.toString();
		return StringUtil.isEmpty(str) ? '' : `?${str}`;
	}

	/**
	 * Override this to customize http headers.
	 */
	getHeaders(endpoint: string): Promise<Headers> {
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		return Promise.resolve(headers);
	}

	getBaseUrl(): URL {
		return this.baseUrl;
	}

	getUrl(endpoint: string, params?: any): URL {
		const url = new URL(StringUtil.trimLeadingSlashes(endpoint), this.baseUrl);
		if (params) {
			Object.keys(params).forEach((key) => {
				const value = params[key];
				if (value !== '' && value !== undefined && value !== "undefined")
					url.searchParams.set(key, value);
			});
		}
		return url;
	}

	getRequestOptions(endpoint: string, method: string = 'GET', data: object | null = null): Promise<RequestOptions> {
		return this.getHeaders(endpoint)
			.then(
				(headers) => {
					return {
						method: method,
						headers: headers,
						body: (data === null) ? null
							: (data instanceof FormData) ? data : JSON.stringify(data)
					};
				}
			);
	}

	processRequest(endpoint: string, params?: any, requestOptions?: RequestOptions): Promise<Response> {
		return fetch(this.getUrl(endpoint, params), requestOptions)
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

	processRequestJson(endpoint: string, params?: any, requestOptions?: RequestOptions): Promise<any> {
		return this.processRequest(endpoint, params, requestOptions)
			.then((response) => {
				return response.text().then(JsonUtil.parseWithDates);
			});
	}

	getJson(url: string, params?: any): Promise<any> {
		return this.getRequestOptions(url).then(o => this.processRequestJson(url, params, o));
	}

	postJson(url: string, data: object | null = null): Promise<any> {
		return this.getRequestOptions(url, 'POST', data).then(o => this.processRequestJson(url, null, o));
	}

	postForm(url: string, data: FormData): Promise<Response> {
		return this.getRequestOptions(url, 'POST', data)
			.then(o => {
				o.headers.delete('Content-Type'); // content type with boundary value will be auto-generated
				return this.processRequest(url, null, o);
			});
	}

	postFormJson(url: string, data: FormData): Promise<any> {
		return this.getRequestOptions(url, 'POST', data)
			.then(o => {
				o.headers.delete('Content-Type'); // content type with boundary value will be auto-generated
				return this.processRequestJson(url, null, o);
			});
	}

	putJson(url: string, data: object | null = null): Promise<any> {
		return this.getRequestOptions(url, 'PUT', data).then(o => this.processRequestJson(url, null, o));
	}

	get(endpoint: string, params?: any): Promise<Response> {
		return this.getRequestOptions(endpoint).then(o => this.processRequest(endpoint, params, o));
	}

	del(url: string): Promise<Response> {
		return this.getRequestOptions(url, 'DELETE').then(o => this.processRequest(url, null, o));
	}

	post(url: string, data: object | null = null): Promise<Response> {
		return this.getRequestOptions(url, 'POST', data).then(o => this.processRequest(url, null, o));
	}

	put(url: string, data: object | null = null): Promise<Response> {
		return this.getRequestOptions(url, 'PUT', data).then(o => this.processRequest(url, null, o));
	}

}
