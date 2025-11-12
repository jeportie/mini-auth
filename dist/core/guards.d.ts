import { AuthService } from "./AuthService.js";
import { Logger } from "../types/auth.js";
export interface GuardContext {
    path?: string;
}
export interface RequireAuthOptions {
    loginPath?: string;
    checkSessionFn?: () => Promise<boolean>;
    logger?: Logger | Console;
}
/**
 * Guard factory that ensures user authentication.
 * Handles session restoration, refresh, and redirection.
 */
export declare function requireAuth(auth: AuthService, { loginPath, checkSessionFn, logger }?: RequireAuthOptions): (ctx: GuardContext) => Promise<true | string>;
