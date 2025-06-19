import {OAuthIdTokenProvider} from "./OAuthIdTokenProvider";
import {IdTokenPayload} from "../OAuthRestClient";
import {IdTokenProviderLogin} from "./IdTokenProviderLogin";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import {IdTokenProviderUrl} from "./IdTokenProviderUrl";
import {IdTokenProviderStorage} from "./IdTokenProviderStorage";

export class IdTokenProviderDefault implements OAuthIdTokenProvider {

	login: IdTokenProviderLogin;

	url: IdTokenProviderUrl;

	storage: IdTokenProviderStorage;

	constructor(client: RestClientWithOAuth, tokenStorageKey?: string, tokenUrlName?: string) {
		this.login = new IdTokenProviderLogin(client, tokenUrlName);
		this.url = new IdTokenProviderUrl(client, tokenUrlName);
		this.storage = new IdTokenProviderStorage(tokenStorageKey);
	}

	getIdToken(): Promise<IdTokenPayload> {
		return this.url
			.getIdToken()
			.catch(
				(err) => {
					console.log("No token in url, loading from storage:", err);
					return this.storage
						.getIdToken()
						.catch(
							(err) => {
								console.log("No token in storage, redirecting to login page:", err);
								return this.login.getIdToken();
							}
						);
				}
			)
			.then(
				(t) => {
					console.log("Token found, saving to storage...");
					this.storage.saveIdTokenToLocalStorage(t);
					// redirect if token is in url
					return this.url.reset().then(() => t);
				}
			);
    }

	reset(): Promise<any> {
		return this.storage.reset().then(() => this.url.reset());
	}

}
