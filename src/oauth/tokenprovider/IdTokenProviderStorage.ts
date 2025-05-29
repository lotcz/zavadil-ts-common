import {OAuthIdTokenProvider} from "./OAuthIdTokenProvider";
import {IdTokenPayload} from "../OAuthRestClient";
import {JsonUtil} from "../../util";
import {OAuthUtil} from "../../util/OAuthUtil";

export class IdTokenProviderStorage implements OAuthIdTokenProvider {

	key: string;

	constructor(storageKey?: string) {
		this.key = storageKey || '';
	}

	saveIdTokenToLocalStorage(token: IdTokenPayload | null) {
		const raw = token ? JSON.stringify(token) : null;
		if (raw === null) {
			localStorage.removeItem(this.key);
			return;
		}
		localStorage.setItem(this.key, raw);
	}

	getIdTokenFromLocalStorage(): IdTokenPayload | null | undefined {
		return JsonUtil.parse(localStorage.getItem(this.key));
	}

	getIdToken(): Promise<IdTokenPayload> {
        const token = this.getIdTokenFromLocalStorage();
		if (token && OAuthUtil.isValidToken(token)) return Promise.resolve(token);
		return Promise.reject("No valid token found in storage!");
    }

}
