import {OAuthRefreshTokenProvider} from "./OAuthRefreshTokenProvider";
import {IdTokenPayload} from "../Types";
import {RedirectionProvider} from "./RedirectionProvider";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import {UrlUtil} from "../../util";

export class RefreshTokenProviderLogin extends RedirectionProvider implements OAuthRefreshTokenProvider {

	client: RestClientWithOAuth;

	tokenQueryName: string;

	constructor(client: RestClientWithOAuth, tokenQueryName?: string) {
		super();
		this.client = client;
		this.tokenQueryName = tokenQueryName || 'token';
	}

	redirectToLogin(): Promise<any> {
		return this.client.getServerInfo().then(
			(si) => {
				const thisUrl = UrlUtil.deleteParamFromUrl(document.location.toString(), this.tokenQueryName);
				const location = `${si.oauthServerUrl}/login?app_name=${si.targetAudience}&redirect_url=${thisUrl}`;
				return this.redirectTo(location);
			}
		).catch((err) => {
			console.error('Redirection failed: OAuth info not fetched:', err);
			return Promise.reject(err);
		});
	}

	getRefreshToken(): Promise<IdTokenPayload> {
        return this.redirectToLogin();
    }

	reset(): Promise<any> {
		return Promise.resolve();
	}
}
