import {TokenResponsePayloadBase} from "../oauth";
import {StringUtil} from "./StringUtil";

export class OAuthUtil {

	static isValidToken(token?: TokenResponsePayloadBase | null): boolean {
		return token !== undefined && token !== null && StringUtil.notEmpty(token.token) && !OAuthUtil.isTokenExpired(token);
	}

	static isTokenExpired(token?: TokenResponsePayloadBase | null): boolean {
		if (token === undefined || token === null) return false;
		if (token.expires === undefined || token.expires === null) return false;
		return (token.expires < new Date());
	}

	static isTokenReadyForRefresh(token?: TokenResponsePayloadBase | null): boolean {
		if (token === undefined || token === null) return false;
		if (OAuthUtil.isTokenExpired(token)) return false;
		if (token.expires === undefined || token.expires === null) return false;
		const middle = new Date((token.expires.getTime() + token.issuedAt.getTime()) / 2);
		const now = new Date();
		return (middle < now);
	}
}
