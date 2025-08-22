import chalk from 'chalk';

export enum LogLevelEnum {
    DEBUG = 1,
    SYSTEM = 2,
    INFO = 3,
    WARN = 5,
    ERROR = 6,
}

export class Log {
    private static logLevel: number = LogLevelEnum.INFO

    public static setLogLevel(level: LogLevelEnum) {
        Log.logLevel = level
    }

    private static getLogTimestamp(printDate = true) {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        const time = `${hours}:${minutes}:${seconds}.${milliseconds}`

        if (printDate) {
            return `${date} ${time}`
        }

        return time;
    }

    private static logWithColor(colorFn: (text: string) => string, prefix: string, ...params: any[]) {
        console.log(
            chalk.bgGray(Log.getLogTimestamp()),
            colorFn(prefix),
            ...params);
    }

    public static debug(...params: any[]) {
        if (Log.logLevel > LogLevelEnum.DEBUG) {
            return
        }

        this.logWithColor(chalk.gray, '[DBUG]', ...params);
    }

    public static system(...params: any[]) {
        if (Log.logLevel > LogLevelEnum.SYSTEM) {
            return
        }

        this.logWithColor(chalk.gray, '[SYST]', ...params);
    }

    public static info(...params: any[]) {
        if (Log.logLevel > LogLevelEnum.INFO) {
            return
        }

        this.logWithColor(chalk.blue, '[INFO]', ...params);
    }

    public static warn(...params: any[]) {
        if (Log.logLevel > LogLevelEnum.WARN) {
            return
        }

        this.logWithColor(chalk.yellow, '[WARN]', ...params);
    }

    public static error(...params: any[]) {
        if (Log.logLevel > LogLevelEnum.ERROR) {
            return
        }

        this.logWithColor(chalk.red, '[ERRO]', ...params);
    }

    public static todo(...params: any[]) {
        this.logWithColor(chalk.greenBright, '[TODO]', ...params);
    }
}