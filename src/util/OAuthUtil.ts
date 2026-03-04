import {
  PermissionLevel,
  PERMISSION_LEVELS,
  TokenResponsePayloadBase,
} from "../oauth";
import { StringUtil } from "./StringUtil";
import { ObjectUtil } from "./ObjectUtil";

export class OAuthUtil {
  static isValidToken(token?: TokenResponsePayloadBase | null): boolean {
    return (
      ObjectUtil.notEmpty(token) &&
      StringUtil.notBlank(token.token) &&
      !OAuthUtil.isTokenExpired(token)
    );
  }

  static isTokenExpired(token?: TokenResponsePayloadBase | null): boolean {
    if (token === undefined || token === null) return false;
    if (token.expires === undefined || token.expires === null) return false;
    return token.expires < new Date();
  }

  static isTokenReadyForRefresh(
    token?: TokenResponsePayloadBase | null,
  ): boolean {
    if (token === undefined || token === null) return false;
    if (OAuthUtil.isTokenExpired(token)) return false;
    if (token.expires === undefined || token.expires === null) return false;
    const middle = new Date(
      (token.expires.getTime() + token.issuedAt.getTime()) / 2,
    );
    const now = new Date();
    return middle < now;
  }

  public static getScopeString(privilege: string, level: PermissionLevel) {
    return `${level}:${privilege}`;
  }

  public static extractPrivilege(scope: string): string {
    const arr = scope.split(":");
    if (arr.length < 2) return "";
    return arr[1];
  }

  public static isPermissionLevel(value: string): value is PermissionLevel {
    return (PERMISSION_LEVELS as readonly string[]).includes(value);
  }

  public static extractPermissionLevel(scope: string): PermissionLevel {
    const arr = scope.split(":");
    if (arr.length === 0) throw new Error(`Scope value ${scope} is invalid!`);
    const str = arr[0];
    if (!OAuthUtil.isPermissionLevel(str))
      throw new Error(`"${str} is not valid permission level!`);
    return str;
  }

  public static getLevel(level: PermissionLevel): number {
    switch (level) {
      case "admin":
        return 3;
      case "write":
        return 2;
      case "read":
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Returns true if given scope grants permission for specific privilege on at least required level.
   *
   * @param ownedScope        Existing scope, usually owned by user in form of access token
   * @param requiredScopeOrPrivilege Required privilege name or whole scope (omit minLevel)
   * @param minLevel          Required minimal permission level
   */
  public static hasPermission(
    ownedScope: string,
    requiredScopeOrPrivilege: string,
    minLevel?: PermissionLevel,
  ): boolean {
    if (minLevel === undefined) {
      try {
        minLevel = OAuthUtil.extractPermissionLevel(requiredScopeOrPrivilege);
        requiredScopeOrPrivilege = OAuthUtil.extractPrivilege(
          requiredScopeOrPrivilege,
        );
      } catch (e) {
        minLevel = "admin";
      }
    }

    const ownedLevel = OAuthUtil.extractPermissionLevel(ownedScope);
    // owned level must be at least equal to the required
    if (OAuthUtil.getLevel(ownedLevel) < OAuthUtil.getLevel(minLevel))
      return false;

    const ownedPrivilege = OAuthUtil.extractPrivilege(ownedScope);
    // super admin, has privilege for all resources
    if (ownedPrivilege === "*") return true;
    // user has exactly the required privilege
    if (ownedPrivilege === requiredScopeOrPrivilege) return true;
    // now the only possibility is that user has privilege ending with * covering the required privilege
    if (!ownedPrivilege?.endsWith("/*")) return false;

    const ownedParent = ownedPrivilege.replace("/*", "");
    return requiredScopeOrPrivilege?.startsWith(ownedParent) ?? false;
  }
}
