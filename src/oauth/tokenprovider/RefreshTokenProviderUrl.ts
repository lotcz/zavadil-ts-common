import {OAuthRefreshTokenProvider} from "./OAuthRefreshTokenProvider";
import {RefreshTokenPayload} from "../OAuthRestClient";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import {StringUtil} from "../../util";
import {UrlUtil} from "../../util";
import {RedirectionProvider} from "./RedirectionProvider";

export class RefreshTokenProviderUrl extends RedirectionProvider implements OAuthRefreshTokenProvider {

	client: RestClientWithOAuth;

	tokenQueryName: string;

	constructor(client: RestClientWithOAuth, tokenQueryName?: string) {
		super();
		this.client = client;
		this.tokenQueryName = tokenQueryName || 'token';
	}

	getRefreshTokenFromUrl(): string | null {
		return UrlUtil.extractParamFromUrl(document.location.toString(), this.tokenQueryName);
	}

	getRefreshToken(): Promise<RefreshTokenPayload> {
		const raw = this.getRefreshTokenFromUrl();
		if (raw === null || StringUtil.isBlank(raw)) return Promise.reject("No token in URL!");
		return this.client
			.getTokenManager()
			.then(m => m.verifyRefreshToken(raw));
    }

	reset(): Promise<any> {
		const raw = this.getRefreshTokenFromUrl();
		if (raw === null || StringUtil.isBlank(raw)) return Promise.resolve();
		console.log("Token in URL, redirecting...");
		const thisUrl = UrlUtil.deleteParamFromUrl(document.location.toString(), this.tokenQueryName);
		return this.redirectTo(thisUrl);
	}
}
