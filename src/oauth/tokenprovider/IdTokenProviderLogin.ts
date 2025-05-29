import {OAuthIdTokenProvider} from "./OAuthIdTokenProvider";
import {IdTokenPayload} from "../OAuthRestClient";
import {RedirectionProvider} from "./RedirectionProvider";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import UrlUtil from "../../util/UrlUtil";

export class IdTokenProviderLogin extends RedirectionProvider implements OAuthIdTokenProvider {

	client: RestClientWithOAuth;

	tokenQueryName: string;

	constructor(client: RestClientWithOAuth, tokenQueryName?: string) {
		super();
		this.client = client;
		this.tokenQueryName = tokenQueryName || 'token';
	}

	/**
	 * Attempt to get ID token from URL or storage, redirect to login page when not successful
	 */
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

	getIdToken(): Promise<IdTokenPayload> {
        return this.redirectToLogin();
    }

}
