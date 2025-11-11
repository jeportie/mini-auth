import { AuthService } from "./AuthService.js";
export interface GuardContext {
    path?: string;
}
export interface RequireAuthOptions {
    loginPath?: string;
    checkSessionFn?: () => Promise<boolean>;
    logger?: Console;
}
export declare function requireAuth(auth: AuthService, { loginPath, checkSessionFn, logger }?: RequireAuthOptions): (ctx: GuardContext) => Promise<true | string>;
