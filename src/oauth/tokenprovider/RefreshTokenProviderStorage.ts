import {OAuthRefreshTokenProvider} from "./OAuthRefreshTokenProvider";
import {RefreshTokenPayload} from "../Types";
import {JsonUtil} from "../../util";
import {OAuthUtil} from "../OAuthUtil";

export class RefreshTokenProviderStorage implements OAuthRefreshTokenProvider {

	key: string;

	constructor(storageKey?: string) {
		this.key = storageKey || 'refresh-token';
	}

	saveRefreshTokenToLocalStorage(token: RefreshTokenPayload | null) {
		const raw = token ? JSON.stringify(token) : null;
		if (raw === null) {
			localStorage.removeItem(this.key);
			return;
		}
		localStorage.setItem(this.key, raw);
	}

	getRefreshTokenFromLocalStorage(): RefreshTokenPayload | null | undefined {
		return JsonUtil.parse(localStorage.getItem(this.key));
	}

	getRefreshToken(): Promise<RefreshTokenPayload> {
        const token = this.getRefreshTokenFromLocalStorage();
		if (token && OAuthUtil.isValidToken(token)) return Promise.resolve(token);
		return Promise.reject("No valid token found in storage!");
    }

	reset(): Promise<any> {
		this.saveRefreshTokenToLocalStorage(null);
		return Promise.resolve();
	}
}
