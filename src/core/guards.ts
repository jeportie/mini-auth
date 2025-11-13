// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   guards.ts                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: jeportie <jeportie@42.fr>                  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/09/15 13:44:06 by jeportie          #+#    #+#             //
//   Updated: 2025/11/12 17:20:00 by jeportie         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { AuthService } from "./AuthService.js";
import { Logger } from "../types/auth.js";

function hasWithPrefix(logger: any): logger is { withPrefix: (prefix: string) => any } {
    return typeof logger?.withPrefix === "function";
}

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
export function requireAuth(
    auth: AuthService,
    { loginPath = "/login", checkSessionFn, logger = console }: RequireAuthOptions = {}
) {
    const baseLogger = logger ?? console;
    const log = hasWithPrefix(baseLogger)
        ? baseLogger.withPrefix("[Guard]")
        : baseLogger;

    return async function(ctx: GuardContext): Promise<true | string> {
        log.info?.("Checking auth for:", ctx?.path);

        const wanted = `${ctx?.path || location.pathname}${location.search || ""}${location.hash || ""}`;
        const next = encodeURIComponent(wanted);

        if (!auth.isLoggedIn()) {
            log.warn?.("User not logged in.");
            return `${loginPath}?next=${next}`;
        }

        if (auth.isTokenExpired()) {
            log.info?.("Token expired — attempting refresh...");
            const ok = await auth.init();

            if (!ok) {
                log.warn?.("Token refresh failed.");
                return `${loginPath}?next=${next}`;
            }
        }

        if (typeof checkSessionFn === "function") {
            try {
                const valid = await checkSessionFn();

                if (valid) {
                    log.info?.("Session check OK.");
                    return true;
                }

                log.warn?.("Session check returned false.");
            } catch (err) {
                log.error?.("checkSessionFn exception:", err);
            }

            auth.clear();
            return `${loginPath}?next=${next}`;
        }

        log.debug?.("No custom session check provided — allowing route.");
        return true;
    };
}
