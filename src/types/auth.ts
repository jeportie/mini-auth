// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   auth.ts                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: jeportie <jeportie@42.fr>                  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 16:24:14 by jeportie          #+#    #+#             //
//   Updated: 2025/11/12 17:20:00 by jeportie         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/** Shared logger interface (compatible with your frontend logger). */
export interface Logger {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    setLevel?: (level: LogLevel) => void;
    withPrefix?: (prefix: string) => Logger;
}

export interface AuthOptions {
    storageKey?: string;
    refreshFn?: () => Promise<string | null>;
    logger?: Logger | Console;
}
