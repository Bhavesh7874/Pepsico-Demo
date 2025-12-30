import { Injectable, isDevMode } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private prefix = '[PEPSICO-APP]';

    info(message: string, ...args: any[]) {
        this.log('color: #004b93; font-weight: bold;', 'INFO', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log('color: #fdbb2d; font-weight: bold;', 'WARN', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log('color: #e32934; font-weight: bold;', 'ERROR', message, ...args);
    }

    debug(message: string, ...args: any[]) {
        if (isDevMode()) {
            this.log('color: #8b949e; font-style: italic;', 'DEBUG', message, ...args);
        }
    }

    private log(style: string, level: string, message: string, ...args: any[]) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(
            `%c${this.prefix} [${timestamp}] [${level}] %c${message}`,
            'color: #fff; background: #000; padding: 2px 4px; border-radius: 3px;',
            style,
            ...args
        );
    }
}
