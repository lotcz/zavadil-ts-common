import {OAuthRefreshTokenProvider} from "./OAuthRefreshTokenProvider";
import {IdTokenPayload} from "../Types";
import {RefreshTokenProviderLogin} from "./RefreshTokenProviderLogin";
import {RestClientWithOAuth} from "../RestClientWithOAuth";
import {RefreshTokenProviderUrl} from "./RefreshTokenProviderUrl";
import {RefreshTokenProviderStorage} from "./RefreshTokenProviderStorage";

export class RefreshTokenProviderDefault implements OAuthRefreshTokenProvider {

	login: RefreshTokenProviderLogin;

	url: RefreshTokenProviderUrl;

	storage: RefreshTokenProviderStorage;

	constructor(client: RestClientWithOAuth, tokenStorageKey?: string, tokenUrlName?: string) {
		this.login = new RefreshTokenProviderLogin(client, tokenUrlName);
		this.url = new RefreshTokenProviderUrl(client, tokenUrlName);
		this.storage = new RefreshTokenProviderStorage(tokenStorageKey);
	}

	getRefreshToken(): Promise<IdTokenPayload> {
		return this.url
			.getRefreshToken()
			.catch(
				(err) => {
					console.log("No token in url, loading from storage:", err);
					return this.storage
						.getRefreshToken()
						.catch(
							(err) => {
								console.log("No token in storage, redirecting to login page:", err);
								return this.login.getRefreshToken();
							}
						);
				}
			)
			.then(
				(t) => {
					console.log("Token found, saving to storage...");
					this.storage.saveRefreshTokenToLocalStorage(t);
					// redirect if token is in url
					return this.url.reset().then(() => t);
				}
			);
    }

	reset(): Promise<any> {
		return this.storage.reset().then(() => this.url.reset());
	}

}
