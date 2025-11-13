// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   AuthService.ts                                     :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: jeportie <jeportie@42.fr>                  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/09/15 12:18:11 by jeportie          #+#    #+#             //
//   Updated: 2025/11/12 17:20:00 by jeportie         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //
function hasWithPrefix(logger) {
    return typeof logger?.withPrefix === "function";
}
/**
 * Generic authentication service.
 * - Stores and retrieves JWT tokens.
 * - Persists a "has session" flag in localStorage.
 * - Can auto-refresh using a caller-provided refreshFn.
 * - Logs through a configurable logger (default = console).
 */
export class AuthService {
    token = null;
    storageKey;
    refreshFn;
    logger;
    constructor({ storageKey = "session", refreshFn, logger = console } = {}) {
        this.storageKey = storageKey;
        this.refreshFn = refreshFn;
        const baseLogger = logger ?? console;
        this.logger = hasWithPrefix(baseLogger)
            ? baseLogger.withPrefix("[Auth]")
            : baseLogger;
        this.logger.debug?.("AuthService initialized with storageKey:", this.storageKey);
    }
    // ------------------------------------------------------------------------ //
    // Initialization (refresh-first boot)
    // ------------------------------------------------------------------------ //
    async init() {
        try {
            this.logger.debug?.("Boot: trying refreshFn to restore session…");
            const newToken = await this.refreshFn?.();
            if (newToken) {
                this.setToken(newToken);
                this.logger.info?.("✅ Session restored via refresh cookie");
                return true;
            }
            this.logger.warn?.("⚠️ refreshFn returned no token – clearing session");
            this.clear();
            return false;
        }
        catch (err) {
            this.logger.error?.("❌ Refresh exception during init():", err);
            this.clear();
            return false;
        }
    }
    async refresh() {
        try {
            this.logger.debug?.("Manual token refresh requested...");
            const newToken = await this.refreshFn?.();
            if (newToken) {
                this.setToken(newToken);
                this.logger.info?.("Token refreshed successfully.");
                return newToken;
            }
            this.logger.warn?.("refreshFn returned no token.");
            return null;
        }
        catch (err) {
            this.logger.error?.("Refresh exception:", err);
            return null;
        }
    }
    // ------------------------------------------------------------------------
    // Token Management
    // ------------------------------------------------------------------------
    isLoggedIn() {
        return !!this.token;
    }
    getToken() {
        return this.token;
    }
    setToken(token) {
        this.token = token;
        this.logger.debug?.(token ? "Token set (no storage flag)"
            : "Token cleared (no storage flag)");
    }
    clear() {
        this.token = null;
        this.logger.info?.("Session cleared.");
    }
    // ------------------------------------------------------------------------
    // Token Expiration
    // ------------------------------------------------------------------------
    isTokenExpired(skewSec = 10) {
        const t = this.token;
        if (!t) {
            this.logger.debug?.("Token is null → expired = true");
            return true;
        }
        const parts = t.split(".");
        if (parts.length !== 3) {
            this.logger.warn?.("Invalid token format.");
            return true;
        }
        try {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp ?? 0;
            const expired = exp <= (now + skewSec);
            this.logger.debug?.(`Token exp = ${exp}, now = ${now}, expired = ${expired}`);
            return expired;
        }
        catch (err) {
            this.logger.error?.("Error parsing token payload:", err);
            return true;
        }
    }
}
