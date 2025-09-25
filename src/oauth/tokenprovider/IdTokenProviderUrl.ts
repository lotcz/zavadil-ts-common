import {OAuthIdTokenProvider} from "./OAuthIdTokenProvider";
import {IdTokenPayload} from "../OAuthRestClient";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import {StringUtil} from "../../util";
import {UrlUtil} from "../../util";
import {RedirectionProvider} from "./RedirectionProvider";

export class IdTokenProviderUrl extends RedirectionProvider implements OAuthIdTokenProvider {

	client: RestClientWithOAuth;

	tokenQueryName: string;

	constructor(client: RestClientWithOAuth, tokenQueryName?: string) {
		super();
		this.client = client;
		this.tokenQueryName = tokenQueryName || 'token';
	}

	getIdTokenFromUrl(): string | null {
		return UrlUtil.extractParamFromUrl(document.location.toString(), this.tokenQueryName);
	}

	getIdToken(): Promise<IdTokenPayload> {
		const raw = this.getIdTokenFromUrl();
		if (raw === null || StringUtil.isBlank(raw)) return Promise.reject("No token in URL!");
		return this.client
			.getTokenManager()
			.then(m => m.verifyIdToken(raw));
    }

	reset(): Promise<any> {
		const raw = this.getIdTokenFromUrl();
		if (raw === null || StringUtil.isBlank(raw)) return Promise.resolve();
		console.log("Token in URL, redirecting...");
		const thisUrl = UrlUtil.deleteParamFromUrl(document.location.toString(), this.tokenQueryName);
		return this.redirectTo(thisUrl);
	}
}
